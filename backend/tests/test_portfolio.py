from datetime import datetime, timezone

from app.models import Transaction
from app.services.portfolio import calculate_portfolio_summary


def test_average_cost_and_pnl_math() -> None:
    transactions = [
        Transaction(
            type="buy",
            btc_amount=0.1,
            fiat_amount=5000,
            currency="CHF",
            fee_amount=10,
            transaction_date=datetime(2026, 1, 1, tzinfo=timezone.utc),
        ),
        Transaction(
            type="buy",
            btc_amount=0.1,
            fiat_amount=7000,
            currency="CHF",
            fee_amount=10,
            transaction_date=datetime(2026, 2, 1, tzinfo=timezone.utc),
        ),
        Transaction(
            type="sell",
            btc_amount=0.05,
            fiat_amount=4000,
            currency="CHF",
            fee_amount=5,
            transaction_date=datetime(2026, 3, 1, tzinfo=timezone.utc),
        ),
    ]

    summary = calculate_portfolio_summary(transactions, "CHF", current_price=80000)

    assert summary.btc_balance == 0.15
    assert summary.total_invested == 12020
    assert summary.total_fees == 25
    assert summary.average_cost == 60100
    assert summary.current_value == 12000
    assert summary.realized_pnl == 990
    assert summary.unrealized_pnl == 2985

