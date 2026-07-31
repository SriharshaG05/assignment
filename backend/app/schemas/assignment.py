from datetime import datetime
from pydantic import BaseModel, Field, model_validator
from typing import Optional

class AssignmentBase(BaseModel):
    user_id: int
    company_id: Optional[int] = None
    contact_id: Optional[int] = None
    role: str = Field(..., min_length=1)

class AssignmentCreate(AssignmentBase):
    @model_validator(mode="after")
    def validate_targets(self) -> "AssignmentCreate":
        if self.company_id is None and self.contact_id is None:
            raise ValueError("Either company_id or contact_id must be provided")
        return self

class AssignmentOut(AssignmentBase):
    id: int
    assigned_by: Optional[int]
    assigned_at: datetime

    class Config:
        from_attributes = True
