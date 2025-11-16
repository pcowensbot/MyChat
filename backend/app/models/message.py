"""
Message model
"""
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index, Text, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.database import Base


class Message(Base):
    """Message model"""
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    recipient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=True)

    # Encrypted content
    encrypted_content = Column(Text, nullable=False)
    content_type = Column(String(50), default="text")  # text, image, file

    # Metadata (UNENCRYPTED)
    sender_handle = Column(String(306), nullable=False)
    recipient_handle = Column(String(306), nullable=True)
    message_size = Column(Integer, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)

    # Status
    status = Column(String(20), default="pending")  # pending, delivered, read, failed

    # Federation
    origin_node = Column(String(255), nullable=True)

    __table_args__ = (
        CheckConstraint(
            '(recipient_id IS NOT NULL AND group_id IS NULL) OR (recipient_id IS NULL AND group_id IS NOT NULL)',
            name='check_recipient_or_group'
        ),
        Index('idx_recipient_messages', 'recipient_id', 'created_at'),
        Index('idx_sender_messages', 'sender_id', 'created_at'),
        Index('idx_group_messages', 'group_id', 'created_at'),
        Index('idx_created_at', 'created_at'),
    )

    def __repr__(self):
        return f"<Message {self.id} from {self.sender_handle}>"
