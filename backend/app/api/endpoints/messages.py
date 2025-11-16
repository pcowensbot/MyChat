"""
Message endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from datetime import datetime
from typing import Optional

from app.db.database import get_db
from app.models.user import User
from app.models.message import Message
from app.schemas.message import MessageCreate, MessageResponse, MessageListResponse
from app.api.dependencies import get_current_user
from app.core.config import settings

router = APIRouter()


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send a message to another user or group
    """
    # Validate message size
    if len(message_data.encrypted_content) > settings.MAX_MESSAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Message too large"
        )

    recipient_id = None
    recipient_handle = None
    origin_node = settings.DOMAIN

    # Handle 1-on-1 message
    if message_data.recipient_handle:
        recipient_handle = message_data.recipient_handle
        username, domain = recipient_handle.split('@', 1)

        # Find or create recipient user
        result = await db.execute(
            select(User).where(
                User.username == username,
                User.domain == domain
            )
        )
        recipient = result.scalar_one_or_none()

        if not recipient:
            # If recipient doesn't exist and is on another node, we'll create a stub entry
            # In a real implementation, we'd query the federation API first
            if domain != settings.DOMAIN:
                # For federated users, we need to fetch their public key from their node
                # This is a placeholder - actual federation logic would go here
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Recipient not found. Federation lookup not yet implemented."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Recipient not found"
                )

        recipient_id = recipient.id

    # Create message
    new_message = Message(
        sender_id=current_user.id,
        recipient_id=recipient_id,
        group_id=message_data.group_id,
        encrypted_content=message_data.encrypted_content,
        content_type=message_data.content_type,
        sender_handle=current_user.full_handle,
        recipient_handle=recipient_handle,
        message_size=len(message_data.encrypted_content),
        origin_node=origin_node,
        status="pending"
    )

    db.add(new_message)
    await db.commit()
    await db.refresh(new_message)

    # TODO: If message is for a federated user, add to message queue
    # TODO: Send WebSocket notification if recipient is online

    # Mark as delivered for local users
    if recipient_id and recipient_handle and '@' in recipient_handle:
        _, domain = recipient_handle.split('@', 1)
        if domain == settings.DOMAIN:
            new_message.status = "delivered"
            new_message.delivered_at = datetime.utcnow()
            await db.commit()

    return MessageResponse(
        id=new_message.id,
        sender_handle=new_message.sender_handle,
        recipient_handle=new_message.recipient_handle,
        group_id=new_message.group_id,
        encrypted_content=new_message.encrypted_content,
        encrypted_key=message_data.encrypted_key,
        iv=message_data.iv,
        content_type=new_message.content_type,
        created_at=new_message.created_at,
        delivered_at=new_message.delivered_at,
        read_at=new_message.read_at,
        status=new_message.status
    )


@router.get("/conversation/{handle}", response_model=MessageListResponse)
async def get_conversation(
    handle: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, le=100),
    before: Optional[datetime] = None
):
    """
    Get conversation with a specific user
    """
    if '@' not in handle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid handle format"
        )

    username, domain = handle.split('@', 1)

    # Find the other user
    result = await db.execute(
        select(User).where(
            User.username == username,
            User.domain == domain
        )
    )
    other_user = result.scalar_one_or_none()

    if not other_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Build query for messages between current user and other user
    query = select(Message).where(
        or_(
            and_(Message.sender_id == current_user.id, Message.recipient_id == other_user.id),
            and_(Message.sender_id == other_user.id, Message.recipient_id == current_user.id)
        )
    )

    if before:
        query = query.where(Message.created_at < before)

    query = query.order_by(Message.created_at.desc()).limit(limit + 1)

    result = await db.execute(query)
    messages = result.scalars().all()

    has_more = len(messages) > limit
    if has_more:
        messages = messages[:limit]

    next_cursor = messages[-1].created_at if messages else None

    return MessageListResponse(
        messages=[
            MessageResponse(
                id=msg.id,
                sender_handle=msg.sender_handle,
                recipient_handle=msg.recipient_handle,
                group_id=msg.group_id,
                encrypted_content=msg.encrypted_content,
                encrypted_key=None,  # Not stored in DB for 1-on-1 messages
                iv="",  # Not stored separately
                content_type=msg.content_type,
                created_at=msg.created_at,
                delivered_at=msg.delivered_at,
                read_at=msg.read_at,
                status=msg.status
            )
            for msg in messages
        ],
        has_more=has_more,
        next_cursor=next_cursor
    )


@router.put("/{message_id}/read")
async def mark_message_read(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark a message as read
    """
    # Find message
    result = await db.execute(
        select(Message).where(Message.id == message_id)
    )
    message = result.scalar_one_or_none()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )

    # Verify user is the recipient
    if message.recipient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to mark this message as read"
        )

    # Mark as read
    message.read_at = datetime.utcnow()
    message.status = "read"

    await db.commit()

    return {"message": "Message marked as read"}
