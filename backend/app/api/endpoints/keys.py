"""
Public key discovery endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from app.db.database import get_db
from app.models.user import User

router = APIRouter()


class PublicKeyResponse(BaseModel):
    full_handle: str
    public_key: str
    public_key_fingerprint: str
    verified: bool = False


@router.get("/{handle}", response_model=PublicKeyResponse)
async def get_public_key(
    handle: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get public key for a user handle

    This is a public endpoint used for key discovery and encryption
    """
    if '@' not in handle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid handle format. Use username@domain"
        )

    username, domain = handle.split('@', 1)

    # Find user
    result = await db.execute(
        select(User).where(
            User.username == username,
            User.domain == domain
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return PublicKeyResponse(
        full_handle=user.full_handle,
        public_key=user.public_key,
        public_key_fingerprint=user.public_key_fingerprint,
        verified=False  # In production, this would check if key is verified
    )
