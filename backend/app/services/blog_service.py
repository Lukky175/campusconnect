import re
import uuid
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from pymongo import UpdateOne

from ..extensions import mongo


BLOG_STATUSES = {"draft", "published", "inactive"}
PUBLIC_BLOG_FIELDS = {
    "title": 1,
    "slug": 1,
    "excerpt": 1,
    "cover_image_url": 1,
    "author": 1,
    "tags": 1,
    "published_at": 1,
    "display_order": 1,
}
BLOG_FIELDS = {
    "title",
    "slug",
    "excerpt",
    "content",
    "cover_image_url",
    "author",
    "tags",
    "status",
    "display_order",
}


def slugify(value):
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or f"draft-{uuid.uuid4().hex[:12]}"


def build_blog_document(data, existing=None, creating=False):
    existing = existing or {}
    document = {}

    for field in BLOG_FIELDS:
        if field not in data:
            continue

        value = data[field]
        if field == "tags":
            if not isinstance(value, list):
                raise ValueError("Tags must be provided as a list.")
            document[field] = [
                str(tag).strip()[:40]
                for tag in value
                if str(tag).strip()
            ][:20]
        elif field == "display_order":
            try:
                document[field] = max(0, int(value))
            except (TypeError, ValueError):
                raise ValueError("Display order must be a whole number.")
        else:
            document[field] = str(value or "").strip()

    if creating:
        document.setdefault("title", "Untitled blog")
        document.setdefault("slug", f"draft-{uuid.uuid4().hex[:12]}")
        document.setdefault("excerpt", "")
        document.setdefault("content", "")
        document.setdefault("cover_image_url", "")
        document.setdefault("author", "")
        document.setdefault("tags", [])
        document.setdefault("status", "draft")
        document.setdefault("display_order", mongo.db.blogs.count_documents({}))

    result = {**existing, **document}

    for field, limit in (("title", 180), ("excerpt", 500), ("content", 100000), ("author", 100)):
        if len(result.get(field, "")) > limit:
            raise ValueError(f"{field.replace('_', ' ').capitalize()} is too long.")

    result["slug"] = str(result.get("slug", "")).strip().lower()
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", result["slug"]):
        raise ValueError("Slug may contain lowercase letters, numbers, and single hyphens.")

    if result.get("status") not in BLOG_STATUSES:
        raise ValueError("Status must be draft, published, or inactive.")

    image_url = result.get("cover_image_url", "")
    if image_url and not image_url.startswith(("https://", "http://")):
        raise ValueError("Cover image URL must start with http:// or https://.")

    if result["status"] == "published":
        required = ("title", "excerpt", "content")
        missing = [field for field in required if not result.get(field, "").strip()]
        if missing:
            raise ValueError("Published blogs require a title, excerpt, and content.")

    return document


def parse_object_id(value):
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


def serialize_blog(blog):
    result = dict(blog)
    result["_id"] = str(result["_id"])
    for field in ("created_at", "updated_at", "published_at"):
        value = result.get(field)
        if isinstance(value, datetime):
            result[field] = value.isoformat()
    return result


def list_public_blogs():
    return [
        serialize_blog(blog)
        for blog in mongo.db.blogs.find(
            {"status": "published"},
            PUBLIC_BLOG_FIELDS,
        ).sort([("display_order", 1), ("published_at", -1)])
    ]


def get_public_blog(slug):
    blog = mongo.db.blogs.find_one(
        {"slug": slug, "status": "published"},
        {**PUBLIC_BLOG_FIELDS, "content": 1},
    )
    return serialize_blog(blog) if blog else None


def list_admin_blogs():
    return [
        serialize_blog(blog)
        for blog in mongo.db.blogs.find({}).sort([("display_order", 1), ("updated_at", -1)])
    ]


def reorder_blogs(blog_ids):
    if not isinstance(blog_ids, list) or any(not isinstance(value, str) for value in blog_ids):
        raise ValueError("blog_ids must be a list of blog IDs.")

    object_ids = [parse_object_id(value) for value in blog_ids]
    if any(value is None for value in object_ids) or len(set(object_ids)) != len(object_ids):
        raise ValueError("The blog order contains an invalid or repeated ID.")

    existing_ids = set(mongo.db.blogs.distinct("_id"))
    if set(object_ids) != existing_ids:
        raise ValueError("The order must include every blog exactly once.")

    now = datetime.now(timezone.utc)
    if object_ids:
        mongo.db.blogs.bulk_write([
            UpdateOne(
                {"_id": object_id},
                {"$set": {"display_order": index, "updated_at": now}},
            )
            for index, object_id in enumerate(object_ids)
        ])
