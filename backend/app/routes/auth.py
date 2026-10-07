from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
)

from ..extensions import mongo
from ..services.user_service import (
    authenticate_user,
    create_user,
)
from ..utils.response import failure, success
from ..utils.permissions import get_role_permissions


auth_bp = Blueprint(
    "auth",
    __name__,
)


REQUIRED_FIELDS = [
    "name",
    "email",
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
            409,
        )

    except Exception:
        return failure(
            "Unable to create the account right now.",
            500,
        )


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip()
    password = str(data.get("password", ""))

    if not email or not password:
        return failure(
            "Email and password are required."
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
        "email": user["email"],
        "college_name": user["college_name"],
        "enrollment_id": user["enrollment_id"],
        "role": role,
        "permissions": sorted(
            get_role_permissions(role)
        ),
        "is_active": user.get(
            "is_active",
            True,
        ),
    }