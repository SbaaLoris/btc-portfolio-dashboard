# BTC Portfolio Dashboard

A design-first full-stack BTC portfolio tracker with a FastAPI backend, PostgreSQL persistence, JWT authentication, and a polished React dashboard.

## Stack

- Backend: FastAPI, SQLAlchemy, Alembic, Pydantic, PostgreSQL
- Frontend: Vite, React, TypeScript, Tailwind CSS, shadcn-style components, TanStack Query, Zod, Recharts
- Docs: OpenAPI contract in `docs/openapi.yaml`
- Deployment target: Render backend and PostgreSQL, static frontend hosting

## Local Development

Backend:

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The API runs at `http://localhost:8000` and the frontend at `http://localhost:5173`.

## API Contract

The API is documented design-first in `docs/openapi.yaml`. Backend routes should stay aligned with that contract.

