"""
User endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, UserPublicInfo
from app.api.dependencies import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's profile
    """
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    updates: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update current user's profile
    """
    if updates.avatar_url is not None:
        current_user.avatar_url = updates.avatar_url
    if updates.status_message is not None:
        current_user.status_message = updates.status_message

    await db.commit()
    await db.refresh(current_user)

    return current_user


@router.get("/{handle}", response_model=UserPublicInfo)
async def get_user_by_handle(
    handle: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user information by handle (username@domain)

    This is used for finding users and getting their public keys
    """
    if '@' not in handle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid handle format. Use username@domain"
        )

    username, domain = handle.split('@', 1)

    # Query for user
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

    return UserPublicInfo(
        full_handle=user.full_handle,
        public_key=user.public_key,
        public_key_fingerprint=user.public_key_fingerprint,
        avatar_url=user.avatar_url,
        last_seen=user.last_seen
    )
