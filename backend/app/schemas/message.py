"""
Message schemas
"""
from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
from uuid import UUID


class MessageCreate(BaseModel):
    """Create message schema"""
    recipient_handle: Optional[str] = None
    group_id: Optional[UUID] = None
    encrypted_content: str
    encrypted_key: Optional[str] = None  # For 1-on-1 messages
    iv: str
    content_type: str = "text"
    algorithm: str = "AES-256-GCM+RSA-4096-OAEP"

    @validator('recipient_handle')
    def validate_recipient(cls, v, values):
        # Either recipient_handle or group_id must be provided
        if not v and not values.get('group_id'):
            raise ValueError('Either recipient_handle or group_id must be provided')
        if v and values.get('group_id'):
            raise ValueError('Cannot specify both recipient_handle and group_id')
        if v and '@' not in v:
            raise ValueError('Invalid handle format')
        return v

    @validator('encrypted_content')
    def validate_content_size(cls, v):
        if len(v) > 10_000_000:  # 10MB
            raise ValueError('Content too large')
        return v


class MessageResponse(BaseModel):
    """Message response schema"""
    id: UUID
    sender_handle: str
    recipient_handle: Optional[str] = None
    group_id: Optional[UUID] = None
    encrypted_content: str
    encrypted_key: Optional[str] = None
    iv: str
    content_type: str
    created_at: datetime
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    """Message list response"""
    messages: list[MessageResponse]
    has_more: bool
    next_cursor: Optional[datetime] = None


class MarkReadRequest(BaseModel):
    """Mark message as read"""
    message_id: UUID
