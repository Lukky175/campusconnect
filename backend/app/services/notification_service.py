import re
from datetime import datetime, timezone

from bson import ObjectId

from ..extensions import mongo


def create_notification(title, body, notification_type="general", link="/dashboard", user_id=None, roles=None, actor_id=None):
    """Persist an in-app notification for one user or one or more roles."""
    role_targets = sorted({str(role).strip().lower() for role in (roles or []) if str(role).strip()})
    if not user_id and not role_targets:
        return None
    now = datetime.now(timezone.utc)
    notification = {
        "title": str(title or "CampusConnect update").strip()[:160],
        "body": str(body or "").strip()[:600],
        "type": str(notification_type or "general").strip()[:40],
        "link": (str(link or "/dashboard").strip()[:500] if str(link or "").startswith("/") and not str(link or "").startswith(("//", "/\\")) else "/dashboard"),
        "recipient_user_id": user_id,
        "recipient_roles": role_targets,
        "actor_id": actor_id,
        "created_at": now,
        "read_by": [],
    }
    try:
        result = mongo.db.notifications.insert_one(notification)
    except Exception:
        # Notifications are best-effort side effects; they must never turn a
        # successful signup, post, or publish into a failed request.
        return None
    notification["_id"] = result.inserted_id
    return notification


def notify_mentions(text, actor, link="/dashboard/feed"):
    """Notify accounts named with @username in a post or comment."""
    handles = sorted({handle.lower() for handle in re.findall(r"(?<![\w@])@([a-zA-Z0-9_]{3,30})", str(text or ""))})[:20]
    if not handles:
        return
    excerpt = " ".join(str(text or "").split())
    if len(excerpt) > 180:
        excerpt = excerpt[:177].rstrip() + "…"
    actor_id = actor.get("_id")
    for recipient in mongo.db.users.find({"username": {"$in": list(handles)}, "is_active": {"$ne": False}}, {"_id": 1, "username": 1}):
        if recipient["_id"] == actor_id:
            continue
        create_notification(
            "You were mentioned",
            f"{actor.get('name', 'A campus member')} mentioned you: “{excerpt}”",
            "mention",
            link,
            user_id=recipient["_id"],
            actor_id=actor_id,
        )
