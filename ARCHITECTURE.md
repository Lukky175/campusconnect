# CampusConnect architecture

## Frontend dependency direction

```text
Pages
  ↓
Components
  ↓
Services / Context
  ↓
HTTP API
```

- `pages/` owns page composition and route-level UI.
- `components/` owns reusable visual building blocks.
- `context/` owns cross-cutting UI state such as theme and notifications.
- `services/` owns HTTP calls.
- `config/` owns runtime configuration.
- `theme/` owns design tokens.
- `routes/` owns route guards.

Avoid putting database calls, fetch calls or global state directly inside reusable visual components.

## Backend dependency direction

```text
Routes → Services → Extensions / Database
```

- Routes validate HTTP input/output concerns.
- Services contain business logic.
- Extensions own infrastructure clients.
- Utilities contain small reusable helpers.

As the application grows, add domain modules such as:

```text
app/
├── routes/
│   ├── auth.py
│   ├── events.py
│   ├── registrations.py
│   ├── clubs.py
│   └── users.py
├── services/
│   ├── auth_service.py
│   ├── event_service.py
│   └── registration_service.py
└── models/
    └── ...
```

## MongoDB collections

Initial collections:

- `users`
- `events`

Recommended next collections:

- `event_registrations`
- `clubs`
- `blog_posts`
- `contact_messages`

Never put passwords directly in documents. Store a password hash only.
