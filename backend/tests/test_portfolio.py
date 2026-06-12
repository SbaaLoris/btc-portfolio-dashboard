from datetime import datetime, timezone

from fastapi.testclient import TestClient

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
    assert summary.net_invested == 8025
    assert summary.pnl_percent == 33.11
    assert summary.largest_transaction_amount == 7000
    assert summary.transaction_count == 3


def test_monthly_activity_endpoint(client: TestClient, auth_headers: dict[str, str]) -> None:
    payloads = [
        {
            "type": "buy",
            "btc_amount": 0.1,
            "fiat_amount": 5000,
            "currency": "CHF",
            "fee_amount": 10,
            "transaction_date": "2026-06-10T08:00:00Z",
            "note": "June buy",
        },
        {
            "type": "sell",
            "btc_amount": 0.02,
            "fiat_amount": 1200,
            "currency": "CHF",
            "fee_amount": 5,
            "transaction_date": "2026-06-12T08:00:00Z",
            "note": "June sell",
        },
    ]
    for payload in payloads:
        assert client.post("/transactions", json=payload, headers=auth_headers).status_code == 201

    response = client.get("/portfolio/activity/monthly", headers=auth_headers)

    assert response.status_code == 200
    assert response.json() == [
        {
            "month": "2026-06",
            "buy_amount": 5000.0,
            "sell_amount": 1200.0,
            "net_amount": 3800.0,
            "btc_amount": 0.08,
            "transaction_count": 2,
        }
    ]
