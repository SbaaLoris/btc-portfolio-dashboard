from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas.market import MarketChartPoint, MarketPrice
from app.services.auth import get_current_user
from app.services.market import MarketService

router = APIRouter(prefix="/market/btc", tags=["Market"])


@router.get("/price", response_model=MarketPrice)
def btc_price(
    currency: str = "CHF",
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> MarketPrice:
    return MarketService(db).get_price(currency)


@router.get("/chart", response_model=list[MarketChartPoint])
def btc_chart(
    currency: str = "CHF",
    range: str = "30d",
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[MarketChartPoint]:
    return MarketService(db).get_chart(currency, range)

