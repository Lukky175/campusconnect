from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from flask import Blueprint, request
from pymongo.errors import DuplicateKeyError

from ..extensions import mongo
from ..utils.auth import permission_required
from ..utils.response import failure, success


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

    return success(
        {
            "event": serialize_event(event),
        },
        "Event created.",
        201,
    )


@admin_events_bp.patch("/<event_id>")
@permission_required("events.edit")
def update_event(event_id):
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