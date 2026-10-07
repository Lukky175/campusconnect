from app import create_app
from app.extensions import mongo
from app.utils.permissions import initialize_roles


app = create_app()


with app.app_context():

    # ---------------------------------------------------------
    # Users
    # ---------------------------------------------------------
    mongo.db.users.create_index(
        "email",
        unique=True,
    )

    # ---------------------------------------------------------
    # Events
    # ---------------------------------------------------------
    mongo.db.events.create_index(
        "slug",
        unique=True,
    )

    mongo.db.events.create_index(
        [
            ("status", 1),
            ("start_date", 1),
        ]
    )

    mongo.db.events.create_index(
        [
            ("type", 1),
            ("status", 1),
            ("start_date", 1),
        ]
    )

    # ---------------------------------------------------------
    # Roles
    # ---------------------------------------------------------
    mongo.db.roles.create_index(
        "name",
        unique=True,
    )

    # Create default roles and permissions
    # if they do not already exist.
    #
    # Existing roles are NOT overwritten.
    # This is important because permissions may later
    # be changed from the admin UI.
    initialize_roles()

    print(
        "Database indexes and roles initialized."
    )