from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.notification_repository import notification_repository

class NotificationService:
    def get_notifications(self, db: Session, user_id: int, skip: int = 0, limit: int = 100):
        return notification_repository.get_by_user_id(db, user_id=user_id, skip=skip, limit=limit)

    def get_unread_count(self, db: Session, user_id: int) -> int:
        return notification_repository.get_unread_count(db, user_id=user_id)

    def mark_as_read(self, db: Session, notification_id: int, user_id: int):
        notification = notification_repository.get(db, id=notification_id)
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found."
            )
        if notification.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this notification."
            )
        return notification_repository.update(db, db_obj=notification, obj_in={"is_read": True})

notification_service = NotificationService()
