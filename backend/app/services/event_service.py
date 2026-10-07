from datetime import datetime, timezone

from bson import ObjectId

from ..extensions import mongo
from ..utils.serializers import serialize_document


def list_published_events():

    documents = (
        mongo.db.events
        .find(
            {"status": "published"},
            {"internal_notes": 0},
        )
        .sort("start_date", 1)
    )

    return [
        serialize_document(document)
        for document in documents
    ]


def get_published_event(identifier):

    if ObjectId.is_valid(identifier):

        query = {
            "$or": [
                {"slug": identifier},
                {"_id": ObjectId(identifier)},
            ]
        }

    else:

        query = {
            "slug": identifier
        }


    document = mongo.db.events.find_one(
        {
            "$and": [
                {"status": "published"},
                query,
            ]
        },
        {
            "internal_notes": 0
        },
    )


    if not document:
        return None

    return serialize_document(document)


def create_event(data):

    now = datetime.now(timezone.utc)

    document = {

        "title":
            data["title"].strip(),

        "slug":
            data["slug"].strip().lower(),

        "type":
            data["type"],

        "mode":
            data.get("mode", "Offline"),

        "description":
            data["description"].strip(),

        "details":
            data.get("details", "").strip(),

        "date":
            data["date"],

        "time":
            data.get("time", "").strip(),

        "start_date":
            data.get("start_date"),

        "location":
            data.get("location", "").strip(),

        "college":
            data.get("college", "").strip(),

        "city":
            data.get("city", "").strip(),

        "state":
            data.get("state", "").strip(),

        "country":
            data.get("country", "India").strip(),

        "audience":
            data.get(
                "audience",
                "College students"
            ).strip(),

        "eligibility":
            data.get(
                "eligibility",
                ""
            ).strip(),

        "team_size":
            data.get(
                "team_size",
                {
                    "min": 1,
                    "max": 1
                }
            ),

        "organizer":
            data.get(
                "organizer",
                ""
            ).strip(),

        "registration_url":
            data.get(
                "registration_url",
                ""
            ).strip(),

        "registration_deadline":
            data.get(
                "registration_deadline"
            ),

        "tags":
            data.get(
                "tags",
                []
            ),

        "highlights":
            data.get(
                "highlights",
                []
            ),

        "status":
            data.get(
                "status",
                "draft"
            ),

        "created_at":
            now,

        "updated_at":
            now,
    }


    result = mongo.db.events.insert_one(
        document
    )

    document["_id"] = result.inserted_id

    return serialize_document(document)