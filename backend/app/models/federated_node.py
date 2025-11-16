"""
Federated node model
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Index, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.database import Base


class FederatedNode(Base):
    """Federated node model"""
    __tablename__ = "federated_nodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    domain = Column(String(255), unique=True, nullable=False)
    federation_api_url = Column(Text, nullable=False)

    # Discovery info
    server_version = Column(String(50), nullable=True)
    public_key = Column(Text, nullable=True)

    # Status
    status = Column(String(20), default="active")  # active, blocked, offline
    last_seen = Column(DateTime(timezone=True), nullable=True)

    # Stats
    user_count = Column(Integer, default=0)
    avg_latency_ms = Column(Integer, nullable=True)

    # Settings
    auto_discovered = Column(Boolean, default=True)
    manually_added = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index('idx_status', 'status'),
        Index('idx_last_seen', 'last_seen'),
    )

    def __repr__(self):
        return f"<FederatedNode {self.domain}>"
