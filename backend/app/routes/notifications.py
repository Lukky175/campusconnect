from bson import ObjectId
from bson.errors import InvalidId
from flask import Blueprint, request

from ..extensions import mongo
from ..services.notification_service import create_notification
from ..utils.auth import get_current_user, permission_required
from ..utils.response import failure, success


notifications_bp = Blueprint("notifications", __name__)


def parse_id(value):
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


def _audience_query(user):
    return {"$or": [
        {"recipient_user_id": user["_id"]},
        {"recipient_roles": user.get("role", "student")},
    ]}


def _serialize(notification, user_id, actors):
    actor = actors.get(notification.get("actor_id"))
    return {
        "_id": str(notification["_id"]),
        "title": notification.get("title", "CampusConnect update"),
        "body": notification.get("body", ""),
        "type": notification.get("type", "general"),
        "link": notification.get("link", "/dashboard"),
        "created_at": notification["created_at"].isoformat() if notification.get("created_at") else None,
        "read": user_id in notification.get("read_by", []),
        "actor": ({"_id": str(actor["_id"]), "name": actor.get("name", ""), "username": actor.get("username", "")} if actor else None),
    }


@notifications_bp.get("")
def list_notifications():
    user = get_current_user()
    if not user:
        return failure("Authenticated user not found.", 401)
    query = _audience_query(user)
    try:
        records = list(mongo.db.notifications.find(query).sort("created_at", -1).limit(50))
        unread = mongo.db.notifications.count_documents({**query, "read_by": {"$ne": user["_id"]}})
        actor_ids = list({item.get("actor_id") for item in records if item.get("actor_id")})
        actors = {actor["_id"]: actor for actor in mongo.db.users.find({"_id": {"$in": actor_ids}}, {"name": 1, "username": 1})} if actor_ids else {}
        return success({"notifications": [_serialize(item, user["_id"], actors) for item in records], "unread_count": unread}, "Notifications fetched.")
    except Exception:
        return failure("Unable to load notifications right now.", 500)


@notifications_bp.patch("/<notification_id>/read")
def mark_read(notification_id):
    user = get_current_user()
    if not user:
        return failure("Authenticated user not found.", 401)
    object_id = parse_id(notification_id)
    if not object_id:
        return failure("Invalid notification ID.", 400)
    query = {"_id": object_id, **_audience_query(user)}
    notification = mongo.db.notifications.find_one(query)
    if not notification:
        return failure("Notification not found.", 404)
    mongo.db.notifications.update_one({"_id": object_id}, {"$addToSet": {"read_by": user["_id"]}})
    return success({}, "Notification marked as read.")


@notifications_bp.patch("/read-all")
def mark_all_read():
    user = get_current_user()
    if not user:
        return failure("Authenticated user not found.", 401)
    mongo.db.notifications.update_many(_audience_query(user), {"$addToSet": {"read_by": user["_id"]}})
    return success({}, "Notifications marked as read.")


@notifications_bp.post("/send")
@permission_required("notifications.send")
def send_notification():
    data = request.get_json(silent=True) or {}
    title = str(data.get("title", "")).strip()
    body = str(data.get("body", "")).strip()
    roles = data.get("roles", [])
    user_id = parse_id(data.get("user_id")) if data.get("user_id") else None
    if not title or not body:
        return failure("A notification title and message are required.", 400)
    if len(title) > 160 or len(body) > 600:
        return failure("Notification title or message is too long.", 400)
    if not isinstance(roles, list):
        return failure("roles must be a list.", 400)
    roles = sorted({str(role).strip().lower() for role in roles if str(role).strip()})
    if roles and mongo.db.roles.count_documents({"name": {"$in": roles}}) != len(roles):
        return failure("One or more recipient roles are invalid.", 400)
    if data.get("user_id") and not user_id:
        return failure("Invalid recipient user ID.", 400)
    if user_id and not mongo.db.users.find_one({"_id": user_id}, {"_id": 1}):
        return failure("Recipient user not found.", 404)
    if not user_id and not roles:
        return failure("Choose a user or at least one role.", 400)
    actor = get_current_user()
    note = create_notification(title, body, data.get("type", "admin"), data.get("link", "/dashboard"), user_id, roles, actor.get("_id") if actor else None)
    if not note:
        return failure("Unable to send the notification right now.", 500)
    return success({"notification_id": str(note["_id"])}, "Notification sent.", 201)
