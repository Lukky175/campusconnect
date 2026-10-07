from datetime import datetime, timezone


ROLES = {
    "student",
    "teacher",
    "club_head",
    "event_manager",
    "admin",
}


PUBLIC_REGISTRATION_ROLE = "student"


def build_user_document(
    name,
    email,
    password_hash,
    role=PUBLIC_REGISTRATION_ROLE,
    college=None,
):
    now = datetime.now(timezone.utc)

    return {
        "name": name.strip(),
        "email": email.strip().lower(),
        "password_hash": password_hash,
        "role": role,
        "college": college.strip() if college else None,
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }