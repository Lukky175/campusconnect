from urllib.parse import quote
from xml.sax.saxutils import escape

from flask import Blueprint, Response, current_app

from ..extensions import mongo


seo_bp = Blueprint("seo", __name__)

PUBLIC_PATHS = (
    "/",
    "/events",
    "/hackathons",
    "/workshops",
    "/competitions",
    "/clubs",
    "/blog",
    "/about",
    "/contact",
    "/faq",
)


def _last_modified(value):
    if not value:
        return None
    if hasattr(value, "isoformat"):
        return value.date().isoformat() if hasattr(value, "date") else value.isoformat()
    return str(value)[:10]


def _sitemap_entry(origin, path, last_modified=None):
    parts = ["  <url>", f"    <loc>{escape(origin + path)}</loc>"]
    if last_modified:
        parts.append(f"    <lastmod>{escape(last_modified)}</lastmod>")
    parts.append("  </url>")
    return "\n".join(parts)


@seo_bp.get("/sitemap.xml")
def sitemap():
    origin = current_app.config["SITE_URL"].rstrip("/")
    entries = [_sitemap_entry(origin, path) for path in PUBLIC_PATHS]

    try:
        blogs = mongo.db.blogs.find(
            {"status": "published"},
            {"slug": 1, "updated_at": 1, "published_at": 1},
        )
        for blog in blogs:
            slug = blog.get("slug")
            if slug:
                path = "/blog/" + quote(str(slug), safe="-._~")
                modified = _last_modified(blog.get("updated_at") or blog.get("published_at"))
                entries.append(_sitemap_entry(origin, path, modified))

        events = mongo.db.events.find(
            {"status": "published"},
            {"slug": 1, "updated_at": 1, "start_date": 1, "_id": 1},
        )
        for event in events:
            identifier = event.get("slug") or str(event["_id"])
            path = "/events/" + quote(str(identifier), safe="-._~")
            modified = _last_modified(event.get("updated_at"))
            entries.append(_sitemap_entry(origin, path, modified))
    except Exception:
        return Response(
            "Sitemap data is temporarily unavailable.",
            status=503,
            mimetype="text/plain",
        )

    document = "\n".join(
        [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            *entries,
            "</urlset>",
        ]
    )
    response = Response(document, mimetype="application/xml")
    response.headers["Cache-Control"] = "public, max-age=300"
    return response
