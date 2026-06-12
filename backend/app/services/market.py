from datetime import datetime, timedelta, timezone

import httpx
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import PriceSnapshot
from app.schemas.market import MarketChartPoint, MarketPrice


SUPPORTED_CURRENCIES = {"CHF", "USD", "EUR"}
RANGE_TO_DAYS = {"7d": "7", "30d": "30", "90d": "90", "365d": "365"}


def normalize_currency(currency: str) -> str:
    value = currency.upper()
    if value not in SUPPORTED_CURRENCIES:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unsupported currency")
    return value


class MarketService:
    def __init__(self, db: Session):
        self.db = db
        self.settings = get_settings()

    def get_price(self, currency: str = "CHF") -> MarketPrice:
        currency = normalize_currency(currency)
        cache_key = f"btc:price:{currency}"
        cached = self._fresh_cache(cache_key)
        if cached:
            return MarketPrice(**cached.payload)

        try:
            params = {
                "ids": "bitcoin",
                "vs_currencies": currency.lower(),
                "include_market_cap": "true",
                "include_24hr_vol": "true",
                "include_24hr_change": "true",
                "include_last_updated_at": "true",
            }
            data = self._get("https://api.coingecko.com/api/v3/simple/price", params)
            bitcoin = data["bitcoin"]
            updated_timestamp = bitcoin.get("last_updated_at")
            payload = MarketPrice(
                currency=currency,
                price=float(bitcoin[currency.lower()]),
                market_cap=_optional_float(bitcoin.get(f"{currency.lower()}_market_cap")),
                volume_24h=_optional_float(bitcoin.get(f"{currency.lower()}_24h_vol")),
                change_24h=_optional_float(bitcoin.get(f"{currency.lower()}_24h_change")),
                updated_at=datetime.fromtimestamp(updated_timestamp, tz=timezone.utc)
                if updated_timestamp
                else datetime.now(timezone.utc),
            )
            self._store_cache(cache_key, payload.model_dump(mode="json"))
            return payload
        except Exception as exc:
            stale = self._any_cache(cache_key)
            if stale:
                return MarketPrice(**stale.payload)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Market data unavailable",
            ) from exc

    def get_chart(self, currency: str = "CHF", range_value: str = "30d") -> list[MarketChartPoint]:
        currency = normalize_currency(currency)
        if range_value not in RANGE_TO_DAYS:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unsupported range")

        cache_key = f"btc:chart:{currency}:{range_value}"
        cached = self._fresh_cache(cache_key)
        if cached:
            return [MarketChartPoint(**point) for point in cached.payload["points"]]

        try:
            data = self._get(
                "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart",
                {"vs_currency": currency.lower(), "days": RANGE_TO_DAYS[range_value]},
            )
            points = [
                MarketChartPoint(
                    timestamp=datetime.fromtimestamp(timestamp / 1000, tz=timezone.utc),
                    price=float(price),
                )
                for timestamp, price in data["prices"]
            ]
            self._store_cache(cache_key, {"points": [point.model_dump(mode="json") for point in points]})
            return points
        except Exception as exc:
            stale = self._any_cache(cache_key)
            if stale:
                return [MarketChartPoint(**point) for point in stale.payload["points"]]
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Market data unavailable",
            ) from exc

    def _get(self, url: str, params: dict[str, str]) -> dict:
        headers = {}
        if self.settings.coingecko_api_key:
            headers["x-cg-demo-api-key"] = self.settings.coingecko_api_key
        with httpx.Client(timeout=10) as client:
            response = client.get(url, params=params, headers=headers)
            response.raise_for_status()
            return response.json()

    def _fresh_cache(self, cache_key: str) -> PriceSnapshot | None:
        snapshot = self._any_cache(cache_key)
        if snapshot is None:
            return None
        ttl = timedelta(seconds=self.settings.market_cache_ttl_seconds)
        fetched_at = _ensure_aware(snapshot.fetched_at)
        return snapshot if datetime.now(timezone.utc) - fetched_at <= ttl else None

    def _any_cache(self, cache_key: str) -> PriceSnapshot | None:
        return self.db.scalar(select(PriceSnapshot).where(PriceSnapshot.cache_key == cache_key))

    def _store_cache(self, cache_key: str, payload: dict) -> None:
        snapshot = self._any_cache(cache_key)
        if snapshot is None:
            snapshot = PriceSnapshot(cache_key=cache_key, payload=payload)
            self.db.add(snapshot)
        else:
            snapshot.payload = payload
            snapshot.fetched_at = datetime.now(timezone.utc)
        self.db.commit()


def _optional_float(value: object) -> float | None:
    return None if value is None else float(value)


def _ensure_aware(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value

