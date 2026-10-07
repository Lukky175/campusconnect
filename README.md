# CampusConnect

Production-oriented full-stack foundation for discovering university events, hackathons,
workshops, competitions, and student technology opportunities.

## Stack

- Frontend: React + Vite + Tailwind CSS v4 + React Router
- State/UI: React Context + hooks
- Backend: Flask + PyMongo
- Database: MongoDB Atlas
- Authentication foundation: password hashing with Werkzeug
- Containers: Docker + Docker Compose
- Configuration: environment variables

## Project structure

```text
CampusConnect/
├── frontend/
│   ├── index.html
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── theme/
│       │   └── tokens.css
│       ├── context/
│       │   ├── ThemeContext.jsx
│       │   └── ToastContext.jsx
│       ├── config/
│       │   └── env.js
│       ├── services/
│       │   └── api.js
│       ├── components/
│       │   ├── common/
│       │   ├── layout/
│       │   └── events/
│       ├── pages/
│       │   ├── public/
│       │   ├── auth/
│       │   └── dashboard/
│       └── routes/
│           └── ProtectedRoute.jsx
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       ├── config.py
│       ├── extensions.py
│       ├── routes/
│       ├── services/
│       └── utils/
└── docker-compose.yml
```

## 1. Local frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## 2. Backend setup

Create `backend/.env` from `backend/.env.example`.

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python run.py
```

Backend: http://localhost:5000

## 3. MongoDB Atlas

Set:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
MONGO_DB_NAME=campus_connect
```

Never commit `backend/.env`.

## 4. Docker

From the project root:

```bash
docker compose up --build
```

Frontend: http://localhost:8080  
Backend: http://localhost:5000

## Important security note

The user database stores a password hash, not the original password. Do not store plain-text
passwords. For production, add refresh tokens/session strategy, email verification,
rate limiting, CSRF protection where applicable, stricter CORS, secret management,
audit logging, and HTTPS.
