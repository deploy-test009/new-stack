# YUVA starter: Next.js + NestJS + Postgres

Tiny events app to prove the three pieces talk to each other.

```
Browser -> Next.js (:3000) --fetch--> NestJS (:4000) --TypeORM--> Postgres (:5432)
```

## Run locally

```bash
# 1. database
docker compose up -d

# 2. backend
cd backend
cp .env.example .env
npm install
npm run start:dev        # http://localhost:4000/health

# 3. frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev              # http://localhost:3000
```

No Docker? Install Postgres locally and set `DATABASE_URL` in `backend/.env`.

## API

| Method | Path          | What                 |
|--------|---------------|----------------------|
| GET    | /health       | liveness check       |
| GET    | /events       | list, sorted by date |
| GET    | /events/:id   | one event            |
| POST   | /events       | create               |
| PATCH  | /events/:id   | partial update       |
| DELETE | /events/:id   | delete               |

Body for POST: `{ "title", "venue", "startAt" (ISO), "description"? }`

## Config

| Var | Where | Purpose |
|-----|-------|---------|
| DATABASE_URL | backend | Postgres connection string |
| FRONTEND_URL | backend | allowed CORS origin |
| PORT | backend | default 4000 |
| DB_SYNC | backend | `true` auto-creates tables (dev only) |
| NEXT_PUBLIC_API_URL | frontend | backend URL; baked in at build time |

## Before hosting

- Set `DB_SYNC=false` and move to migrations.
- Set `FRONTEND_URL` to the real frontend origin.
- `NEXT_PUBLIC_API_URL` is compiled into the frontend build, so it must be set when the image/build is made.
