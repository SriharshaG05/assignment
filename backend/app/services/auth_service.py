from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user_repository import user_repository
from app.schemas.user import UserCreate
from app.schemas.auth import LoginRequest
from app.core.security import verify_password, get_password_hash, create_access_token

class AuthService:
    def register(self, db: Session, user_in: UserCreate):
        db_user = user_repository.get_by_email(db, email=user_in.email)
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists."
            )
        user_data = user_in.model_dump()
        user_data["password"] = get_password_hash(user_data["password"])
        return user_repository.create(db, obj_in=user_data)

    def login(self, db: Session, login_in: LoginRequest):
        user = user_repository.get_by_email(db, email=login_in.email)
        if not user or not verify_password(login_in.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token = create_access_token(subject=user.id)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }

auth_service = AuthService()
