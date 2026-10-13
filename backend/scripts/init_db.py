from datetime import datetime, timezone

from app import create_app
from app.extensions import mongo
from app.utils.permissions import initialize_roles


CLUBS = [
    {
        "slug": "geeksforgeeks",
        "name": "GeeksforGeeks Society",
        "short_name": "GFG-BU",
        "category": "Programming & software development",
        "summary": "A student chapter focused on programming, software development, and building a collaborative coding culture.",
        "description": "GeeksforGeeks-BU supports coding enthusiasts through skill-based learning, technical workshops, hackathons, mock interviews, and conversations with industry professionals. The chapter also emphasizes communication and teamwork alongside technical growth.",
        "focus_areas": ["Programming", "Software development", "Coding culture"],
        "links": [
            {"label": "Instagram", "url": "https://www.instagram.com/geeksforgeeks_bu/"},
            {"label": "LinkedIn", "url": "https://www.linkedin.com/company/gfg-bu/"},
        ],
    },
    {
        "slug": "codechef",
        "name": "CodeChef",
        "short_name": "CodeChef BU",
        "category": "Competitive programming",
        "summary": "A community for learning problem solving, competitive programming, and writing efficient code.",
        "description": "The Bennett chapter describes activities ranging from introductory programming sessions to advanced contests and hackathons. It shares guidance on coding contests and opportunities to practice data structures, algorithms, and multiple programming languages.",
        "focus_areas": ["Problem solving", "Competitive programming", "Data structures and algorithms"],
        "links": [],
    },
    {
        "slug": "gdsc",
        "name": "Google Developer Student Clubs",
        "short_name": "GDSC BU",
        "category": "Developer technologies",
        "summary": "A peer learning community for students interested in developer technologies and building solutions with technology.",
        "description": "The chapter connects students through hands-on learning, technical talks, workshops, and project-building activities. Its focus includes learning together, applying technology to local problems, and sharing knowledge with the campus community.",
        "focus_areas": ["Developer technologies", "Peer learning", "Project building"],
        "links": [
            {"label": "GDG on Campus", "url": "https://gdg.community.dev/gdg-on-campus-bennett-university-greater-noida-india/"},
            {"label": "Instagram", "url": "https://www.instagram.com/gdsc__bu/"},
        ],
    },
    {
        "slug": "acm",
        "name": "ACM Bennett",
        "short_name": "ACM",
        "category": "Computing & research",
        "summary": "A computing community that encourages technical learning, professional growth, and the exchange of ideas.",
        "description": "The Bennett ACM chapter is part of the Association for Computing Machinery community. ACM brings together people across computing and supports learning, career development, professional networking, and the exchange of ideas around the field.",
        "focus_areas": ["Computing", "Research", "Professional development"],
        "links": [
            {"label": "Instagram", "url": "https://www.instagram.com/acm_bennett/"},
            {"label": "LinkedIn", "url": "https://www.linkedin.com/company/acm-bennett/"},
        ],
    },
    {
        "slug": "csi",
        "name": "Computer Society of India",
        "short_name": "CSI BU",
        "category": "Computing & professional development",
        "summary": "A student chapter that brings together technical activities, learning resources, and career-focused experiences.",
        "description": "CSI Bennett describes workshops, competitions, technical symposiums, guest lectures, research support, and opportunities to build technical and soft skills. Its activities aim to make computing resources and career pathways more accessible to students.",
        "focus_areas": ["Computing", "Technical activities", "Career development"],
        "links": [],
    },
    {
        "slug": "hackerearth",
        "name": "BU HackerEarth",
        "short_name": "HackerEarth BU",
        "category": "Coding challenges & hackathons",
        "summary": "A platform-oriented club for programming practice, coding challenges, and hackathons.",
        "description": "The chapter description highlights coding skill development, training programs, and expert talks alongside programming challenges and hackathons. Its stated aim is to help students build practical skills in current technologies.",
        "focus_areas": ["Coding challenges", "Hackathons", "Technical training"],
        "links": [],
    },
    {
        "slug": "alan-turing",
        "name": "Alan Turing Club",
        "short_name": "ATC",
        "category": "DSA, web development & competitive programming",
        "summary": "A student community centered on coding practice, data structures and algorithms, and web development.",
        "description": "The club describes guided practice in data structures and algorithms, web development, and competitive programming. Its activities also include project experience, self-assessment, and exposure to teamwork and open-source work.",
        "focus_areas": ["Data structures and algorithms", "Web development", "Competitive programming"],
        "links": [
            {"label": "Instagram", "url": "https://instagram.com/alanturingclub_bu"},
        ],
    },
]


def initialize_database():
    app = create_app()

    with app.app_context():
        mongo.db.users.create_index("email", unique=True)

        mongo.db.events.create_index("slug", unique=True)

        mongo.db.events.create_index([("status", 1), ("start_date", 1)])

        mongo.db.events.create_index([("type", 1), ("status", 1), ("start_date", 1)])

        mongo.db.roles.create_index("name", unique=True)

        # Registration indexes
        mongo.db.registrations.create_index([("event_id", 1), ("student_id", 1)], unique=True)

        mongo.db.registrations.create_index([("student_id", 1), ("registered_at", -1)])

        mongo.db.registrations.create_index([("event_id", 1), ("status", 1)])

        mongo.db.clubs.create_index("slug", unique=True)
        mongo.db.clubs.create_index([("status", 1), ("display_order", 1)])

        now = datetime.now(timezone.utc)
        for display_order, club in enumerate(CLUBS, start=1):
            mongo.db.clubs.update_one(
                {"slug": club["slug"]},
                {
                    "$setOnInsert": {
                        **club,
                        "status": "published",
                        "display_order": display_order,
                        "created_at": now,
                        "updated_at": now,
                    }
                },
                upsert=True,
            )

        initialize_roles()

        print("Database indexes, roles, and club catalog initialized.")


if __name__ == "__main__":
    initialize_database()
