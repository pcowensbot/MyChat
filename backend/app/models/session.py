"""
Session model
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.sql import func
import uuid
from app.db.database import Base


class Session(Base):
    """User session model"""
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(255), unique=True, nullable=False)
    ip_address = Column(INET, nullable=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    last_activity = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index('idx_token', 'token'),
        Index('idx_user_sessions', 'user_id', 'last_activity'),
        Index('idx_expires', 'expires_at'),
    )

    def __repr__(self):
        return f"<Session {self.id} for user {self.user_id}>"
