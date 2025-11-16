"""
Contact model
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.database import Base


class Contact(Base):
    """Contact/friendship model"""
    __tablename__ = "contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    contact_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    nickname = Column(String(100), nullable=True)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    last_message_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index('idx_user_contact', 'user_id', 'contact_id', unique=True),
        Index('idx_user_contacts', 'user_id', 'last_message_at'),
    )

    def __repr__(self):
        return f"<Contact {self.user_id} -> {self.contact_id}>"
