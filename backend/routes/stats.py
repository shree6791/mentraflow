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
async def get_all_stats():
    """
    Get all statistics
    Returns: Dashboard stats, insights stats, and knowledge graph stats
    Cached: 5 minutes (medium_cache)
    """
    # Manual cache implementation
    from utils.cache import medium_cache, generate_cache_key, cache_stats
    
    cache_key = generate_cache_key("get_all_stats")
    cache_stats['total_requests'] += 1
    
    if cache_key in medium_cache:
        cache_stats['hits'] += 1
        return medium_cache[cache_key]
    
    cache_stats['misses'] += 1
    
    stats = get_stats(NODES)
    
    # Store in cache
    medium_cache[cache_key] = stats
    
    return stats
