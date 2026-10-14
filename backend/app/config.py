import os
from datetime import timedelta

from dotenv import load_dotenv


load_dotenv()


class Config:
    DEBUG = os.getenv(
        "FLASK_ENV",
        "production",
    ) == "development"

    PORT = int(
        os.getenv(
            "PORT",
            "5000",
        )
    )

    MONGO_URI = os.getenv(
        "MONGO_URI",
        "mongodb://localhost:27017",
    )

    MONGO_DB_NAME = os.getenv(
        "MONGO_DB_NAME",
        "campus_connect",
    )

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "dev-only-change-this-secret",
    )

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_SECONDS", "28800"))
    )

    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:8080",
        ).split(",")
        if origin.strip()
    ]
