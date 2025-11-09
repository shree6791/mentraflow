"""
Statistics Routes
Endpoints for dashboard and user statistics
"""

from fastapi import APIRouter
from db.dashboard_data import NODES
from services.stats_service import get_stats
from utils.cache import cached, medium_cache

router = APIRouter()


@router.get("/stats")
@cached(medium_cache, "get_all_stats")
async def get_all_stats():
    """
    Get all statistics
    Returns: Dashboard stats, insights stats, and knowledge graph stats
    Cached: 5 minutes (medium_cache)
    """
    stats = get_stats(NODES)
    return stats
