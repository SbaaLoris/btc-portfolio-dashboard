from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, market, portfolio, transactions

settings = get_settings()

app = FastAPI(
    title="BTC Portfolio Dashboard API",
    version="1.0.0",
    description="Backend API for the BTC portfolio dashboard.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(portfolio.router)
app.include_router(market.router)

