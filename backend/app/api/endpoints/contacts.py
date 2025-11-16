"""
Contacts endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.db.database import get_db
from app.models.user import User
from app.models.contact import Contact
from app.api.dependencies import get_current_user

router = APIRouter()


class ContactCreate(BaseModel):
    contact_handle: str
    nickname: Optional[str] = None


class ContactResponse(BaseModel):
    id: UUID
    contact_handle: str
    nickname: Optional[str]
    public_key_fingerprint: str
    avatar_url: Optional[str]
    last_message_at: Optional[datetime]
    added_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=List[ContactResponse])
async def get_contacts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's contacts
    """
    # Get all contacts for current user
    result = await db.execute(
        select(Contact).where(Contact.user_id == current_user.id)
    )
    contacts = result.scalars().all()

    # Get contact user details
    contact_responses = []
    for contact in contacts:
        result = await db.execute(
            select(User).where(User.id == contact.contact_id)
        )
        contact_user = result.scalar_one_or_none()

        if contact_user:
            contact_responses.append(ContactResponse(
                id=contact.id,
                contact_handle=contact_user.full_handle,
                nickname=contact.nickname,
                public_key_fingerprint=contact_user.public_key_fingerprint,
                avatar_url=contact_user.avatar_url,
                last_message_at=contact.last_message_at,
                added_at=contact.added_at
            ))

    return contact_responses


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def add_contact(
    contact_data: ContactCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add a new contact
    """
    if '@' not in contact_data.contact_handle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid handle format"
        )

    username, domain = contact_data.contact_handle.split('@', 1)

    # Find contact user
    result = await db.execute(
        select(User).where(
            User.username == username,
            User.domain == domain
        )
    )
    contact_user = result.scalar_one_or_none()

    if not contact_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if already a contact
    result = await db.execute(
        select(Contact).where(
            Contact.user_id == current_user.id,
            Contact.contact_id == contact_user.id
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already in contacts"
        )

    # Create contact
    new_contact = Contact(
        user_id=current_user.id,
        contact_id=contact_user.id,
        nickname=contact_data.nickname
    )

    db.add(new_contact)
    await db.commit()
    await db.refresh(new_contact)

    return ContactResponse(
        id=new_contact.id,
        contact_handle=contact_user.full_handle,
        nickname=new_contact.nickname,
        public_key_fingerprint=contact_user.public_key_fingerprint,
        avatar_url=contact_user.avatar_url,
        last_message_at=new_contact.last_message_at,
        added_at=new_contact.added_at
    )


@router.delete("/{contact_id}")
async def delete_contact(
    contact_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Remove a contact
    """
    result = await db.execute(
        select(Contact).where(
            Contact.id == contact_id,
            Contact.user_id == current_user.id
        )
    )
    contact = result.scalar_one_or_none()

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )

    await db.delete(contact)
    await db.commit()

    return {"message": "Contact removed"}
