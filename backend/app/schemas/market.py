from datetime import datetime

from pydantic import BaseModel


class MarketPrice(BaseModel):
    currency: str
    price: float
    market_cap: float | None = None
    volume_24h: float | None = None
    change_24h: float | None = None
    updated_at: datetime


class MarketChartPoint(BaseModel):
    timestamp: datetime
    price: float

