from datetime import datetime

from pydantic import BaseModel


class PortfolioSummary(BaseModel):
    currency: str
    btc_balance: float
    average_cost: float
    total_invested: float
    total_fees: float
    current_price: float
    current_value: float
    unrealized_pnl: float
    realized_pnl: float
    updated_at: datetime


class PortfolioHistoryPoint(BaseModel):
    timestamp: datetime
    btc_balance: float
    price: float
    value: float

