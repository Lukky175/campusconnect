from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
)
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timezone

from ..extensions import mongo
from ..services.user_service import (
    authenticate_user,
    create_user,
    normalize_username,
    valid_username,
)
from ..utils.response import failure, success
from ..utils.permissions import get_role_permissions
from ..services.notification_service import create_notification


auth_bp = Blueprint(
    "auth",
    __name__,
)


REQUIRED_FIELDS = [
    "name",
    "email",
    "username",
    "password",
    "college_name",
    "enrollment_id",
]


DEFAULT_ROLE = "student"


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}

    missing = [
        field
        for field in REQUIRED_FIELDS
        if not str(data.get(field, "")).strip()
    ]

    if missing:
        return failure(
            f"Missing required fields: {', '.join(missing)}"
        )

    if len(str(data["password"])) < 8:
        return failure(
            "Password must be at least 8 characters long."
        )

    try:
        # Public registration ALWAYS creates a student.
        #
        # Do not accept role from the request body.
        data["role"] = DEFAULT_ROLE

        user = create_user(data)
        create_notification("New student account", f"{user.get('name', 'A student')} joined CampusConnect as @{user.get('username', '')}.", "account", "/dashboard/admin/users", roles=["admin"], actor_id=user["_id"])

        # Ensure existing user-service implementation
        # stores the role as well.
        if user.get("role") != DEFAULT_ROLE:
            mongo.db.users.update_one(
                {"_id": user["_id"]},
                {
                    "$set": {
                        "role": DEFAULT_ROLE,
                    }
                },
            )

            user["role"] = DEFAULT_ROLE

        return success(
            {
                "user": _public_user(user),
            },
            "Account created.",
            201,
        )

    except ValueError as error:
        return failure(
            str(error),
            409 if "already" in str(error).lower() or "taken" in str(error).lower() else 400,
        )

    except Exception:
        return failure(
            "Unable to create the account right now.",
            500,
        )


@auth_bp.get("/check-username")
def check_username():
    username = normalize_username(request.args.get("username", ""))
    if not valid_username(username):
        return success({"available": False, "valid": False}, "Username format is invalid.")
    exists = mongo.db.users.find_one({"username": username}, {"_id": 1}) is not None
    return success({"available": not exists, "valid": True}, "Username checked.")


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}

    email = str(data.get("identifier", data.get("email", ""))).strip()
    password = str(data.get("password", ""))

    if not email or not password:
        return failure(
            "Username or email and password are required."
        )

    try:
        user = authenticate_user(
            email,
            password,
        )
    except Exception:
        return failure(
            "Unable to complete login right now.",
            500,
        )

    if not user:
        return failure(
            "Invalid email or password.",
            401,
        )

    role = user.get(
        "role",
        DEFAULT_ROLE,
    )

    access_token = create_access_token(
        identity=str(user["_id"]),
        additional_claims={
            "role": role,
        },
    )

    return success(
        {
            "access_token": access_token,
            "user": _public_user(user),
        },
        "Login successful.",
    )


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()

    user = mongo.db.users.find_one(
        {
            "_id": _object_id(user_id),
        }
    )

    if not user:
        return failure(
            "User account not found.",
            404,
        )

    return success(
        {
            "user": _public_user(user),
        },
        "Authenticated user.",
    )


@auth_bp.post("/change-password")
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    current_password = str(data.get("current_password", ""))
    new_password = str(data.get("new_password", ""))
    if len(new_password) < 12:
        return failure("New password must be at least 12 characters long.", 400)
    user = mongo.db.users.find_one({"_id": _object_id(user_id)})
    if not user or not user.get("is_active", True):
        return failure("Authenticated user not found.", 401)
    if not check_password_hash(user.get("password_hash", ""), current_password):
        return failure("Current password is incorrect.", 400)
    mongo.db.users.update_one({"_id": user["_id"]}, {"$set": {
        "password_hash": generate_password_hash(new_password),
        "password_reset_required": False,
        "password_changed_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }, "$unset": {"password_reset_requested_at": ""}})
    create_notification("Password updated", "Your CampusConnect account password was changed successfully.", "security", "/dashboard/settings", user_id=user["_id"])
    return success({}, "Password updated.")


def _object_id(value):
    from bson import ObjectId

    return ObjectId(value)

def _public_user(user):
    role = user.get(
        "role",
        DEFAULT_ROLE,
    )

    return {
        "_id": str(user["_id"]),
        "name": user["name"],
        "username": user.get("username", ""),
        "email": user["email"],
        "college_name": user["college_name"],
        "enrollment_id": user["enrollment_id"],
        "linkedin_url": user.get("linkedin_url", ""),
        "github_url": user.get("github_url", ""),
        "resume_url": user.get("resume_url", ""),
        "role": role,
        "permissions": sorted(
            get_role_permissions(role)
        ),
        "is_active": user.get(
            "is_active",
            True,
        ),
        "password_reset_required": bool(user.get("password_reset_required", False)),
    }
