"""
Message queue model for federation
"""
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.database import Base


class MessageQueue(Base):
    """Message queue for federated message delivery"""
    __tablename__ = "message_queue"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    target_node = Column(String(255), nullable=False)

    status = Column(String(20), default="pending")  # pending, sent, failed
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=5)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    next_attempt_at = Column(DateTime(timezone=True), server_default=func.now())
    last_error = Column(Text, nullable=True)

    __table_args__ = (
        Index('idx_pending', 'status', 'next_attempt_at', postgresql_where=(Column('status') == 'pending')),
    )

    def __repr__(self):
        return f"<MessageQueue {self.message_id} -> {self.target_node}>"
