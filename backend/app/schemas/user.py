"""
User schemas
"""
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    """Base user schema"""
    username: str
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None
    status_message: Optional[str] = None


class UserCreate(BaseModel):
    """User registration schema"""
    username: str
    password: str
    email: Optional[EmailStr] = None
    public_key: str
    public_key_fingerprint: str

    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3 or len(v) > 50:
            raise ValueError('Username must be between 3 and 50 characters')
        if not v.isalnum() and '_' not in v:
            raise ValueError('Username can only contain alphanumeric characters and underscores')
        return v.lower()

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v


class UserLogin(BaseModel):
    """User login schema"""
    username: str
    password: str


class UserUpdate(BaseModel):
    """User profile update schema"""
    avatar_url: Optional[str] = None
    status_message: Optional[str] = None


class UserResponse(BaseModel):
    """User response schema"""
    id: UUID
    username: str
    domain: str
    full_handle: str
    public_key: str
    public_key_fingerprint: str
    avatar_url: Optional[str] = None
    status_message: Optional[str] = None
    is_local: bool
    created_at: datetime
    last_seen: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserPublicInfo(BaseModel):
    """Public user info (for key exchange)"""
    full_handle: str
    public_key: str
    public_key_fingerprint: str
    avatar_url: Optional[str] = None
    last_seen: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Authentication token response"""
    access_token: str
    token_type: str = "bearer"
    user_id: UUID
    full_handle: str
    public_key_fingerprint: str
