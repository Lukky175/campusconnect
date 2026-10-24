from datetime import datetime, timezone

from ..extensions import mongo


DEFAULT_ROLE_PERMISSIONS = {
    "student": [
        "events.view",
        "registrations.create",
        "registrations.view_own",
        "profile.view",
        "profile.edit",
        "profile.request_username_change",
    ],
    "club_head": [
        "events.view",
        "events.create",
        "events.edit_own",
        "registrations.view_own",
        "profile.view",
        "profile.edit",
        "profile.request_username_change",
    ],
    "admin": [
        "events.view",
        "events.create",
        "events.edit",
        "events.edit_own",
        "events.delete",

        "users.view",
        "users.manage",

        "roles.view",
        "roles.manage",

        "registrations.view",
        "registrations.view_own",
        "registrations.manage",
        "clubs.manage",
        "blogs.manage",
        "website.manage",
        "feed.moderate",

        "profile.view",
        "profile.edit",
        "profile.request_username_change",
        "users.username.manage",
        "notifications.send",
    ],
}


PERMISSION_CATALOG = {
    "events.view", "events.create", "events.edit", "events.edit_own", "events.delete",
    "registrations.create", "registrations.view_own", "registrations.view", "registrations.manage",
    "profile.view", "profile.edit", "profile.request_username_change", "users.view", "users.manage", "users.username.manage", "roles.view", "roles.manage",
    "notifications.send",
    "clubs.manage", "blogs.manage", "website.manage", "feed.moderate",
}

ADMIN_PERMISSION_SCHEMA_VERSION = 3
ADMIN_PERMISSION_MIGRATIONS = {
    # These are capabilities added after the original admin roles were seeded.
    2: ["clubs.manage", "blogs.manage", "website.manage", "feed.moderate"],
    3: ["users.username.manage", "notifications.send", "profile.request_username_change"],
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

    # Migrate existing seeded admin records once so the new application pages
    # are available without a manual database edit. Later UI changes remain intact.
    schema_version = int(role.get("permission_schema_version") or 0)
    if role_name == "admin" and schema_version < ADMIN_PERMISSION_SCHEMA_VERSION:
        missing = [
            permission
            for version, permissions in ADMIN_PERMISSION_MIGRATIONS.items()
            if version > schema_version
            for permission in permissions
        ]
        mongo.db.roles.update_one(
            {"_id": role["_id"]},
            {
                "$addToSet": {"permissions": {"$each": missing}},
                "$set": {"permission_schema_version": ADMIN_PERMISSION_SCHEMA_VERSION},
            },
        )
        role = get_role_document(role_name)

    if role_name in {"student", "club_head"} and schema_version < ADMIN_PERMISSION_SCHEMA_VERSION:
        mongo.db.roles.update_one(
            {"_id": role["_id"]},
            {
                "$addToSet": {"permissions": "profile.request_username_change"},
                "$set": {"permission_schema_version": ADMIN_PERMISSION_SCHEMA_VERSION},
            },
        )
        role = get_role_document(role_name)

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
    """Return permissions implemented by this application."""
    return sorted(PERMISSION_CATALOG)
