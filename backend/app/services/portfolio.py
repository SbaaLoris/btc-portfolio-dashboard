from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Transaction, User
from app.schemas.portfolio import MonthlyActivity, PortfolioHistoryPoint, PortfolioSummary
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
    sell_proceeds = 0.0
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

        sell_proceeds += fiat_amount - fee_amount
        average_cost = cost_basis / btc_balance if btc_balance > 0 else 0.0
        removed_cost = min(btc_amount, btc_balance) * average_cost
        realized_pnl += (fiat_amount - fee_amount) - removed_cost
        btc_balance -= btc_amount
        cost_basis -= removed_cost

    current_value = btc_balance * current_price
    average_cost = cost_basis / btc_balance if btc_balance > 0 else 0.0
    unrealized_pnl = current_value - cost_basis
    net_invested = total_invested - sell_proceeds
    pnl_percent = (unrealized_pnl / cost_basis * 100) if cost_basis > 0 else 0.0
    largest_transaction_amount = max((float(transaction.fiat_amount) for transaction in transactions), default=0.0)
    first_transaction_date = min(
        (_ensure_aware(transaction.transaction_date) for transaction in transactions),
        default=None,
    )

    return PortfolioSummary(
        currency=currency,
        btc_balance=round(btc_balance, 8),
        average_cost=round(average_cost, 2),
        total_invested=round(total_invested, 2),
        net_invested=round(net_invested, 2),
        total_fees=round(total_fees, 2),
        current_price=round(current_price, 2),
        current_value=round(current_value, 2),
        unrealized_pnl=round(unrealized_pnl, 2),
        realized_pnl=round(realized_pnl, 2),
        pnl_percent=round(pnl_percent, 2),
        largest_transaction_amount=round(largest_transaction_amount, 2),
        transaction_count=len(transactions),
        first_transaction_date=first_transaction_date,
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
                if _ensure_aware(transaction.transaction_date) <= _ensure_aware(market_point.timestamp):
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

    def monthly_activity(self, user: User) -> list[MonthlyActivity]:
        months: dict[str, dict[str, float | int]] = {}
        for transaction in self._transactions(user):
            month = _ensure_aware(transaction.transaction_date).strftime("%Y-%m")
            row = months.setdefault(
                month,
                {
                    "buy_amount": 0.0,
                    "sell_amount": 0.0,
                    "net_amount": 0.0,
                    "btc_amount": 0.0,
                    "transaction_count": 0,
                },
            )
            fiat_amount = float(transaction.fiat_amount)
            btc_amount = float(transaction.btc_amount)
            direction = 1 if transaction.type == "buy" else -1
            if transaction.type == "buy":
                row["buy_amount"] = float(row["buy_amount"]) + fiat_amount
            else:
                row["sell_amount"] = float(row["sell_amount"]) + fiat_amount
            row["net_amount"] = float(row["net_amount"]) + direction * fiat_amount
            row["btc_amount"] = float(row["btc_amount"]) + direction * btc_amount
            row["transaction_count"] = int(row["transaction_count"]) + 1

        return [
            MonthlyActivity(
                month=month,
                buy_amount=round(float(row["buy_amount"]), 2),
                sell_amount=round(float(row["sell_amount"]), 2),
                net_amount=round(float(row["net_amount"]), 2),
                btc_amount=round(float(row["btc_amount"]), 8),
                transaction_count=int(row["transaction_count"]),
            )
            for month, row in sorted(months.items())
        ]

    def _transactions(self, user: User) -> list[Transaction]:
        return list(
            self.db.scalars(
                select(Transaction)
                .where(Transaction.user_id == user.id)
                .order_by(Transaction.transaction_date.asc(), Transaction.id.asc())
            )
        )


def _ensure_aware(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value
