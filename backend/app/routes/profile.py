from datetime import datetime, timezone
from urllib.parse import urlparse

from flask import Blueprint, request
from bson import ObjectId

from ..extensions import mongo
from ..utils.auth import get_current_user, permission_required
from ..utils.response import failure, success
from ..services.user_service import normalize_username, valid_username
from ..services.notification_service import create_notification
from pymongo.errors import DuplicateKeyError


profile_bp = Blueprint("profile", __name__)
PROFILE_LINK_FIELDS = ("linkedin_url", "github_url", "resume_url")


def serialize_profile(user):
    return {
        "_id": str(user["_id"]),
        "name": user.get("name", ""),
        "username": user.get("username", ""),
        "email": user.get("email", ""),
        "college_name": user.get("college_name", ""),
        "enrollment_id": user.get("enrollment_id", ""),
        "role": user.get("role", "student"),
        **{field: user.get(field, "") for field in PROFILE_LINK_FIELDS},
    }


def valid_url(value, allowed_domains=None):
    if not value:
        return True
    try:
        parsed = urlparse(value)
        host = (parsed.hostname or "").lower().rstrip(".")
        return (
            parsed.scheme == "https"
            and bool(host)
            and (allowed_domains is None or any(host == domain or host.endswith("." + domain) for domain in allowed_domains))
        )
    except ValueError:
        return False


@profile_bp.get("")
@permission_required("profile.view")
def get_profile():
    user = get_current_user()
    return success({"profile": serialize_profile(user)}, "Profile fetched.")


@profile_bp.patch("")
@permission_required("profile.edit")
def update_profile():
    user = get_current_user()
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return failure("Profile links are required.", 400)

    update = {}
    for field in PROFILE_LINK_FIELDS:
        if field not in data:
            continue
        value = str(data[field] or "").strip()
        if len(value) > 500:
            return failure("Profile links must be 500 characters or fewer.", 400)
        domains = {
            "linkedin_url": {"linkedin.com"},
            "github_url": {"github.com"},
            "resume_url": None,
        }[field]
        if not valid_url(value, domains):
            if value and field != "resume_url":
                return failure(f"Enter a valid HTTPS {field.removesuffix('_url')} profile URL.", 400)
            if value:
                return failure("Resume link must be a valid HTTPS URL.", 400)
        update[field] = value

    if not update:
        return failure("No profile links were provided.", 400)

    update["updated_at"] = datetime.now(timezone.utc)
    changed_links = [field for field in PROFILE_LINK_FIELDS if field in update and update[field] != user.get(field, "")]
    mongo.db.users.update_one({"_id": user["_id"]}, {"$set": update})
    updated = mongo.db.users.find_one({"_id": user["_id"]})
    if changed_links:
        labels = {"linkedin_url": "LinkedIn", "github_url": "GitHub", "resume_url": "resume"}
        create_notification(
            "Profile links updated",
            f"Your {', '.join(labels[field] for field in changed_links)} link{'s were' if len(changed_links) > 1 else ' was'} updated successfully.",
            "profile",
            "/dashboard/profile",
            user_id=user["_id"],
        )
    return success({"profile": serialize_profile(updated)}, "Profile links updated.")


@profile_bp.get("/users/<user_id>")
@permission_required("profile.view")
def get_community_profile(user_id):
    """Return only fields intended for authenticated campus profiles."""
    object_id = ObjectId(user_id) if ObjectId.is_valid(user_id) else None
    if not object_id:
        return failure("Invalid user ID.", 400)
    profile = mongo.db.users.find_one({"_id": object_id, "is_active": {"$ne": False}}, {
        "name": 1, "username": 1, "role": 1, "linkedin_url": 1, "github_url": 1, "resume_url": 1,
    })
    if not profile:
        return failure("User not found.", 404)
    return success({"user": {
        "_id": str(profile["_id"]),
        "name": profile.get("name", ""),
        "username": profile.get("username", ""),
        "role": profile.get("role", "student"),
        **{field: profile.get(field, "") for field in PROFILE_LINK_FIELDS},
    }}, "User profile fetched.")


@profile_bp.post("/username-requests")
@permission_required("profile.request_username_change")
def request_username_change():
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    requested = normalize_username(data.get("new_username"))
    reason = str(data.get("reason", "")).strip()
    if not valid_username(requested):
        return failure("Username must be 3–30 characters and use only letters, numbers, and underscores.", 400)
    if not reason or len(reason) > 1000:
        return failure("Provide a reason of 1,000 characters or fewer.", 400)
    if requested == user.get("username"):
        return failure("Choose a username different from your current username.", 400)
    if mongo.db.users.find_one({"username": requested, "_id": {"$ne": user["_id"]}}, {"_id": 1}):
        return failure("That username is already taken. Choose another one.", 409)
    now = datetime.now(timezone.utc)
    record = {
        "user_id": user["_id"],
        "old_username": user.get("username", ""),
        "new_username": requested,
        "reason": reason,
        "status": "pending",
        "created_at": now,
        "updated_at": now,
    }
    try:
        result = mongo.db.username_change_requests.insert_one(record)
    except DuplicateKeyError:
        return failure("You already have a username change request awaiting review.", 409)
    create_notification("Username change request", f"{user.get('name', 'A student')} requested @{requested}.", "username_request", "/dashboard/admin/users", roles=["admin"], actor_id=user["_id"])
    return success({"request": {"_id": str(result.inserted_id), "new_username": requested, "status": "pending", "created_at": now.isoformat()}}, "Username change request submitted for review.", 201)


@profile_bp.get("/username-requests/me")
@permission_required("profile.request_username_change")
def get_my_username_requests():
    user = get_current_user()
    records = mongo.db.username_change_requests.find({"user_id": user["_id"]}).sort("created_at", -1).limit(10)
    return success({"requests": [{"_id": str(item["_id"]), "old_username": item.get("old_username", ""), "new_username": item.get("new_username", ""), "reason": item.get("reason", ""), "status": item.get("status", "pending"), "created_at": item.get("created_at").isoformat() if item.get("created_at") else None} for item in records]}, "Username change requests fetched.")
