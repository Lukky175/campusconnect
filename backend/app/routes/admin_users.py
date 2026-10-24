from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from flask import Blueprint, request

from ..extensions import mongo
from ..utils.auth import permission_required
from ..utils.response import failure, success
from ..services.user_service import normalize_username, valid_username
from ..services.notification_service import create_notification
from pymongo.errors import DuplicateKeyError


admin_users_bp = Blueprint(
    "admin_users",
    __name__,
)


def parse_object_id(value):
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


def serialize_user(user):
    return {
        "_id": str(user["_id"]),
        "name": user.get("name", ""),
        "username": user.get("username", ""),
        "email": user.get("email", ""),
        "college_name": user.get(
            "college_name",
            "",
        ),
        "enrollment_id": user.get(
            "enrollment_id",
            "",
        ),
        "role": user.get(
            "role",
            "student",
        ),
        "is_active": user.get(
            "is_active",
            True,
        ),
        "password_reset_required": bool(user.get("password_reset_required", False)),
        "created_at": (
            user.get("created_at").isoformat()
            if user.get("created_at")
            else None
        ),
        "updated_at": (
            user.get("updated_at").isoformat()
            if user.get("updated_at")
            else None
        ),
    }


@admin_users_bp.get("")
@permission_required("users.view")
def get_users():
    users = mongo.db.users.find(
        {},
        {
            "password_hash": 0,
        },
    ).sort(
        "created_at",
        -1,
    )

    return success({
        "users": [
            serialize_user(user)
            for user in users
        ]
    })


@admin_users_bp.post("/<user_id>/reset-password")
@permission_required("users.manage")
def require_password_reset(user_id):
    """Require the account owner to choose a new password at next sign-in.

    No password or reset secret is generated or returned to administrators.
    """
    object_id = parse_object_id(user_id)
    if not object_id:
        return failure("Invalid user ID.", 400)
    user = mongo.db.users.find_one({"_id": object_id}, {"_id": 1})
    if not user:
        return failure("User not found.", 404)
    mongo.db.users.update_one({"_id": object_id}, {"$set": {
        "password_reset_required": True,
        "password_reset_requested_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }})
    create_notification("Password reset requested", "An administrator asked you to choose a new password at your next sign-in.", "security", "/dashboard/settings?password-reset=required", user_id=object_id)
    return success({"password_reset_required": True}, "Password change required at next sign-in.")


@admin_users_bp.patch("/<user_id>/username")
@permission_required("users.username.manage")
def update_username(user_id):
    object_id = parse_object_id(user_id)
    if not object_id:
        return failure("Invalid user ID.", 400)
    user = mongo.db.users.find_one({"_id": object_id}, {"username": 1})
    if not user:
        return failure("User not found.", 404)
    username = normalize_username((request.get_json(silent=True) or {}).get("username"))
    if not valid_username(username):
        return failure("Username must be 3–30 characters and use only letters, numbers, and underscores.", 400)
    if mongo.db.users.find_one({"username": username, "_id": {"$ne": object_id}}, {"_id": 1}):
        return failure("That username is already taken. Choose another one.", 409)
    try:
        mongo.db.users.update_one({"_id": object_id}, {"$set": {"username": username, "updated_at": datetime.now(timezone.utc)}})
    except DuplicateKeyError:
        return failure("That username is already taken. Choose another one.", 409)
    if username != user.get("username"):
        create_notification("Your username was updated", f"An administrator changed your username to @{username}.", "account", "/dashboard/profile", user_id=object_id)
    return success({"username": username}, "Username updated.")


@admin_users_bp.get("/username-requests")
@permission_required("users.username.manage")
def get_username_requests():
    requests = list(mongo.db.username_change_requests.find({"status": "pending"}).sort("created_at", 1).limit(200))
    user_ids = list({item["user_id"] for item in requests})
    users = {item["_id"]: item for item in mongo.db.users.find({"_id": {"$in": user_ids}}, {"name": 1, "email": 1})} if user_ids else {}
    return success({"requests": [{"_id": str(item["_id"]), "old_username": item.get("old_username", ""), "new_username": item.get("new_username", ""), "reason": item.get("reason", ""), "created_at": item.get("created_at").isoformat() if item.get("created_at") else None, "user": {"_id": str(item["user_id"]), "name": users.get(item["user_id"], {}).get("name", "CampusConnect member"), "email": users.get(item["user_id"], {}).get("email", "")} } for item in requests]}, "Username change requests fetched.")


@admin_users_bp.patch("/username-requests/<request_id>")
@permission_required("users.username.manage")
def review_username_request(request_id):
    object_id = parse_object_id(request_id)
    if not object_id:
        return failure("Invalid request ID.", 400)
    data = request.get_json(silent=True) or {}
    status = str(data.get("status", "")).strip().lower()
    if status not in {"approved", "rejected"}:
        return failure("Choose approved or rejected.", 400)
    record = mongo.db.username_change_requests.find_one({"_id": object_id, "status": "pending"})
    if not record:
        return failure("Pending username request not found.", 404)
    if status == "approved":
        try:
            result = mongo.db.users.update_one({"_id": record["user_id"], "username": record.get("old_username")}, {"$set": {"username": record["new_username"], "updated_at": datetime.now(timezone.utc)}})
        except DuplicateKeyError:
            return failure("That username has since been claimed. Ask the user to submit another request.", 409)
        if not result.modified_count:
            return failure("The account username changed while this request was pending. Review the latest account details.", 409)
    now = datetime.now(timezone.utc)
    mongo.db.username_change_requests.update_one({"_id": object_id, "status": "pending"}, {"$set": {"status": status, "reviewed_at": now, "updated_at": now}})
    title = "Username change approved" if status == "approved" else "Username change request declined"
    message = f"Your username is now @{record['new_username']}." if status == "approved" else "Your username change request was declined. You can submit a new request from Settings."
    create_notification(title, message, "account", "/dashboard/profile", user_id=record["user_id"])
    return success({"status": status}, f"Username request {status}.")

@admin_users_bp.patch("/<user_id>/role")
@permission_required("users.manage")
def update_user_role(user_id):
    object_id = parse_object_id(user_id)

    if not object_id:
        return failure(
            "Invalid user ID.",
            400,
        )

    data = request.get_json(
        silent=True
    ) or {}

    role = str(
        data.get("role", "")
    ).strip().lower()

    if not role:
        return failure(
            "Role is required.",
            400,
        )

    role_document = mongo.db.roles.find_one({
        "name": role,
    })

    if not role_document:
        return failure(
            "The requested role does not exist.",
            404,
        )

    user = mongo.db.users.find_one({
        "_id": object_id,
    })

    if not user:
        return failure(
            "User not found.",
            404,
        )

    # Do not allow changing the role of an account
    # through an invalid state.
    mongo.db.users.update_one(
        {
            "_id": object_id,
        },
        {
            "$set": {
                "role": role,
                "updated_at": datetime.now(
                    timezone.utc
                ),
            }
        },
    )

    updated = mongo.db.users.find_one({
        "_id": object_id,
    })

    return success(
        {
            "user": serialize_user(updated),
        },
        "User role updated.",
    )


@admin_users_bp.patch("/<user_id>/status")
@permission_required("users.manage")
def update_user_status(user_id):
    object_id = parse_object_id(user_id)

    if not object_id:
        return failure(
            "Invalid user ID.",
            400,
        )

    data = request.get_json(
        silent=True
    ) or {}

    if "is_active" not in data:
        return failure(
            "is_active is required.",
            400,
        )

    is_active = data["is_active"]

    if not isinstance(is_active, bool):
        return failure(
            "is_active must be a boolean.",
            400,
        )

    user = mongo.db.users.find_one({
        "_id": object_id,
    })

    if not user:
        return failure(
            "User not found.",
            404,
        )

    mongo.db.users.update_one(
        {
            "_id": object_id,
        },
        {
            "$set": {
                "is_active": is_active,
                "updated_at": datetime.now(
                    timezone.utc
                ),
            }
        },
    )

    updated = mongo.db.users.find_one({
        "_id": object_id,
    })

    return success(
        {
            "user": serialize_user(updated),
        },
        "User status updated.",
    )
