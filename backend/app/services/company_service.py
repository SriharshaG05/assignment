from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.company_repository import company_repository
from app.schemas.company import CompanyCreate, CompanyUpdate

class CompanyService:
    def create_company(self, db: Session, company_in: CompanyCreate):
        # Validate duplicate name
        existing = company_repository.get_by_name(db, name=company_in.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A company with this name already exists."
            )
        return company_repository.create(db, obj_in=company_in.model_dump())

    def get_company(self, db: Session, company_id: int):
        company = company_repository.get(db, id=company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found."
            )
        return company

    def get_companies(self, db: Session, skip: int = 0, limit: int = 100):
        return company_repository.get_multi(db, skip=skip, limit=limit)

    def update_company(self, db: Session, company_id: int, company_in: CompanyUpdate):
        company = self.get_company(db, company_id)
        if company_in.name and company_in.name != company.name:
            existing = company_repository.get_by_name(db, name=company_in.name)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A company with this name already exists."
                )
        return company_repository.update(db, db_obj=company, obj_in=company_in.model_dump(exclude_unset=True))

    def delete_company(self, db: Session, company_id: int):
        company = self.get_company(db, company_id)
        return company_repository.remove(db, id=company_id)

company_service = CompanyService()
