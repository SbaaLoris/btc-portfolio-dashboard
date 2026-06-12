from datetime import datetime

from pydantic import BaseModel


class PortfolioSummary(BaseModel):
    currency: str
    btc_balance: float
    average_cost: float
    total_invested: float
    net_invested: float
    total_fees: float
    current_price: float
    current_value: float
    unrealized_pnl: float
    realized_pnl: float
    pnl_percent: float
    largest_transaction_amount: float
    transaction_count: int
    first_transaction_date: datetime | None
    updated_at: datetime


class PortfolioHistoryPoint(BaseModel):
    timestamp: datetime
    btc_balance: float
    price: float
    value: float


class MonthlyActivity(BaseModel):
    month: str
    buy_amount: float
    sell_amount: float
    net_amount: float
    btc_amount: float
    transaction_count: int
