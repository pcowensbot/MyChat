"""
Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.core.security import verify_password, get_password_hash, create_access_token, generate_fingerprint
from app.core.config import settings
from app.api.dependencies import get_current_user

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user
    """
    # Check if registration is open
    if not settings.REGISTRATION_OPEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Registration is currently closed"
        )

    # Check if username already exists on this node
    result = await db.execute(
        select(User).where(
            User.username == user_data.username,
            User.domain == settings.DOMAIN
        )
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    # Check max users limit
    result = await db.execute(
        select(User).where(User.is_local == True)
    )
    user_count = len(result.scalars().all())

    if user_count >= settings.MAX_USERS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Maximum user limit reached"
        )

    # Create new user
    new_user = User(
        username=user_data.username,
        domain=settings.DOMAIN,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        public_key=user_data.public_key,
        public_key_fingerprint=user_data.public_key_fingerprint,
        is_local=True,
        is_admin=False
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Create access token
    access_token = create_access_token(data={"user_id": str(new_user.id)})

    return TokenResponse(
        access_token=access_token,
        user_id=new_user.id,
        full_handle=new_user.full_handle,
        public_key_fingerprint=new_user.public_key_fingerprint
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Login user
    """
    # Find user
    result = await db.execute(
        select(User).where(
            User.username == credentials.username,
            User.domain == settings.DOMAIN,
            User.is_local == True
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    # Update last seen
    user.last_seen = datetime.utcnow()
    await db.commit()

    # Create access token
    access_token = create_access_token(data={"user_id": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        full_handle=user.full_handle,
        public_key_fingerprint=user.public_key_fingerprint
    )


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user)
):
    """
    Logout user (client should discard token)
    """
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user information
    """
    return current_user
