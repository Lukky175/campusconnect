from datetime import datetime, timezone

from flask import Blueprint, request
from pymongo.errors import DuplicateKeyError

from ..extensions import mongo
from ..utils.auth import permission_required
from ..utils.permissions import (
    SYSTEM_ROLES,
    get_all_permissions,
    normalize_permissions,
)
from ..utils.response import failure, success


admin_roles_bp = Blueprint(
    "admin_roles",
    __name__,
)


def serialize_role(role):
    return {
        "_id": str(role["_id"]),
        "name": role["name"],
        "permissions": normalize_permissions(
            role.get("permissions", [])
        ),
        "is_system": role.get(
            "is_system",
            False,
        ),
    }


@admin_roles_bp.get("")
@permission_required("roles.view")
def get_roles():
    roles = mongo.db.roles.find({}).sort(
        "name",
        1,
    )

    return success({
        "roles": [
            serialize_role(role)
            for role in roles
        ]
    })


@admin_roles_bp.get("/permissions")
@permission_required("roles.view")
def get_permissions():
    return success({
        "permissions": get_all_permissions()
    })


@admin_roles_bp.post("")
@permission_required("roles.manage")
def create_role():
    data = request.get_json(
        silent=True
    ) or {}

    name = str(
        data.get("name", "")
    ).strip().lower()

    if not name:
        return failure(
            "Role name is required.",
            400,
        )

    if len(name) > 50:
        return failure(
            "Role name is too long.",
            400,
        )

    if any(
        character not in (
            "abcdefghijklmnopqrstuvwxyz"
            "0123456789_-"
        )
        for character in name
    ):
        return failure(
            "Role name may only contain letters, numbers, underscores and hyphens.",
            400,
        )

    permissions = normalize_permissions(
        data.get("permissions", [])
    )

    now = datetime.now(timezone.utc)

    try:
        result = mongo.db.roles.insert_one({
            "name": name,
            "permissions": permissions,
            "is_system": False,
            "created_at": now,
            "updated_at": now,
        })

    except DuplicateKeyError:
        return failure(
            "A role with this name already exists.",
            409,
        )

    role = mongo.db.roles.find_one({
        "_id": result.inserted_id,
    })

    return success(
        {
            "role": serialize_role(role),
        },
        "Role created.",
        201,
    )


@admin_roles_bp.patch("/<role_name>")
@permission_required("roles.manage")
def update_role(role_name):
    role_name = role_name.strip().lower()

    role = mongo.db.roles.find_one({
        "name": role_name,
    })

    if not role:
        return failure(
            "Role not found.",
            404,
        )

    data = request.get_json(
        silent=True
    ) or {}

    if "permissions" not in data:
        return failure(
            "permissions is required.",
            400,
        )

    permissions = normalize_permissions(
        data["permissions"]
    )

    mongo.db.roles.update_one(
        {
            "_id": role["_id"],
        },
        {
            "$set": {
                "permissions": permissions,
                "updated_at": datetime.now(
                    timezone.utc
                ),
            }
        },
    )

    updated = mongo.db.roles.find_one({
        "_id": role["_id"],
    })

    return success(
        {
            "role": serialize_role(updated),
        },
        "Role permissions updated.",
    )


@admin_roles_bp.delete("/<role_name>")
@permission_required("roles.manage")
def delete_role(role_name):
    role_name = role_name.strip().lower()

    if role_name in SYSTEM_ROLES:
        return failure(
            "System roles cannot be deleted.",
            400,
        )

    role = mongo.db.roles.find_one({
        "name": role_name,
    })

    if not role:
        return failure(
            "Role not found.",
            404,
        )

    users_using_role = mongo.db.users.count_documents({
        "role": role_name,
    })

    if users_using_role > 0:
        return failure(
            "This role is still assigned to users. Reassign those users before deleting the role.",
            409,
        )

    mongo.db.roles.delete_one({
        "_id": role["_id"],
    })

    return success(
        {},
        "Role deleted.",
    )