"""
Legal compliance models
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Index, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from app.db.database import Base


class LegalRequest(Base):
    """Legal request model (subpoenas, warrants)"""
    __tablename__ = "legal_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_number = Column(String(100), unique=True, nullable=False)

    # Request details
    authority_name = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=True)
    case_number = Column(String(100), nullable=True)

    # Document
    document_path = Column(Text, nullable=True)
    document_hash = Column(String(64), nullable=True)

    # Scope
    target_users = Column(ARRAY(Text), nullable=True)
    date_range_start = Column(DateTime(timezone=True), nullable=True)
    date_range_end = Column(DateTime(timezone=True), nullable=True)
    data_requested = Column(Text, nullable=True)

    # Status
    status = Column(String(50), default="pending")  # pending, under_review, fulfilled, denied
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    # Response
    report_path = Column(Text, nullable=True)
    fulfilled_at = Column(DateTime(timezone=True), nullable=True)
    denial_reason = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index('idx_status', 'status'),
        Index('idx_created_at', 'created_at'),
    )

    def __repr__(self):
        return f"<LegalRequest {self.request_number}>"


class LegalAuditLog(Base):
    """Audit log for legal requests"""
    __tablename__ = "legal_audit_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("legal_requests.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(100), nullable=False)
    performed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    details = Column(JSONB, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index('idx_request_log', 'request_id', 'timestamp'),
    )

    def __repr__(self):
        return f"<LegalAuditLog {self.action}>"
