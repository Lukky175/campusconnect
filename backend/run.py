from app import create_app

app = create_app()


@app.route("/")
def index():
    return {
        "success": True,
        "service": "CampusConnect API",
        "message": "Backend is running",
    }


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=app.config["PORT"],
        debug=app.config["DEBUG"],
    )