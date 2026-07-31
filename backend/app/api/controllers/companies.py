from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyOut
from app.services.company_service import company_service
from app.middlewares.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/companies", tags=["companies"])

@router.get("", response_model=List[CompanyOut])
def get_companies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return company_service.get_companies(db, skip=skip, limit=limit)

@router.post("", response_model=CompanyOut, status_code=status.HTTP_201_CREATED)
def create_company(
    company_in: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return company_service.create_company(db, company_in)

@router.put("/{company_id}", response_model=CompanyOut)
def update_company(
    company_id: int,
    company_in: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return company_service.update_company(db, company_id, company_in)

@router.delete("/{company_id}", response_model=CompanyOut)
def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return company_service.delete_company(db, company_id)
