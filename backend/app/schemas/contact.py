from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class ContactBase(BaseModel):
    company_id: int
    name: str = Field(..., min_length=1)
    email: EmailStr
    phone: Optional[str] = None
    designation: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    company_id: Optional[int] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    designation: Optional[str] = None

class ContactOut(ContactBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
