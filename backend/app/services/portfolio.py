from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Transaction, User
from app.schemas.portfolio import PortfolioHistoryPoint, PortfolioSummary
from app.services.market import MarketService


def calculate_portfolio_summary(
    transactions: list[Transaction],
    currency: str,
    current_price: float,
    updated_at: datetime | None = None,
) -> PortfolioSummary:
    btc_balance = 0.0
    cost_basis = 0.0
    total_invested = 0.0
    total_fees = 0.0
    realized_pnl = 0.0

    for transaction in sorted(transactions, key=lambda item: item.transaction_date):
        btc_amount = float(transaction.btc_amount)
        fiat_amount = float(transaction.fiat_amount)
        fee_amount = float(transaction.fee_amount)
        total_fees += fee_amount

        if transaction.type == "buy":
            btc_balance += btc_amount
            cost_basis += fiat_amount + fee_amount
            total_invested += fiat_amount + fee_amount
            continue

        average_cost = cost_basis / btc_balance if btc_balance > 0 else 0.0
        removed_cost = min(btc_amount, btc_balance) * average_cost
        realized_pnl += (fiat_amount - fee_amount) - removed_cost
        btc_balance -= btc_amount
        cost_basis -= removed_cost

    current_value = btc_balance * current_price
    average_cost = cost_basis / btc_balance if btc_balance > 0 else 0.0
    unrealized_pnl = current_value - cost_basis

    return PortfolioSummary(
        currency=currency,
        btc_balance=round(btc_balance, 8),
        average_cost=round(average_cost, 2),
        total_invested=round(total_invested, 2),
        total_fees=round(total_fees, 2),
        current_price=round(current_price, 2),
        current_value=round(current_value, 2),
        unrealized_pnl=round(unrealized_pnl, 2),
        realized_pnl=round(realized_pnl, 2),
        updated_at=updated_at or datetime.now(timezone.utc),
    )


class PortfolioService:
    def __init__(self, db: Session):
        self.db = db
        self.market = MarketService(db)

    def summary(self, user: User, currency: str) -> PortfolioSummary:
        transactions = self._transactions(user)
        price = self.market.get_price(currency)
        return calculate_portfolio_summary(transactions, price.currency, price.price, price.updated_at)

    def history(self, user: User, currency: str, range_value: str) -> list[PortfolioHistoryPoint]:
        transactions = self._transactions(user)
        chart = self.market.get_chart(currency, range_value)
        points: list[PortfolioHistoryPoint] = []

        for market_point in chart:
            balance_at_point = 0.0
            for transaction in transactions:
                if transaction.transaction_date <= market_point.timestamp:
                    amount = float(transaction.btc_amount)
                    balance_at_point += amount if transaction.type == "buy" else -amount
            points.append(
                PortfolioHistoryPoint(
                    timestamp=market_point.timestamp,
                    btc_balance=round(balance_at_point, 8),
                    price=market_point.price,
                    value=round(balance_at_point * market_point.price, 2),
                )
            )
        return points

    def _transactions(self, user: User) -> list[Transaction]:
        return list(
            self.db.scalars(
                select(Transaction)
                .where(Transaction.user_id == user.id)
                .order_by(Transaction.transaction_date.asc(), Transaction.id.asc())
            )
        )

