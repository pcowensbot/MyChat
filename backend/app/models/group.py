"""
Group models
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Index, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.database import Base


class Group(Base):
    """Group chat model"""
    __tablename__ = "groups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    avatar_url = Column(Text, nullable=True)
    description = Column(Text, nullable=True)

    # Settings
    max_members = Column(Integer, default=50)
    is_public = Column(Boolean, default=False)

    __table_args__ = (
        Index('idx_creator', 'creator_id'),
    )

    def __repr__(self):
        return f"<Group {self.name}>"


class GroupMember(Base):
    """Group membership model"""
    __tablename__ = "group_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Encrypted group key for this user
    encrypted_group_key = Column(Text, nullable=False)

    role = Column(String(20), default="member")  # admin, member
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    last_read_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index('idx_group_user', 'group_id', 'user_id', unique=True),
        Index('idx_group_members', 'group_id'),
        Index('idx_user_groups', 'user_id'),
    )

    def __repr__(self):
        return f"<GroupMember {self.user_id} in {self.group_id}>"
