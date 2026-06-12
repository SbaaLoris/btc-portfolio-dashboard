from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


Currency = Literal["CHF", "USD", "EUR"]
TransactionType = Literal["buy", "sell"]


class TransactionBase(BaseModel):
    type: TransactionType
    btc_amount: float = Field(gt=0)
    fiat_amount: float = Field(gt=0)
    currency: Currency = "CHF"
    fee_amount: float = Field(default=0, ge=0)
    transaction_date: datetime
    note: str | None = Field(default=None, max_length=500)


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(TransactionBase):
    pass


class TransactionRead(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

