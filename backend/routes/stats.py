"""
Statistics Routes
Endpoints for dashboard and user statistics
"""

from fastapi import APIRouter
from db.dashboard_data import NODES
from services.stats_service import get_stats

router = APIRouter()


@router.get("/stats")
async def get_all_stats():
    """
    Get all statistics
    Returns: Dashboard stats, insights stats, and knowledge graph stats
    """
    stats = get_stats(NODES)
    return stats
