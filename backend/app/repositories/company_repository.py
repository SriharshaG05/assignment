from typing import Optional
from sqlalchemy.orm import Session
from app.models.company import Company
from app.repositories.base import BaseRepository

class CompanyRepository(BaseRepository[Company]):
    def __init__(self):
        super().__init__(Company)

    def get_by_name(self, db: Session, name: str) -> Optional[Company]:
        return db.query(self.model).filter(self.model.name == name).first()

company_repository = CompanyRepository()
