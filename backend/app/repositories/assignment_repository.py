from typing import List
from sqlalchemy.orm import Session
from app.models.assignment import Assignment
from app.repositories.base import BaseRepository

class AssignmentRepository(BaseRepository[Assignment]):
    def __init__(self):
        super().__init__(Assignment)

    def get_by_user_id(self, db: Session, user_id: int) -> List[Assignment]:
        return db.query(self.model).filter(self.model.user_id == user_id).all()

assignment_repository = AssignmentRepository()
