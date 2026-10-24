from datetime import datetime, timezone
import re

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

    if len(email) > 254 or not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        raise ValueError("Enter a valid email address.")

    existing = users.find_one({
        "email": email,
    })

    if existing:
        raise ValueError(
            "An account with this email already exists."
        )

    username = normalize_username(data.get("username", ""))
    if not valid_username(username):
        raise ValueError("Username must be 3–24 characters and use only letters, numbers, and underscores.")
    if users.find_one({"username": username}, {"_id": 1}):
        raise ValueError("That username is already taken. Choose another one.")

    now = datetime.now(timezone.utc)

    document = {
        "name": data["name"].strip(),
        "email": email,
        "username": username,
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
        if users.find_one({"username": username}, {"_id": 1}):
            raise ValueError("That username is already taken. Choose another one.")
        raise ValueError("An account with this email already exists.")

    document["_id"] = result.inserted_id

    # Never return the password hash.
    document.pop("password_hash", None)

    return document


def authenticate_user(email, password):
    identifier = email.strip().lower()
    user = mongo.db.users.find_one({"$or": [{"email": identifier}, {"username": identifier}]})

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


def normalize_username(value):
    return str(value or "").strip().lstrip("@").lower()


def valid_username(value):
    return bool(re.fullmatch(r"[a-z0-9][a-z0-9_]{2,29}", value))
