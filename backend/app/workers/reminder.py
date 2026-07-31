import asyncio
from app.database.session import SessionLocal
from app.repositories.notification_repository import notification_repository
from app.websocket.connection_manager import manager

async def schedule_reminder(user_id: int, target_name: str, target_type: str, role: str):
    # Wait 30 seconds
    await asyncio.sleep(30)

    db = SessionLocal()
    try:
        message = f"Reminder: You were assigned as {role} for the {target_type} '{target_name}' 30 seconds ago."

        # Create notification in database
        notification_data = {
            "user_id": user_id,
            "message": message,
            "is_read": False
        }
        db_notification = notification_repository.create(db, obj_in=notification_data)

        # Prepare websocket notification payload
        payload = {
            "id": db_notification.id,
            "user_id": db_notification.user_id,
            "message": db_notification.message,
            "is_read": db_notification.is_read,
            "created_at": db_notification.created_at.isoformat()
        }

        # Push to WS connection
        await manager.send_personal_message(
            message={"event": "notification", "data": payload},
            user_id=user_id
        )
    except Exception as e:
        print(f"Error in background reminder task: {e}")
    finally:
        db.close()
