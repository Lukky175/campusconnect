from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import mongo
from app.models.user_model import (
    PUBLIC_REGISTRATION_ROLE,
    build_user_document,
)


def register_user(
    name,
    email,
    password,
    college=None,
):
    normalized_email = email.strip().lower()

    existing_user = mongo.db.users.find_one(
        {"email": normalized_email}
    )

    if existing_user:
        raise ValueError(
            "An account with this email already exists."
        )

    password_hash = generate_password_hash(password)

    user = build_user_document(
        name=name,
        email=normalized_email,
        password_hash=password_hash,
        role=PUBLIC_REGISTRATION_ROLE,
        college=college,
    )

    result = mongo.db.users.insert_one(user)

    user["_id"] = result.inserted_id

    return serialize_user(user)


def authenticate_user(email, password):
    normalized_email = email.strip().lower()

    user = mongo.db.users.find_one(
        {"email": normalized_email}
    )

    if not user:
        raise ValueError("Invalid email or password.")

    if not user.get("is_active", True):
        raise ValueError("This account has been disabled.")

    if not check_password_hash(
        user["password_hash"],
        password,
    ):
        raise ValueError("Invalid email or password.")

    access_token = create_access_token(
        identity=str(user["_id"]),
        additional_claims={
            "role": user["role"],
            "name": user["name"],
        },
    )

    return {
        "access_token": access_token,
        "user": serialize_user(user),
    }


def get_user_by_id(user_id):
    from bson import ObjectId

    try:
        object_id = ObjectId(user_id)
    except Exception:
        return None

    user = mongo.db.users.find_one(
        {"_id": object_id}
    )

    if not user:
        return None

    return serialize_user(user)


def serialize_user(user):
    return {
        "id": str(user["_id"]),
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role"),
        "college": user.get("college"),
        "is_active": user.get("is_active", True),
    }