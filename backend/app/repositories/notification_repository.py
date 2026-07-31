from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.repositories.base import BaseRepository

class NotificationRepository(BaseRepository[Notification]):
    def __init__(self):
        super().__init__(Notification)

    def get_by_user_id(self, db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Notification]:
        return (
            db.query(self.model)
            .filter(self.model.user_id == user_id)
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_unread_count(self, db: Session, user_id: int) -> int:
        return db.query(self.model).filter(self.model.user_id == user_id, self.model.is_read == False).count()

notification_repository = NotificationRepository()
