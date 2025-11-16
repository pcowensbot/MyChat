"""
User model
"""
from sqlalchemy import Column, String, Boolean, DateTime, Index, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.ext.hybrid import hybrid_property
import uuid
from app.db.database import Base


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), nullable=False)
    domain = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)  # Only for local users
    password_hash = Column(String(255), nullable=True)  # Only for local users
    public_key = Column(Text, nullable=False)  # PEM format RSA public key
    public_key_fingerprint = Column(String(64), nullable=False)
    is_local = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), nullable=True)
    avatar_url = Column(Text, nullable=True)
    status_message = Column(String(280), nullable=True)

    @hybrid_property
    def full_handle(self) -> str:
        """Generate full handle (username@domain)"""
        return f"{self.username}@{self.domain}"

    # Indexes
    __table_args__ = (
        Index('idx_username_domain', 'username', 'domain', unique=True),
        Index('idx_last_seen', 'last_seen'),
        Index('idx_is_local', 'is_local'),
    )

    def __repr__(self):
        return f"<User {self.full_handle}>"
