from fastapi.testclient import TestClient


def test_register_login_and_me(client: TestClient) -> None:
    register = client.post("/auth/register", json={"email": "alice@example.com", "password": "supersecret"})
    assert register.status_code == 201
    assert register.json()["user"]["email"] == "alice@example.com"

    login = client.post("/auth/login", json={"email": "alice@example.com", "password": "supersecret"})
    assert login.status_code == 200

    token = login.json()["access_token"]
    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "alice@example.com"


def test_transaction_crud_is_user_scoped(client: TestClient, auth_headers: dict[str, str]) -> None:
    payload = {
        "type": "buy",
        "btc_amount": 0.1,
        "fiat_amount": 5000,
        "currency": "CHF",
        "fee_amount": 10,
        "transaction_date": "2026-06-12T08:00:00Z",
        "note": "First buy",
    }
    created = client.post("/transactions", json=payload, headers=auth_headers)
    assert created.status_code == 201
    transaction_id = created.json()["id"]

    listed = client.get("/transactions", headers=auth_headers)
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    updated = client.put(
        f"/transactions/{transaction_id}",
        json={**payload, "note": "Updated"},
        headers=auth_headers,
    )
    assert updated.status_code == 200
    assert updated.json()["note"] == "Updated"

    deleted = client.delete(f"/transactions/{transaction_id}", headers=auth_headers)
    assert deleted.status_code == 204
    assert client.get(f"/transactions/{transaction_id}", headers=auth_headers).status_code == 404

