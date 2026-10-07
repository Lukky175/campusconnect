from datetime import datetime, timezone

from pymongo.errors import DuplicateKeyError
from werkzeug.security import (
    check_password_hash,
    generate_password_hash,
)

from ..extensions import mongo


DEFAULT_ROLE = "student"


def create_user(data):
    users = mongo.db.users

    email = data["email"].strip().lower()

    existing = users.find_one({
        "email": email,
    })

    if existing:
        raise ValueError(
            "An account with this email already exists."
        )

    now = datetime.now(timezone.utc)

    document = {
        "name": data["name"].strip(),
        "email": email,
        "password_hash": generate_password_hash(
            data["password"]
        ),
        "college_name": data["college_name"].strip(),
        "enrollment_id": data["enrollment_id"].strip(),

        # Every public registration creates
        # a student account.
        #
        # Users cannot choose their own role.
        "role": DEFAULT_ROLE,

        # New accounts are active by default.
        "is_active": True,

        "created_at": now,
        "updated_at": now,
    }

    try:
        result = users.insert_one(document)

    except DuplicateKeyError:
        raise ValueError(
            "An account with this email already exists."
        )

    document["_id"] = result.inserted_id

    # Never return the password hash.
    document.pop("password_hash", None)

    return document


def authenticate_user(email, password):
    user = mongo.db.users.find_one({
        "email": email.strip().lower()
    })

    if not user:
        return None

    if not check_password_hash(
        user["password_hash"],
        password,
    ):
        return None

    if not user.get("is_active", True):
        return None

    # Never expose the password hash.
    user.pop("password_hash", None)

    return user