from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.schemas.assignment import AssignmentCreate, AssignmentOut
from app.services.assignment_service import assignment_service
from app.middlewares.auth import get_admin_user, get_current_user
from app.models.user import User

router = APIRouter(prefix="/assignments", tags=["assignments"])

@router.post("", response_model=AssignmentOut, status_code=status.HTTP_201_CREATED)
async def create_assignment(
    assignment_in: AssignmentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    return await assignment_service.create_assignment(
        db=db,
        assignment_in=assignment_in,
        assigned_by=current_user.id,
        background_tasks=background_tasks
    )

@router.get("", response_model=List[AssignmentOut])
def get_assignments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return assignment_service.get_assignments(db, skip=skip, limit=limit)
