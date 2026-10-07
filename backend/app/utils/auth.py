from functools import wraps

from flask import jsonify
from flask_jwt_extended import (
    get_jwt_identity,
    verify_jwt_in_request,
)

from bson import ObjectId
from bson.errors import InvalidId

from ..extensions import mongo
from .permissions import user_has_permission


def get_current_user():
    """
    Return the current user directly from MongoDB.

    The JWT only identifies the user.
    MongoDB remains the source of truth for:
    - role
    - active status
    - permissions
    """

    verify_jwt_in_request()

    user_id = get_jwt_identity()

    try:
        object_id = ObjectId(user_id)
    except (InvalidId, TypeError):
        return None

    return mongo.db.users.find_one({
        "_id": object_id,
    })


def get_current_user_id():
    user = get_current_user()

    if not user:
        return None

    return str(user["_id"])


def permission_required(permission):
    """
    Protect an endpoint using a database-backed permission.

    Example:

        @permission_required("users.manage")
        def update_user():
            ...
    """

    def decorator(view_function):

        @wraps(view_function)
        def wrapped(*args, **kwargs):
            user = get_current_user()

            if not user:
                return jsonify({
                    "success": False,
                    "message": "Authenticated user not found.",
                }), 401

            if not user.get("is_active", True):
                return jsonify({
                    "success": False,
                    "message": "Your account is inactive.",
                }), 403

            if not user_has_permission(
                user,
                permission,
            ):
                return jsonify({
                    "success": False,
                    "message": (
                        "You do not have permission "
                        "to perform this action."
                    ),
                }), 403

            return view_function(
                *args,
                **kwargs,
            )

        return wrapped

    return decorator


def role_required(*allowed_roles):
    """
    Backwards-compatible role decorator.

    This also checks the current role from MongoDB,
    rather than trusting the JWT role claim.
    """

    allowed = set(allowed_roles)

    def decorator(view_function):

        @wraps(view_function)
        def wrapped(*args, **kwargs):
            user = get_current_user()

            if not user:
                return jsonify({
                    "success": False,
                    "message": "Authenticated user not found.",
                }), 401

            if user.get("role") not in allowed:
                return jsonify({
                    "success": False,
                    "message": (
                        "You do not have permission "
                        "to perform this action."
                    ),
                }), 403

            return view_function(
                *args,
                **kwargs,
            )

        return wrapped

    return decorator