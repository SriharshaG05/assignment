from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.contact import Contact
from app.repositories.base import BaseRepository

class ContactRepository(BaseRepository[Contact]):
    def __init__(self):
        super().__init__(Contact)

    def get_by_email(self, db: Session, email: str) -> Optional[Contact]:
        return db.query(self.model).filter(self.model.email == email).first()

    def get_by_company_id(self, db: Session, company_id: int) -> List[Contact]:
        return db.query(self.model).filter(self.model.company_id == company_id).all()

contact_repository = ContactRepository()
