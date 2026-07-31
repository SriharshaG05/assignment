from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.schemas.contact import ContactCreate, ContactUpdate, ContactOut
from app.services.contact_service import contact_service
from app.middlewares.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/contacts", tags=["contacts"])

@router.get("", response_model=List[ContactOut])
def get_contacts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return contact_service.get_contacts(db, skip=skip, limit=limit)

@router.post("", response_model=ContactOut, status_code=status.HTTP_201_CREATED)
def create_contact(
    contact_in: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return contact_service.create_contact(db, contact_in)

@router.put("/{contact_id}", response_model=ContactOut)
def update_contact(
    contact_id: int,
    contact_in: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return contact_service.update_contact(db, contact_id, contact_in)

@router.delete("/{contact_id}", response_model=ContactOut)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return contact_service.delete_contact(db, contact_id)
