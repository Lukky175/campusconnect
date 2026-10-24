from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from flask import Blueprint, request
from pymongo.errors import DuplicateKeyError

from ..extensions import mongo
from ..utils.auth import get_current_user, permission_required
from ..utils.permissions import user_has_permission
from ..utils.response import failure, success
from ..services.notification_service import create_notification


admin_events_bp = Blueprint(
    "admin_events",
    __name__,
)


EVENT_FIELDS = [
    "title",
    "slug",
    "description",
    "type",
    "mode",
    "location",
    "college",
    "organizer",
    "tags",
    "start_date",
    "end_date",
    "team_size",
    "registration_url",
    "eligibility",
    "highlights",
    "status",
]


def parse_object_id(value):
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


def serialize_event(event):
    result = dict(event)

    result["_id"] = str(
        result["_id"]
    )
    if result.get("created_by") is not None:
        result["created_by"] = str(result["created_by"])

    for field in [
        "created_at",
        "updated_at",
    ]:
        if isinstance(
            result.get(field),
            datetime,
        ):
            result[field] = result[
                field
            ].isoformat()

    return result


def build_event_document(data):
    document = {}

    for field in EVENT_FIELDS:
        if field not in data:
            continue

        value = data[field]

        if field in [
            "tags",
            "highlights",
        ]:
            if isinstance(value, list):
                document[field] = value
            else:
                document[field] = []

        else:
            document[field] = value

    if "title" not in document:
        raise ValueError(
            "Event title is required."
        )

    if "slug" not in document:
        raise ValueError(
            "Event slug is required."
        )

    if "type" not in document:
        raise ValueError(
            "Event type is required."
        )

    if "status" not in document:
        document["status"] = "draft"

    return document


@admin_events_bp.get("")
@permission_required("events.view")
def get_admin_events():
    events = mongo.db.events.find({}).sort(
        "start_date",
        1,
    )

    return success({
        "events": [
            serialize_event(event)
            for event in events
        ]
    })


@admin_events_bp.post("")
@permission_required("events.create")
def create_event():
    data = request.get_json(
        silent=True
    ) or {}

    try:
        document = build_event_document(
            data
        )
    except ValueError as error:
        return failure(
            str(error),
            400,
        )

    now = datetime.now(timezone.utc)

    document["created_at"] = now
    document["updated_at"] = now
    current_user = get_current_user()
    if current_user:
        document["created_by"] = str(current_user["_id"])

    try:
        result = mongo.db.events.insert_one(
            document
        )
    except DuplicateKeyError:
        return failure(
            "An event with this slug already exists.",
            409,
        )

    event = mongo.db.events.find_one({
        "_id": result.inserted_id,
    })

    if event.get("status") == "published":
        create_notification("New campus event", f"{event.get('title', 'A campus event')} is now published.", "event", f"/events/{event.get('slug') or event['_id']}", roles=["student", "club_head"])
    else:
        create_notification("Event draft created", f"A draft event was created: {event.get('title', 'Untitled event')}.", "draft", "/dashboard/admin/events", roles=["admin"], actor_id=current_user.get("_id") if current_user else None)

    return success(
        {
            "event": serialize_event(event),
        },
        "Event created.",
        201,
    )


@admin_events_bp.patch("/<event_id>")
def update_event(event_id):
    current_user = get_current_user()
    if not current_user:
        return failure("Authenticated user not found.", 401)
    object_id = parse_object_id(
        event_id
    )

    if not object_id:
        return failure(
            "Invalid event ID.",
            400,
        )

    existing = mongo.db.events.find_one({
        "_id": object_id,
    })

    if not existing:
        return failure(
            "Event not found.",
            404,
        )

    previous_status = existing.get("status")

    can_edit_all = user_has_permission(current_user, "events.edit")
    owns_event = str(existing.get("created_by", "")) == str(current_user["_id"])
    can_edit_own = owns_event and user_has_permission(current_user, "events.edit_own")
    if not (can_edit_all or can_edit_own):
        return failure("You do not have permission to edit this event.", 403)

    data = request.get_json(
        silent=True
    ) or {}

    update = {}

    for field in EVENT_FIELDS:
        if field in data:
            update[field] = data[field]

    if not update:
        return failure(
            "No event fields were provided.",
            400,
        )

    update["updated_at"] = (
        datetime.now(timezone.utc)
    )

    try:
        mongo.db.events.update_one(
            {
                "_id": object_id,
            },
            {
                "$set": update,
            },
        )
    except DuplicateKeyError:
        return failure(
            "An event with this slug already exists.",
            409,
        )

    event = mongo.db.events.find_one({
        "_id": object_id,
    })

    if event.get("status") == "published" and previous_status != "published":
        create_notification("New campus event", f"{event.get('title', 'A campus event')} is now published.", "event", f"/events/{event.get('slug') or event['_id']}", roles=["student", "club_head"])
    elif event.get("status") == "draft" and previous_status != "draft":
        create_notification("Event moved to drafts", f"{event.get('title', 'An event')} is now a draft.", "draft", "/dashboard/admin/events", roles=["admin"], actor_id=current_user.get("_id"))

    return success(
        {
            "event": serialize_event(event),
        },
        "Event updated.",
    )


@admin_events_bp.delete("/<event_id>")
@permission_required("events.delete")
def delete_event(event_id):
    object_id = parse_object_id(
        event_id
    )

    if not object_id:
        return failure(
            "Invalid event ID.",
            400,
        )

    result = mongo.db.events.delete_one({
        "_id": object_id,
    })

    if result.deleted_count == 0:
        return failure(
            "Event not found.",
            404,
        )

    return success(
        {},
        "Event deleted.",
    )


@admin_events_bp.get("/<event_id>/registrations")
@permission_required("registrations.view")
def get_event_registrations(event_id):
    event_object_id = parse_object_id(event_id)
    if not event_object_id:
        return failure("Invalid event ID.", 400)
    event = mongo.db.events.find_one({"_id": event_object_id}, {"title": 1})
    if not event:
        return failure("Event not found.", 404)

    records = list(mongo.db.registrations.find({"event_id": event_object_id}).sort("registered_at", -1))
    student_ids = list({record["student_id"] for record in records})
    students = {
        student["_id"]: student
        for student in mongo.db.users.find(
            {"_id": {"$in": student_ids}},
            {"name": 1, "email": 1, "enrollment_id": 1, "college_name": 1},
        )
    } if student_ids else {}

    registrations = []
    for record in records:
        student = students.get(record["student_id"], {})
        registrations.append({
            "_id": str(record["_id"]),
            "status": record.get("status", "registered"),
            "registered_at": record.get("registered_at").isoformat() if hasattr(record.get("registered_at"), "isoformat") else record.get("registered_at"),
            "updated_at": record.get("updated_at").isoformat() if hasattr(record.get("updated_at"), "isoformat") else record.get("updated_at"),
            "student": {
                "_id": str(record["student_id"]),
                "name": student.get("name", "Student account unavailable"),
                "email": student.get("email", ""),
                "enrollment_id": student.get("enrollment_id", ""),
                "college_name": student.get("college_name", ""),
            },
        })
    return success({"event": {"_id": str(event_object_id), "title": event.get("title", "")}, "registrations": registrations}, "Event registrations fetched.")


@admin_events_bp.post("/<event_id>/registrations")
@permission_required("registrations.manage")
def add_event_registration(event_id):
    event_object_id = parse_object_id(event_id)
    if not event_object_id:
        return failure("Invalid event ID.", 400)
    if not mongo.db.events.find_one({"_id": event_object_id}, {"_id": 1}):
        return failure("Event not found.", 404)

    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    if not email or len(email) > 254:
        return failure("Enter the student's email address.", 400)
    student = mongo.db.users.find_one({"email": email, "role": {"$in": ["student", "club_head"]}, "is_active": {"$ne": False}}, {"_id": 1})
    if not student:
        return failure("No active student account was found for that email.", 404)

    now = datetime.now(timezone.utc)
    try:
        result = mongo.db.registrations.insert_one({
            "event_id": event_object_id,
            "student_id": student["_id"],
            "status": "registered",
            "registered_at": now,
            "updated_at": now,
            "managed_by_admin": True,
        })
    except DuplicateKeyError:
        return failure("This student already has a registration record. Update its status instead.", 409)
    except Exception:
        return failure("Unable to add the student to this event.", 500)

    return success({"registration_id": str(result.inserted_id)}, "Student added to the event.", 201)


@admin_events_bp.patch("/<event_id>/registrations/<registration_id>")
@permission_required("registrations.manage")
def update_event_registration(event_id, registration_id):
    event_object_id = parse_object_id(event_id)
    registration_object_id = parse_object_id(registration_id)
    if not event_object_id or not registration_object_id:
        return failure("Invalid event or registration ID.", 400)
    data = request.get_json(silent=True) or {}
    status = str(data.get("status", "")).strip().lower()
    if status not in {"registered", "cancelled", "attended", "waitlisted"}:
        return failure("Choose a valid registration status.", 400)
    result = mongo.db.registrations.update_one(
        {"_id": registration_object_id, "event_id": event_object_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc), "managed_by_admin": True}},
    )
    if result.matched_count == 0:
        return failure("Registration not found for this event.", 404)
    return success({"status": status}, "Registration status updated.")


@admin_events_bp.delete("/<event_id>/registrations/<registration_id>")
@permission_required("registrations.manage")
def remove_event_registration(event_id, registration_id):
    # Keep the registration row as cancelled so the student cannot
    # re-register after an administrator removes them from the roster.
    event_object_id = parse_object_id(event_id)
    registration_object_id = parse_object_id(registration_id)
    if not event_object_id or not registration_object_id:
        return failure("Invalid event or registration ID.", 400)
    result = mongo.db.registrations.update_one(
        {"_id": registration_object_id, "event_id": event_object_id},
        {"$set": {"status": "cancelled", "updated_at": datetime.now(timezone.utc), "managed_by_admin": True}},
    )
    if result.matched_count == 0:
        return failure("Registration not found for this event.", 404)
    return success({"status": "cancelled"}, "Student removed from the event roster.")
