from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from flask import Blueprint, request

from ..extensions import mongo
from ..utils.auth import permission_required
from ..utils.response import failure, success


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