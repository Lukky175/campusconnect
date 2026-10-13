from app import create_app
from app.extensions import mongo
from app.utils.permissions import initialize_roles


app = create_app()


with app.app_context():
    mongo.db.users.create_index(
        "email",
        unique=True,
    )

    mongo.db.events.create_index(
        "slug",
        unique=True,
    )

    mongo.db.events.create_index([
        ("status", 1),
        ("start_date", 1),
    ])

    mongo.db.events.create_index([
        ("type", 1),
        ("status", 1),
        ("start_date", 1),
    ])

    mongo.db.roles.create_index(
        "name",
        unique=True,
    )

    # Registration indexes
    mongo.db.registrations.create_index([
        ("event_id", 1),
        ("student_id", 1),
    ], unique=True)

    mongo.db.registrations.create_index([
        ("student_id", 1),
        ("registered_at", -1),
    ])

    mongo.db.registrations.create_index([
        ("event_id", 1),
        ("status", 1),
    ])

    initialize_roles()

    print("Database indexes and roles initialized.")
