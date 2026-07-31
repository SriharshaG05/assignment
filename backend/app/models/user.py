from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="employee", nullable=False)  # "admin" or "employee"
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    # One user can have many assignments assigned to them
    assignments = relationship("Assignment", back_populates="user", foreign_keys="[Assignment.user_id]", cascade="all, delete-orphan")
    # One admin user can create many assignments
    created_assignments = relationship("Assignment", back_populates="creator", foreign_keys="[Assignment.assigned_by]", cascade="all, delete-orphan")
    # One user can have many notifications
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
