from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user_repository import user_repository

class UserService:
    def get_user_by_id(self, db: Session, user_id: int):
        user = user_repository.get(db, id=user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )
        return user

    def get_users(self, db: Session, skip: int = 0, limit: int = 100):
        return user_repository.get_multi(db, skip=skip, limit=limit)

user_service = UserService()
