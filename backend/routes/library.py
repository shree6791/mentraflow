"""
Library/Documents Routes
Endpoints for user's uploaded study materials
"""

from fastapi import APIRouter
from db.repository.dashboard_data import DOCUMENTS

router = APIRouter()


@router.get("/library")
async def get_library_items():
    """Get all documents (user's uploaded study materials)"""
    return {"items": DOCUMENTS}
