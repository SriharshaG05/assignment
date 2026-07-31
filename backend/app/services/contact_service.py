from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.contact_repository import contact_repository
from app.repositories.company_repository import company_repository
from app.schemas.contact import ContactCreate, ContactUpdate

class ContactService:
    def create_contact(self, db: Session, contact_in: ContactCreate):
        # Validate company exists
        company = company_repository.get(db, id=contact_in.company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company does not exist."
            )
        # Validate duplicate email
        existing = contact_repository.get_by_email(db, email=contact_in.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A contact with this email already exists."
            )
        return contact_repository.create(db, obj_in=contact_in.model_dump())

    def get_contact(self, db: Session, contact_id: int):
        contact = contact_repository.get(db, id=contact_id)
        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact not found."
            )
        return contact

    def get_contacts(self, db: Session, skip: int = 0, limit: int = 100):
        return contact_repository.get_multi(db, skip=skip, limit=limit)

    def update_contact(self, db: Session, contact_id: int, contact_in: ContactUpdate):
        contact = self.get_contact(db, contact_id)
        if contact_in.company_id:
            company = company_repository.get(db, id=contact_in.company_id)
            if not company:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Company does not exist."
                )
        if contact_in.email and contact_in.email != contact.email:
            existing = contact_repository.get_by_email(db, email=contact_in.email)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A contact with this email already exists."
                )
        return contact_repository.update(db, db_obj=contact, obj_in=contact_in.model_dump(exclude_unset=True))

    def delete_contact(self, db: Session, contact_id: int):
        contact = self.get_contact(db, contact_id)
        return contact_repository.remove(db, id=contact_id)

contact_service = ContactService()
