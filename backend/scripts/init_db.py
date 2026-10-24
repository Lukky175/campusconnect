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
    {
        "slug": "ieee",
        "name": "IEEE Bennett Student Branch",
        "short_name": "IEEE BU",
        "category": "Engineering & emerging technology",
        "summary": "A student branch focused on technology, engineering, and learning from industry and research communities.",
        "description": "Bennett University's School of Computer Science page describes the IEEE student branch as providing exposure to current technology and opportunities to learn with industry and research communities.",
        "focus_areas": ["Engineering", "Emerging technology", "Industry and research"],
        "links": [
            {"label": "Instagram", "url": "https://instagram.com/ieee_bu"},
            {"label": "LinkedIn", "url": "https://www.linkedin.com/company/ieee-bennett-student-branch/"},
        ],
    },
    {
        "slug": "ieee-wie",
        "name": "IEEE Women in Engineering",
        "short_name": "IEEE WIE",
        "category": "Women in technology & engineering",
        "summary": "A community supporting women in engineering and science through mentorship and peer connection.",
        "description": "Bennett University's School of Computer Science page describes IEEE-WIE as a community that supports women engineers and scientists and encourages girls to pursue STEM careers.",
        "focus_areas": ["Women in STEM", "Mentorship", "Engineering"],
        "links": [
            {"label": "Instagram", "url": "https://www.instagram.com/wie.bennett/"},
        ],
    },
    {
        "slug": "technotix",
        "name": "Technotix",
        "short_name": "Technotix",
        "category": "Robotics & hardware",
        "summary": "A robotics club for students interested in building, experimenting, and exploring technology.",
        "description": "Bennett University describes Technotix as its robotics club, with educational workshops and activities for students interested in robotics and fabrication.",
        "focus_areas": ["Robotics", "Hardware", "Workshops"],
        "links": [
            {"label": "Instagram", "url": "https://www.instagram.com/technotix_bennett/"},
            {"label": "LinkedIn", "url": "https://www.linkedin.com/company/technotix-bu/"},
        ],
    },
    {
        "slug": "solace-studio",
        "name": "Solace Studio",
        "short_name": "Solace",
        "category": "Game development",
        "summary": "A student community for aspiring game developers and people interested in creating games.",
        "description": "Bennett University's Gaming specialization page describes Solace Studio as a supportive platform for aspiring game developers.",
        "focus_areas": ["Game development", "Interactive media", "Creative technology"],
        "links": [],
    },
    {
        "slug": "artificial-intelligence-society",
        "name": "Bennett Artificial Intelligence Society",
        "short_name": "BIAS",
        "category": "Artificial intelligence & machine learning",
        "summary": "A student society for learners interested in machine learning, AI research, and practical projects.",
        "description": "Bennett University's AI specialization page describes the society as supporting educational, professional, and social interaction for undergraduates interested in machine learning, with labs, reading groups, and workshops.",
        "focus_areas": ["Artificial intelligence", "Machine learning", "Research and projects"],
        "links": [],
    },
    {
        "slug": "indian-blockchain-fraternity",
        "name": "Indian Blockchain Fraternity",
        "short_name": "IBF",
        "category": "Blockchain & Web3",
        "summary": "A student community focused on blockchain learning, awareness, and hands-on projects.",
        "description": "Bennett University's Blockchain specialization page describes IBF as a blockchain community that works to build awareness and nurture student talent through technical learning and hands-on work.",
        "focus_areas": ["Blockchain", "Web3", "Technical projects"],
        "links": [
            {"label": "Instagram", "url": "https://www.instagram.com/ibf.bu/"},
            {"label": "LinkedIn", "url": "https://www.linkedin.com/company/indian-blockchain-fraternity"},
        ],
    },
    {
        "slug": "ciphers-club",
        "name": "Cipher's Club",
        "short_name": "Cipher's",
        "category": "Cybersecurity",
        "summary": "A community for students interested in cybersecurity and practical security challenges.",
        "description": "Bennett University's CSE program pages describe Cipher's Club as a community for cybersecurity enthusiasts that promotes security awareness and represents Bennett in hackathons.",
        "focus_areas": ["Cybersecurity", "Security awareness", "Hackathons"],
        "links": [],
    },
    {
        "slug": "trailblazer-devops",
        "name": "Trailblazer (DevOps Club)",
        "short_name": "Trailblazer",
        "category": "DevOps & cloud engineering",
        "summary": "A student club promoting DevOps practices, tools, collaborative learning, and project work.",
        "description": "Bennett University's DevOps specialization page lists the Trailblazer club and describes it as encouraging DevOps culture, tools, project-based learning, and sharing student work.",
        "focus_areas": ["DevOps", "Cloud", "Automation and deployment"],
        "links": [],
    },
    {
        "slug": "atlas-analytics",
        "name": "Atlas Analytics",
        "short_name": "Atlas Analytics",
        "category": "Data science & analytics",
        "summary": "A student community for people interested in data science, analytics, and working with data.",
        "description": "Bennett University's Data Science specialization page lists Atlas Analytics and describes a community for students interested in data and data science.",
        "focus_areas": ["Data science", "Analytics", "Data visualization"],
        "links": [],
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

        mongo.db.blogs.create_index("slug", unique=True)
        mongo.db.blogs.create_index([("status", 1), ("display_order", 1), ("published_at", -1)])

        mongo.db.contact_submissions.create_index([("status", 1), ("submitted_at", -1)])
        mongo.db.feed_posts.create_index([("created_at", -1), ("_id", -1)])
        mongo.db.feed_posts.create_index([("author_id", 1), ("created_at", -1)])
        mongo.db.feed_reactions.create_index([("post_id", 1), ("user_id", 1)], unique=True)
        mongo.db.feed_reactions.create_index([("post_id", 1), ("created_at", -1)])
        mongo.db.feed_saves.create_index([("user_id", 1), ("post_id", 1)], unique=True)
        mongo.db.feed_blocks.create_index([("blocker_id", 1), ("blocked_user_id", 1)], unique=True)
        mongo.db.feed_blocks.create_index([("blocker_id", 1), ("created_at", -1)])
        mongo.db.feed_reports.create_index([("post_id", 1), ("reporter_id", 1)], unique=True)
        mongo.db.feed_reports.create_index([("status", 1), ("created_at", -1)])
        mongo.db.feed_comments.create_index([("post_id", 1), ("created_at", 1), ("_id", 1)])
        mongo.db.feed_comments.create_index([("author_id", 1), ("created_at", -1)])
        mongo.db.feed_comment_reactions.create_index([("comment_id", 1), ("user_id", 1)], unique=True)
        mongo.db.feed_comment_reactions.create_index([("comment_id", 1), ("created_at", -1)])
        mongo.db.website_settings.update_one(
            {"_id": "public"},
            {"$setOnInsert": {
                "phone": "",
                "email": "",
                "address": "Bennett University, Greater Noida, Uttar Pradesh, India",
                "office_hours": "",
                "faqs": [],
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            }},
            upsert=True,
        )

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
