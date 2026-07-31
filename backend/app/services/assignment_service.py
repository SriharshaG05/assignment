from sqlalchemy.orm import Session
from fastapi import HTTPException, status, BackgroundTasks
from app.repositories.assignment_repository import assignment_repository
from app.repositories.user_repository import user_repository
from app.repositories.company_repository import company_repository
from app.repositories.contact_repository import contact_repository
from app.repositories.notification_repository import notification_repository
from app.schemas.assignment import AssignmentCreate
from app.websocket.connection_manager import manager
from app.workers.reminder import schedule_reminder

class AssignmentService:
    async def create_assignment(self, db: Session, assignment_in: AssignmentCreate, assigned_by: int, background_tasks: BackgroundTasks):
        # Validate assigned user exists
        assigned_user = user_repository.get(db, id=assignment_in.user_id)
        if not assigned_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assigned user does not exist."
            )

        target_name = ""
        target_type = ""

        # Validate company or contact
        if assignment_in.company_id:
            company = company_repository.get(db, id=assignment_in.company_id)
            if not company:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Company does not exist."
                )
            target_name = company.name
            target_type = "Company"

        if assignment_in.contact_id:
            contact = contact_repository.get(db, id=assignment_in.contact_id)
            if not contact:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Contact does not exist."
                )
            target_name = contact.name
            target_type = "Contact"

        # Save assignment
        assignment_data = assignment_in.model_dump()
        assignment_data["assigned_by"] = assigned_by
        db_assignment = assignment_repository.create(db, obj_in=assignment_data)

        # Generate message
        message = f"You have been assigned as {db_assignment.role} for the {target_type} '{target_name}'."

        # Save notification
        notification_data = {
            "user_id": db_assignment.user_id,
            "message": message,
            "is_read": False
        }
        db_notification = notification_repository.create(db, obj_in=notification_data)

        # Prepare websocket event
        payload = {
            "id": db_notification.id,
            "user_id": db_notification.user_id,
            "message": db_notification.message,
            "is_read": db_notification.is_read,
            "created_at": db_notification.created_at.isoformat()
        }

        # Push WS notification (asynchronous invocation)
        await manager.send_personal_message(
            message={"event": "notification", "data": payload},
            user_id=db_notification.user_id
        )

        # Add background task for 30s reminder
        background_tasks.add_task(
            schedule_reminder,
            user_id=db_assignment.user_id,
            target_name=target_name,
            target_type=target_type,
            role=db_assignment.role
        )

        return db_assignment

    def get_assignments(self, db: Session, skip: int = 0, limit: int = 100):
        return assignment_repository.get_multi(db, skip=skip, limit=limit)

assignment_service = AssignmentService()
