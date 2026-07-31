from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional

class CompanyBase(BaseModel):
    name: str = Field(..., min_length=1)
    industry: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

class CompanyOut(CompanyBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
