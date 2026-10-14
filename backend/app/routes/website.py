from datetime import datetime, timezone
from uuid import uuid4

from flask import Blueprint, request

from ..extensions import mongo
from ..utils.auth import role_required
from ..utils.response import failure, success


website_bp = Blueprint("website", __name__)
admin_website_bp = Blueprint("admin_website", __name__)

DEFAULT_SETTINGS = {
    "phone": "",
    "email": "",
    "address": "Bennett University, Greater Noida, Uttar Pradesh, India",
    "office_hours": "",
    "faqs": [],
}


def get_settings():
    """Ensure the editable public settings document exists."""
    now = datetime.now(timezone.utc)
    mongo.db.website_settings.update_one(
        {"_id": "public"},
        {"$setOnInsert": {**DEFAULT_SETTINGS, "created_at": now, "updated_at": now}},
        upsert=True,
    )
    return mongo.db.website_settings.find_one({"_id": "public"})


def serialize_settings(document):
    return {
        "phone": document.get("phone", ""),
        "email": document.get("email", ""),
        "address": document.get("address", ""),
        "office_hours": document.get("office_hours", ""),
        "faqs": [
            {"id": faq["id"], "question": faq["question"], "answer": faq["answer"]}
            for faq in document.get("faqs", [])
        ],
    }


@website_bp.get("")
def get_public_settings():
    try:
        return success(serialize_settings(get_settings()), "Website information fetched.")
    except Exception:
        return failure("Unable to fetch website information right now.", 500)


@website_bp.post("/contact")
def submit_contact_message():
    data = request.get_json(silent=True) or {}
    fields = ("first_name", "last_name", "phone", "email", "topic", "query")
    values = {field: str(data.get(field, "")).strip() for field in fields}
    if any(not value for value in values.values()):
        return failure("Please complete all required fields.", 400)
    if len(values["email"]) > 254 or "@" not in values["email"]:
        return failure("Enter a valid email address.", 400)
    if any(len(values[field]) > limit for field, limit in {
        "first_name": 100, "last_name": 100, "phone": 40,
        "email": 254, "topic": 160, "query": 10000,
    }.items()):
        return failure("One or more fields are too long.", 400)

    try:
        result = mongo.db.contact_submissions.insert_one({
            **values,
            "status": "new",
            "submitted_at": datetime.now(timezone.utc),
        })
    except Exception:
        return failure("Unable to send your message right now. Please try again later.", 500)
    return success({"submission_id": str(result.inserted_id)}, "Your message has been sent.", 201)


@admin_website_bp.get("")
@role_required("admin")
def get_admin_settings():
    try:
        return success(serialize_settings(get_settings()), "Website settings fetched.")
    except Exception:
        return failure("Unable to fetch website settings right now.", 500)


@admin_website_bp.put("")
@role_required("admin")
def update_admin_settings():
    data = request.get_json(silent=True) or {}
    fields = ("phone", "email", "address", "office_hours")
    settings = {field: str(data.get(field, "")).strip() for field in fields}
    if any(len(value) > 2000 for value in settings.values()):
        return failure("Contact information fields must be under 2,000 characters.", 400)
    if settings["email"] and (len(settings["email"]) > 254 or "@" not in settings["email"]):
        return failure("Enter a valid contact email address.", 400)

    faqs = data.get("faqs", [])
    if not isinstance(faqs, list) or len(faqs) > 200:
        return failure("FAQs must be a list containing at most 200 entries.", 400)
    normalized_faqs = []
    for faq in faqs:
        if not isinstance(faq, dict):
            return failure("Each FAQ must include a question and answer.", 400)
        question = str(faq.get("question", "")).strip()
        answer = str(faq.get("answer", "")).strip()
        if not question or not answer:
            return failure("FAQ questions and answers cannot be empty.", 400)
        if len(question) > 500 or len(answer) > 10000:
            return failure("An FAQ question or answer is too long.", 400)
        normalized_faqs.append({
            "id": str(faq.get("id") or uuid4()),
            "question": question,
            "answer": answer,
        })

    try:
        mongo.db.website_settings.update_one(
            {"_id": "public"},
            {"$set": {**settings, "faqs": normalized_faqs, "updated_at": datetime.now(timezone.utc)},
             "$setOnInsert": {"created_at": datetime.now(timezone.utc)}},
            upsert=True,
        )
        return success(serialize_settings(get_settings()), "Website settings saved.")
    except Exception:
        return failure("Unable to save website settings right now.", 500)
