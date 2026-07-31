from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.schemas.user import UserOut
from app.services.user_service import user_service
from app.middlewares.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])

@router.get("", response_model=List[UserOut])
def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return user_service.get_users(db, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserOut)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return user_service.get_user_by_id(db, user_id=user_id)
