"""
Statistics Routes
Endpoints for dashboard and user statistics
"""

from fastapi import APIRouter
from db.dashboard_data import STATS

router = APIRouter()


@router.get("/stats")
async def get_all_stats():
    """
    Get all statistics
    Returns: Dashboard stats, insights stats, and knowledge graph stats
    """
    return STATS
