"""
Attachment model
"""
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index, Text, LargeBinary
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.database import Base


class Attachment(Base):
    """File attachment model"""
    __tablename__ = "attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)

    # Encrypted file data
    encrypted_data = Column(LargeBinary, nullable=True)  # For small files
    file_path = Column(Text, nullable=True)  # For larger files stored on disk

    # Metadata
    filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=True)
    file_size = Column(Integer, nullable=False)

    # Encryption info
    encryption_method = Column(String(50), default="AES-256-GCM")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index('idx_message_attachments', 'message_id'),
    )

    def __repr__(self):
        return f"<Attachment {self.filename}>"
