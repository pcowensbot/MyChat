"""
Group endpoints (placeholder for future implementation)
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def list_groups():
    """
    List groups (not yet implemented)
    """
    return {"message": "Groups feature coming soon"}


@router.post("")
async def create_group():
    """
    Create group (not yet implemented)
    """
    return {"message": "Groups feature coming soon"}
