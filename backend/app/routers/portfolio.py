from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas.portfolio import PortfolioHistoryPoint, PortfolioSummary
from app.services.auth import get_current_user
from app.services.portfolio import PortfolioService

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.get("/summary", response_model=PortfolioSummary)
def summary(
    currency: str = "CHF",
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PortfolioSummary:
    return PortfolioService(db).summary(user, currency)


@router.get("/history", response_model=list[PortfolioHistoryPoint])
def history(
    currency: str = "CHF",
    range: str = "30d",
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[PortfolioHistoryPoint]:
    return PortfolioService(db).history(user, currency, range)

