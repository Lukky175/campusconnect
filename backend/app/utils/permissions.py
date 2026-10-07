from datetime import datetime, timezone

from ..extensions import mongo


DEFAULT_ROLE_PERMISSIONS = {
    "student": [
        "events.view",
        "registrations.create",
        "registrations.view_own",
        "profile.view",
        "profile.edit",
    ],
    "club_head": [
        "events.view",
        "events.create",
        "events.edit_own",
        "registrations.view_own",
        "profile.view",
        "profile.edit",
    ],
    "admin": [
        "events.view",
        "events.create",
        "events.edit",
        "events.delete",

        "users.view",
        "users.manage",

        "roles.view",
        "roles.manage",

        "registrations.view",
        "registrations.manage",

        "profile.view",
        "profile.edit",
    ],
}


SYSTEM_ROLES = {
    "student",
    "club_head",
    "admin",
}


def normalize_permission(permission):
    return (
        str(permission)
        .strip()
        .lower()
    )


def normalize_permissions(permissions):
    if not isinstance(permissions, list):
        return []

    normalized = {
        normalize_permission(permission)
        for permission in permissions
        if str(permission).strip()
    }

    return sorted(normalized)


def initialize_roles():
    """
    Create the initial system roles if they don't exist.

    Existing role documents are not overwritten. This means
    permissions changed through the admin UI are preserved.
    """

    roles = mongo.db.roles
    now = datetime.now(timezone.utc)

    for role_name, permissions in DEFAULT_ROLE_PERMISSIONS.items():
        existing = roles.find_one({
            "name": role_name,
        })

        if existing:
            continue

        roles.insert_one({
            "name": role_name,
            "permissions": normalize_permissions(
                permissions
            ),
            "is_system": role_name in SYSTEM_ROLES,
            "created_at": now,
            "updated_at": now,
        })


def get_role_document(role_name):
    if not role_name:
        return None

    return mongo.db.roles.find_one({
        "name": role_name,
    })


def get_role_permissions(role_name):
    role = get_role_document(role_name)

    if not role:
        return set()

    return set(
        normalize_permissions(
            role.get("permissions", [])
        )
    )


def user_has_permission(
    user,
    permission,
):
    if not user:
        return False

    if not user.get("is_active", True):
        return False

    normalized_permission = normalize_permission(
        permission
    )

    role = user.get("role")

    if not role:
        return False

    permissions = get_role_permissions(role)

    return normalized_permission in permissions


def get_all_permissions():
    """
    Return every permission currently known to the system.

    This is built from the roles collection, so permissions
    created through the admin UI are automatically included.
    """

    permissions = set()

    for role in mongo.db.roles.find(
        {},
        {
            "permissions": 1,
        },
    ):
        permissions.update(
            normalize_permissions(
                role.get("permissions", [])
            )
        )

    return sorted(permissions)