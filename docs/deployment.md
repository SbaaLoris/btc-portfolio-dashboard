# Render Deployment

This app is ready for a Render backend, Render PostgreSQL database, and static frontend hosting.

## 1. Backend Web Service

Create a Render Web Service from this repository.

- Root directory: `backend`
- Runtime: Python
- Build command: `pip install -r requirements.txt`
- Start command: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Set environment variables:

```bash
DATABASE_URL=<Render PostgreSQL internal database URL>
JWT_SECRET_KEY=<long random secret>
JWT_EXPIRES_MINUTES=1440
CORS_ORIGINS=https://<frontend-host>
COINGECKO_API_KEY=<optional CoinGecko API key>
MARKET_CACHE_TTL_SECONDS=60
```

Render often provides PostgreSQL URLs beginning with `postgres://`. SQLAlchemy accepts `postgresql+psycopg://`; if needed, copy the internal URL and replace the prefix manually in `DATABASE_URL`.

## 2. PostgreSQL

Create a Render PostgreSQL instance in the same region as the backend. Use the internal connection URL for the backend service.

Migrations run automatically on backend startup through:

```bash
alembic upgrade head
```

## 3. Frontend Static Site

Create a Render Static Site or deploy the `frontend` directory to Vercel.

For Render Static Site:

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`

Set environment variables:

```bash
VITE_API_URL=https://<backend-service>.onrender.com
```

After changing `VITE_API_URL`, rebuild the frontend because Vite injects it at build time.

## 4. Smoke Test

After deploy:

1. Open `https://<backend-service>.onrender.com/health` and confirm `{"status":"ok"}`.
2. Open the frontend.
3. Create an account.
4. Add a BTC buy transaction.
5. Confirm dashboard metrics and charts load.
6. Edit and delete the transaction.

If market data does not load, check `COINGECKO_API_KEY`, outbound network access, and backend logs. The backend uses cached market data when available.

