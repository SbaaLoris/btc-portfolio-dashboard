from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Transaction, User
from app.schemas.transaction import TransactionCreate, TransactionRead, TransactionUpdate
from app.services.auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=list[TransactionRead])
def list_transactions(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[Transaction]:
    limit = min(max(limit, 1), 200)
    offset = max(offset, 0)
    return list(
        db.scalars(
            select(Transaction)
            .where(Transaction.user_id == user.id)
            .order_by(Transaction.transaction_date.desc(), Transaction.id.desc())
            .limit(limit)
            .offset(offset)
        )
    )


@router.post("", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Transaction:
    transaction = Transaction(user_id=user.id, **payload.model_dump())
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("/{transactionId}", response_model=TransactionRead)
def get_transaction(
    transactionId: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Transaction:
    return _owned_transaction(db, user, transactionId)


@router.put("/{transactionId}", response_model=TransactionRead)
def update_transaction(
    transactionId: int,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Transaction:
    transaction = _owned_transaction(db, user, transactionId)
    for key, value in payload.model_dump().items():
        setattr(transaction, key, value)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.delete("/{transactionId}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transactionId: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Response:
    transaction = _owned_transaction(db, user, transactionId)
    db.delete(transaction)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def _owned_transaction(db: Session, user: User, transaction_id: int) -> Transaction:
    transaction = db.get(Transaction, transaction_id)
    if transaction is None or transaction.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return transaction
