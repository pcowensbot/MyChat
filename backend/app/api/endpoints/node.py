"""
Node information endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.db.database import get_db
from app.models.user import User
from app.models.federated_node import FederatedNode
from app.core.config import settings

router = APIRouter()


class NodeInfoResponse(BaseModel):
    domain: str
    version: str
    federation_enabled: bool
    registration_open: bool
    max_users: int
    current_users: int
    federated_nodes: int


class WellKnownResponse(BaseModel):
    version: str
    domain: str
    federation_api: str
    capabilities: list[str]
    max_message_size: int
    statistics: dict


@router.get("/info", response_model=NodeInfoResponse)
async def get_node_info(
    db: AsyncSession = Depends(get_db)
):
    """
    Get node information

    Public endpoint that provides information about this node
    """
    # Count local users
    result = await db.execute(
        select(func.count(User.id)).where(User.is_local == True)
    )
    user_count = result.scalar() or 0

    # Count federated nodes
    result = await db.execute(
        select(func.count(FederatedNode.id)).where(FederatedNode.status == "active")
    )
    federated_count = result.scalar() or 0

    return NodeInfoResponse(
        domain=settings.DOMAIN,
        version="1.0.0",
        federation_enabled=settings.FEDERATION_ENABLED,
        registration_open=settings.REGISTRATION_OPEN,
        max_users=settings.MAX_USERS,
        current_users=user_count,
        federated_nodes=federated_count
    )


@router.get("/.well-known/mychat-node", response_model=WellKnownResponse)
async def well_known_mychat(
    db: AsyncSession = Depends(get_db)
):
    """
    Well-known endpoint for node discovery (federation protocol)

    This endpoint is used by other nodes to discover this node's capabilities
    """
    # Count local users
    result = await db.execute(
        select(func.count(User.id)).where(User.is_local == True)
    )
    user_count = result.scalar() or 0

    return WellKnownResponse(
        version="1.0",
        domain=settings.DOMAIN,
        federation_api=f"https://{settings.DOMAIN}/api/federation",
        capabilities=[
            "text_messages",
            "image_sharing",
            "group_chat"
        ],
        max_message_size=settings.MAX_MESSAGE_SIZE,
        statistics={
            "user_count": user_count,
            "uptime_days": 0  # Would calculate actual uptime
        }
    )
