from datetime import datetime, timezone
from functools import wraps

from bson import ObjectId
from bson.errors import InvalidId
from flask import Blueprint, request
from pymongo.errors import DuplicateKeyError

from ..extensions import mongo
from ..utils.auth import get_current_user, permission_required
from ..utils.response import failure, success
from ..services.notification_service import create_notification, notify_mentions


feed_bp = Blueprint("feed", __name__)


def authenticated_feed_user(view):
    """Require any active signed-in account, regardless of its role."""
    @wraps(view)
    def wrapped(*args, **kwargs):
        user = get_current_user()
        if not user:
            return failure("Authenticated user not found.", 401)
        if not user.get("is_active", True):
            return failure("Your account is inactive.", 403)
        return view(user, *args, **kwargs)
    return wrapped


def parse_id(value):
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


def iso(value):
    return value.isoformat() if hasattr(value, "isoformat") else value


def post_response(post, author, reaction_count, comment_count, reacted, saved=False):
    return {
        "_id": str(post["_id"]),
        "body": post.get("body", ""),
        "created_at": iso(post.get("created_at")),
        "author": {
            "_id": str(author["_id"]) if author else None,
            "name": author.get("name", "CampusConnect member") if author else "CampusConnect member",
            "username": author.get("username", "") if author else "",
            "role": author.get("role", "student") if author else "student",
        },
        "reaction_count": reaction_count,
        "comment_count": comment_count,
        "reacted_by_me": reacted,
        "saved_by_me": saved,
    }


def serialize_posts(posts, current_user_id, current_saved_ids=None):
    if not posts:
        return []
    post_ids = [post["_id"] for post in posts]
    author_ids = list({post["author_id"] for post in posts})
    authors = {
        user["_id"]: user
        for user in mongo.db.users.find(
            {"_id": {"$in": author_ids}},
            {"name": 1, "role": 1, "username": 1},
        )
    }
    reactions = {
        row["_id"]: row["count"]
        for row in mongo.db.feed_reactions.aggregate([
            {"$match": {"post_id": {"$in": post_ids}}},
            {"$group": {"_id": "$post_id", "count": {"$sum": 1}}},
        ])
    }
    comments = {
        row["_id"]: row["count"]
        for row in mongo.db.feed_comments.aggregate([
            {"$match": {"post_id": {"$in": post_ids}, "is_deleted": {"$ne": True}}},
            {"$group": {"_id": "$post_id", "count": {"$sum": 1}}},
        ])
    }
    own_reactions = {
        reaction["post_id"]
        for reaction in mongo.db.feed_reactions.find(
            {"post_id": {"$in": post_ids}, "user_id": current_user_id},
            {"post_id": 1},
        )
    }
    return [
        post_response(
            post,
            authors.get(post["author_id"]),
            reactions.get(post["_id"], 0),
            comments.get(post["_id"], 0),
            post["_id"] in own_reactions,
            post["_id"] in (current_saved_ids or set()),
        )
        for post in posts
    ]


@feed_bp.get("")
@authenticated_feed_user
def get_feed(user):
    try:
        limit = min(max(int(request.args.get("limit", 20)), 1), 50)
    except (TypeError, ValueError):
        return failure("The page size must be a number.", 400)

    conditions = [{"status": {"$ne": "removed"}}]
    blocked_ids = [
        block["blocked_user_id"]
        for block in mongo.db.feed_blocks.find({"blocker_id": user["_id"]}, {"blocked_user_id": 1})
    ]
    if blocked_ids:
        conditions.append({"author_id": {"$nin": blocked_ids}})

    if request.args.get("saved", "").lower() in {"1", "true", "yes"}:
        saved_ids = [
            saved["post_id"]
            for saved in mongo.db.feed_saves.find({"user_id": user["_id"]}, {"post_id": 1})
        ]
        if not saved_ids:
            return success({"posts": [], "next_cursor": None, "has_more": False}, "Saved posts fetched.")
        conditions.append({"_id": {"$in": saved_ids}})

    before = request.args.get("before")
    if before:
        before_id = parse_id(before)
        if not before_id:
            return failure("Invalid feed cursor.", 400)
        anchor = mongo.db.feed_posts.find_one({"_id": before_id}, {"created_at": 1})
        if anchor and anchor.get("created_at"):
            conditions.append({"$or": [
                {"created_at": {"$lt": anchor["created_at"]}},
                {"created_at": anchor["created_at"], "_id": {"$lt": before_id}},
            ]})
        else:
            conditions.append({"_id": {"$lt": before_id}})

    query = {"$and": conditions} if len(conditions) > 1 else (conditions[0] if conditions else {})

    try:
        page = list(
            mongo.db.feed_posts.find(query)
            .sort([("created_at", -1), ("_id", -1)])
            .limit(limit + 1)
        )
        has_more = len(page) > limit
        page = page[:limit]
        saved_ids = {
            saved["post_id"]
            for saved in mongo.db.feed_saves.find(
                {"user_id": user["_id"], "post_id": {"$in": [post["_id"] for post in page]}},
                {"post_id": 1},
            )
        } if page else set()
        serialized = serialize_posts(page, user["_id"], saved_ids)
        return success({
            "posts": serialized,
            "next_cursor": page[-1]["_id"].__str__() if has_more and page else None,
            "has_more": has_more,
        }, "Feed fetched.")
    except Exception:
        return failure("Unable to load the feed right now.", 500)


@feed_bp.post("")
@authenticated_feed_user
def create_post(user):
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return failure("A post body is required.", 400)
    body = str(data.get("body", "")).strip()
    if not body:
        return failure("Write something before publishing your post.", 400)
    if len(body) > 5000:
        return failure("Posts must be 5,000 characters or fewer.", 400)

    now = datetime.now(timezone.utc)
    post = {"author_id": user["_id"], "body": body, "created_at": now, "updated_at": now}
    try:
        result = mongo.db.feed_posts.insert_one(post)
        post["_id"] = result.inserted_id
        notify_mentions(body, user)
        return success({
            "post": post_response(post, user, 0, 0, False, False),
        }, "Post shared with the campus.", 201)
    except Exception:
        return failure("Unable to publish your post right now.", 500)


@feed_bp.post("/<post_id>/reactions")
@authenticated_feed_user
def toggle_reaction(user, post_id):
    object_id = parse_id(post_id)
    if not object_id:
        return failure("Invalid post ID.", 400)
    if not mongo.db.feed_posts.find_one({"_id": object_id}, {"_id": 1}):
        return failure("Post not found.", 404)
    post = mongo.db.feed_posts.find_one({"_id": object_id}, {"author_id": 1, "body": 1})

    key = {"post_id": object_id, "user_id": user["_id"]}
    existing = mongo.db.feed_reactions.find_one(key)
    try:
        if existing:
            mongo.db.feed_reactions.delete_one({"_id": existing["_id"]})
            reacted = False
        else:
            mongo.db.feed_reactions.insert_one({**key, "created_at": datetime.now(timezone.utc)})
            reacted = True
            if post.get("author_id") != user["_id"]:
                create_notification(
                    "Your post got a like",
                    f"{user.get('name', 'A campus member')} liked your post.",
                    "post_like",
                    "/dashboard/feed",
                    user_id=post["author_id"],
                    actor_id=user["_id"],
                )
    except DuplicateKeyError:
        reacted = True
    except Exception:
        return failure("Unable to update your reaction right now.", 500)

    count = mongo.db.feed_reactions.count_documents({"post_id": object_id})
    return success({"reacted": reacted, "reaction_count": count}, "Reaction updated.")


@feed_bp.post("/<post_id>/save")
@authenticated_feed_user
def toggle_saved_post(user, post_id):
    object_id = parse_id(post_id)
    if not object_id:
        return failure("Invalid post ID.", 400)
    if not mongo.db.feed_posts.find_one({"_id": object_id, "status": {"$ne": "removed"}}, {"_id": 1}):
        return failure("Post not found.", 404)
    key = {"post_id": object_id, "user_id": user["_id"]}
    try:
        existing = mongo.db.feed_saves.find_one(key)
        if existing:
            mongo.db.feed_saves.delete_one({"_id": existing["_id"]})
            saved = False
        else:
            mongo.db.feed_saves.insert_one({**key, "created_at": datetime.now(timezone.utc)})
            saved = True
    except DuplicateKeyError:
        saved = True
    except Exception:
        return failure("Unable to update your saved posts right now.", 500)
    return success({"saved": saved}, "Saved posts updated.")


@feed_bp.post("/<post_id>/report")
@authenticated_feed_user
def report_post(user, post_id):
    object_id = parse_id(post_id)
    if not object_id:
        return failure("Invalid post ID.", 400)
    post = mongo.db.feed_posts.find_one({"_id": object_id, "status": {"$ne": "removed"}})
    if not post:
        return failure("Post not found.", 404)
    if post["author_id"] == user["_id"]:
        return failure("You cannot report your own post.", 400)
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return failure("Choose a reason for reporting this post.", 400)
    reason = str(data.get("reason", "")).strip()
    allowed_reasons = {"spam", "harassment", "inappropriate", "misinformation", "other"}
    if reason not in allowed_reasons:
        return failure("Choose a valid report reason.", 400)
    details = str(data.get("details", "")).strip()
    if len(details) > 1000:
        return failure("Report details must be under 1,000 characters.", 400)
    try:
        mongo.db.feed_reports.insert_one({
            "post_id": object_id,
            "reporter_id": user["_id"],
            "reason": reason,
            "details": details,
            "status": "open",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        })
    except DuplicateKeyError:
        return failure("You have already reported this post.", 409)
    except Exception:
        return failure("Unable to submit your report right now.", 500)
    create_notification("New feed report", "A Campus Feed post was reported and needs review.", "moderation", "/dashboard/admin/feed-reports", roles=["admin"], actor_id=user["_id"])
    return success({}, "Report sent to the CampusConnect admins.", 201)


@feed_bp.post("/<post_id>/block")
@authenticated_feed_user
def toggle_blocked_author(user, post_id):
    object_id = parse_id(post_id)
    if not object_id:
        return failure("Invalid post ID.", 400)
    post = mongo.db.feed_posts.find_one({"_id": object_id}, {"author_id": 1})
    if not post:
        return failure("Post not found.", 404)
    blocked_user_id = post["author_id"]
    if blocked_user_id == user["_id"]:
        return failure("You cannot block your own account.", 400)
    key = {"blocker_id": user["_id"], "blocked_user_id": blocked_user_id}
    try:
        existing = mongo.db.feed_blocks.find_one(key)
        if existing:
            mongo.db.feed_blocks.delete_one({"_id": existing["_id"]})
            blocked = False
        else:
            mongo.db.feed_blocks.insert_one({**key, "created_at": datetime.now(timezone.utc)})
            blocked = True
    except DuplicateKeyError:
        blocked = True
    except Exception:
        return failure("Unable to update your blocked users right now.", 500)
    return success({"blocked": blocked, "blocked_user_id": str(blocked_user_id)}, "Blocked users updated.")


@feed_bp.get("/blocked-users")
@authenticated_feed_user
def list_blocked_users(user):
    records = list(mongo.db.feed_blocks.find({"blocker_id": user["_id"]}).sort("created_at", -1))
    ids = list({record["blocked_user_id"] for record in records})
    users = {item["_id"]: item for item in mongo.db.users.find({"_id": {"$in": ids}}, {"name": 1, "role": 1})} if ids else {}
    return success({"users": [{
        "_id": str(record["blocked_user_id"]),
        "name": users.get(record["blocked_user_id"], {}).get("name", "CampusConnect member"),
        "role": users.get(record["blocked_user_id"], {}).get("role", "student"),
    } for record in records]}, "Blocked users fetched.")


@feed_bp.delete("/blocked-users/<user_id>")
@authenticated_feed_user
def unblock_user(user, user_id):
    object_id = parse_id(user_id)
    if not object_id:
        return failure("Invalid user ID.", 400)
    result = mongo.db.feed_blocks.delete_one({"blocker_id": user["_id"], "blocked_user_id": object_id})
    if result.deleted_count == 0:
        return failure("Blocked user not found.", 404)
    return success({}, "User unblocked.")


@feed_bp.get("/<post_id>/comments")
@authenticated_feed_user
def get_comments(user, post_id):
    object_id = parse_id(post_id)
    if not object_id:
        return failure("Invalid post ID.", 400)
    if not mongo.db.feed_posts.find_one({"_id": object_id}, {"_id": 1}):
        return failure("Post not found.", 404)
    try:
        records = list(
            mongo.db.feed_comments.find({"post_id": object_id})
            .sort([("created_at", -1), ("_id", -1)])
            .limit(100)
        )
        records_by_id = {record["_id"]: record for record in records}
        for _ in range(8):
            missing_parents = {
                record.get("parent_comment_id")
                for record in records_by_id.values()
                if record.get("parent_comment_id") and record["parent_comment_id"] not in records_by_id
            }
            if not missing_parents:
                break
            for parent in mongo.db.feed_comments.find({"_id": {"$in": list(missing_parents)}, "post_id": object_id}):
                records_by_id[parent["_id"]] = parent
        records = sorted(records_by_id.values(), key=lambda record: (record.get("created_at").isoformat() if hasattr(record.get("created_at"), "isoformat") else str(record.get("created_at", "")), str(record["_id"])))
        authors_by_id = {
            author["_id"]: author
            for author in mongo.db.users.find(
                {"_id": {"$in": list({record["author_id"] for record in records})}},
                {"name": 1, "role": 1, "username": 1},
            )
        } if records else {}
        comment_ids = [record["_id"] for record in records]
        reaction_counts = {
            row["_id"]: row["count"]
            for row in mongo.db.feed_comment_reactions.aggregate([
                {"$match": {"comment_id": {"$in": comment_ids}}},
                {"$group": {"_id": "$comment_id", "count": {"$sum": 1}}},
            ])
        } if comment_ids else {}
        own_reactions = {
            reaction["comment_id"]
            for reaction in mongo.db.feed_comment_reactions.find(
                {"comment_id": {"$in": comment_ids}, "user_id": user["_id"]},
                {"comment_id": 1},
            )
        } if comment_ids else set()
        comments = [{
            "_id": str(record["_id"]),
            "body": record["body"],
            "is_deleted": bool(record.get("is_deleted", False)),
            "parent_comment_id": str(record["parent_comment_id"]) if record.get("parent_comment_id") else None,
            "reply_to_user_id": str(record["reply_to_user_id"]) if record.get("reply_to_user_id") else None,
            "reply_to_name": record.get("reply_to_name"),
            "created_at": iso(record.get("created_at")),
            "reaction_count": reaction_counts.get(record["_id"], 0),
            "reacted_by_me": record["_id"] in own_reactions,
            "author": {
                "_id": str(authors_by_id[record["author_id"]]["_id"]),
                "name": authors_by_id[record["author_id"]].get("name", "CampusConnect member"),
                "username": authors_by_id[record["author_id"]].get("username", ""),
            } if record["author_id"] in authors_by_id else {"_id": None, "name": "CampusConnect member"},
        } for record in records]
        return success({"comments": comments}, "Comments fetched.")
    except Exception:
        return failure("Unable to load comments right now.", 500)


@feed_bp.post("/<post_id>/comments")
@authenticated_feed_user
def create_comment(user, post_id):
    object_id = parse_id(post_id)
    if not object_id:
        return failure("Invalid post ID.", 400)
    post = mongo.db.feed_posts.find_one({"_id": object_id}, {"_id": 1, "author_id": 1})
    if not post:
        return failure("Post not found.", 404)
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return failure("A comment body is required.", 400)
    body = str(data.get("body", "")).strip()
    if not body:
        return failure("Write a comment before submitting.", 400)
    if len(body) > 2000:
        return failure("Comments must be 2,000 characters or fewer.", 400)

    parent_comment_id = None
    comment_depth = 0
    parent_value = data.get("parent_comment_id")
    parent = None
    if parent_value:
        parent_comment_id = parse_id(parent_value)
        if not parent_comment_id:
            return failure("Invalid parent comment ID.", 400)
        parent = mongo.db.feed_comments.find_one({"_id": parent_comment_id, "post_id": object_id, "is_deleted": {"$ne": True}})
        if not parent:
            return failure("Parent comment not found for this post.", 404)
        comment_depth = int(parent.get("depth", 0)) + 1
        if comment_depth > 8:
            return failure("Replies can be nested up to eight levels.", 400)

    reply_to_user_id = parse_id(data.get("reply_to_user_id")) if data.get("reply_to_user_id") else None
    reply_to_name = str(data.get("reply_to_name", "")).strip()[:120] or None

    now = datetime.now(timezone.utc)
    comment = {
        "post_id": object_id,
        "author_id": user["_id"],
        "body": body,
        "parent_comment_id": parent_comment_id,
        "depth": comment_depth,
        "reply_to_user_id": reply_to_user_id,
        "reply_to_name": reply_to_name,
        "created_at": now,
    }
    try:
        result = mongo.db.feed_comments.insert_one(comment)
        excerpt = " ".join(body.split())
        if len(excerpt) > 180:
            excerpt = excerpt[:177].rstrip() + "…"
        recipients = {}
        if parent and parent.get("author_id") != user["_id"]:
            recipients[parent["author_id"]] = ("New reply to your comment", f"{user.get('name', 'A campus member')} replied: “{excerpt}”")
        if post.get("author_id") != user["_id"]:
            recipients.setdefault(post["author_id"], ("New comment on your post", f"{user.get('name', 'A campus member')} commented: “{excerpt}”"))
        for recipient_id, (title, message) in recipients.items():
            create_notification(title, message, "comment_reply" if parent else "comment", "/dashboard/feed", user_id=recipient_id, actor_id=user["_id"])
        notify_mentions(body, user)
        return success({"comment": {
            "_id": str(result.inserted_id),
            "body": body,
            "is_deleted": False,
            "parent_comment_id": str(parent_comment_id) if parent_comment_id else None,
            "reply_to_user_id": str(reply_to_user_id) if reply_to_user_id else None,
            "reply_to_name": reply_to_name,
            "reaction_count": 0,
            "reacted_by_me": False,
            "created_at": now.isoformat(),
            "author": {"_id": str(user["_id"]), "name": user.get("name", "CampusConnect member"), "username": user.get("username", "")},
        }}, "Comment added.", 201)
    except Exception:
        return failure("Unable to add your comment right now.", 500)


@feed_bp.delete("/comments/<comment_id>")
@authenticated_feed_user
def delete_own_comment(user, comment_id):
    object_id = parse_id(comment_id)
    if not object_id:
        return failure("Invalid comment ID.", 400)
    comment = mongo.db.feed_comments.find_one({"_id": object_id, "author_id": user["_id"], "is_deleted": {"$ne": True}})
    if not comment:
        return failure("Comment not found or you do not own it.", 404)
    mongo.db.feed_comments.update_one({"_id": object_id}, {"$set": {"body": "", "is_deleted": True, "deleted_at": datetime.now(timezone.utc)}})
    mongo.db.feed_comment_reactions.delete_many({"comment_id": object_id})
    return success({"comment_id": str(object_id)}, "Comment deleted.")


@feed_bp.post("/comments/<comment_id>/reactions")
@authenticated_feed_user
def toggle_comment_reaction(user, comment_id):
    object_id = parse_id(comment_id)
    if not object_id:
        return failure("Invalid comment ID.", 400)
    comment = mongo.db.feed_comments.find_one({"_id": object_id, "is_deleted": {"$ne": True}}, {"_id": 1, "author_id": 1, "body": 1})
    if not comment:
        return failure("Comment not found.", 404)
    key = {"comment_id": object_id, "user_id": user["_id"]}
    try:
        existing = mongo.db.feed_comment_reactions.find_one(key)
        if existing:
            mongo.db.feed_comment_reactions.delete_one({"_id": existing["_id"]})
            reacted = False
        else:
            mongo.db.feed_comment_reactions.insert_one({**key, "created_at": datetime.now(timezone.utc)})
            reacted = True
            if comment.get("author_id") != user["_id"]:
                excerpt = " ".join(str(comment.get("body", "")).split())
                if len(excerpt) > 120:
                    excerpt = excerpt[:117].rstrip() + "…"
                create_notification(
                    "Your comment got a like",
                    f"{user.get('name', 'A campus member')} liked your comment: “{excerpt}”",
                    "comment_like",
                    "/dashboard/feed",
                    user_id=comment["author_id"],
                    actor_id=user["_id"],
                )
    except DuplicateKeyError:
        reacted = True
    except Exception:
        return failure("Unable to update your reaction right now.", 500)
    count = mongo.db.feed_comment_reactions.count_documents({"comment_id": object_id})
    return success({"reacted": reacted, "reaction_count": count}, "Comment reaction updated.")


@feed_bp.delete("/admin/posts/<post_id>")
@permission_required("feed.moderate")
def remove_post(post_id):
    object_id = parse_id(post_id)
    if not object_id:
        return failure("Invalid post ID.", 400)
    current_user = get_current_user()
    result = mongo.db.feed_posts.update_one(
        {"_id": object_id, "status": {"$ne": "removed"}},
        {"$set": {
            "status": "removed",
            "removed_at": datetime.now(timezone.utc),
            "removed_by": current_user["_id"],
        }},
    )
    if result.matched_count == 0:
        return failure("Post not found or already removed.", 404)
    return success({}, "Post removed from the campus feed.")


@feed_bp.delete("/<post_id>")
@authenticated_feed_user
def delete_own_post(user, post_id):
    """Let an author remove their own post, without admin access."""
    object_id = parse_id(post_id)
    if not object_id:
        return failure("Invalid post ID.", 400)

    result = mongo.db.feed_posts.update_one(
        {"_id": object_id, "author_id": user["_id"], "status": {"$ne": "removed"}},
        {"$set": {
            "status": "removed",
            "removed_at": datetime.now(timezone.utc),
            "removed_by": user["_id"],
        }},
    )
    if result.matched_count == 0:
        exists = mongo.db.feed_posts.find_one({"_id": object_id}, {"author_id": 1, "status": 1})
        if not exists or exists.get("status") == "removed":
            return failure("Post not found or already removed.", 404)
        return failure("You can only delete your own posts.", 403)
    return success({}, "Your post was deleted.")


@feed_bp.get("/admin/reports")
@permission_required("feed.moderate")
def list_reports():
    try:
        reports = list(mongo.db.feed_reports.find({"status": "open"}).sort("created_at", -1).limit(200))
        post_ids = list({report["post_id"] for report in reports})
        user_ids = list({report["reporter_id"] for report in reports})
        posts = {post["_id"]: post for post in mongo.db.feed_posts.find({"_id": {"$in": post_ids}})} if post_ids else {}
        authors_ids = {post["author_id"] for post in posts.values()} | set(user_ids)
        users = {item["_id"]: item for item in mongo.db.users.find({"_id": {"$in": list(authors_ids)}}, {"name": 1, "role": 1})} if authors_ids else {}
        payload = [{
            "_id": str(report["_id"]),
            "post_id": str(report["post_id"]),
            "reason": report.get("reason", "other"),
            "details": report.get("details", ""),
            "status": report.get("status", "open"),
            "created_at": iso(report.get("created_at")),
            "reporter": {
                "_id": str(report["reporter_id"]),
                "name": users.get(report["reporter_id"], {}).get("name", "CampusConnect member"),
            },
            "post": {
                "body": posts.get(report["post_id"], {}).get("body", "Post unavailable"),
                "status": posts.get(report["post_id"], {}).get("status", "unavailable"),
                "created_at": iso(posts.get(report["post_id"], {}).get("created_at")),
                "author": {
                    "_id": str(posts[report["post_id"]]["author_id"]),
                    "name": users.get(posts[report["post_id"]]["author_id"], {}).get("name", "CampusConnect member"),
                } if report["post_id"] in posts else None,
            },
        } for report in reports]
        return success({"reports": payload}, "Open feed reports fetched.")
    except Exception:
        return failure("Unable to load feed reports right now.", 500)


@feed_bp.patch("/admin/reports/<report_id>")
@permission_required("feed.moderate")
def update_report(report_id):
    object_id = parse_id(report_id)
    if not object_id:
        return failure("Invalid report ID.", 400)
    data = request.get_json(silent=True)
    status = data.get("status") if isinstance(data, dict) else None
    if status not in {"reviewed", "dismissed"}:
        return failure("Choose reviewed or dismissed as the report status.", 400)
    result = mongo.db.feed_reports.update_one(
        {"_id": object_id, "status": "open"},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}},
    )
    if result.matched_count == 0:
        return failure("Open report not found.", 404)
    return success({"status": status}, "Report updated.")


@feed_bp.get("/admin/users/<user_id>")
@permission_required("feed.moderate")
def get_feed_user_profile(user_id):
    object_id = parse_id(user_id)
    if not object_id:
        return failure("Invalid user ID.", 400)
    profile = mongo.db.users.find_one({"_id": object_id}, {"password_hash": 0})
    if not profile:
        return failure("User not found.", 404)
    return success({"user": {
        "_id": str(profile["_id"]),
        "name": profile.get("name", ""),
        "username": profile.get("username", ""),
        "email": profile.get("email", ""),
        "role": profile.get("role", "student"),
        "college": profile.get("college_name", profile.get("college", "")),
        "enrollment_id": profile.get("enrollment_id", ""),
        "is_active": profile.get("is_active", True),
        "created_at": iso(profile.get("created_at")),
    }}, "User profile fetched.")
