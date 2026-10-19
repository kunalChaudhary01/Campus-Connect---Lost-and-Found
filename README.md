# Campus Connect

Campus Connect is a full-stack campus lost and found platform. Students can report lost or found items, discover matching reports, request items, and communicate privately after approval.

## Current Slice

The initial implementation includes:

- Flask application factory with CORS and PyMongo
- MongoDB-ready configuration (MongoDB Atlas or local MongoDB)
- JWT registration, login, current-user, and logout endpoints
- Secure Werkzeug password hashing
- React/Vite authentication shell with protected dashboard and profile routes
- Responsive student-focused UI foundation

The remaining modules are structured to be added incrementally: posts, requests, chat, notifications, reports, admin controls, and possible matching.

## Structure

- `Backend/app`: Flask application, routes, schemas, helpers, and extensions
- `Frontend/src`: React pages, reusable layout, context, routes, and services

## Backend Setup

```bash
cd Backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
python run.py
```

Set `MONGO_URI` and `MONGO_DATABASE` in `.env` before starting the backend:

```text
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=campus_connect
```

The API runs at `http://localhost:5000`.

## Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Initial API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/health`

All successful responses use `{ "success": true, "message": "...", "data": {} }`; validation and authorization errors return the same shape with an appropriate HTTP status.

## Planned API Areas

Posts, item requests, conversations/messages, notifications, user profiles, reports, and admin moderation will be added behind dedicated blueprints and service modules.
