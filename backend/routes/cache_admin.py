"""
Cache Administration Routes
Endpoints for monitoring and managing cache
"""

from fastapi import APIRouter
from utils.cache import (
    get_cache_stats,
    reset_cache_stats,
    invalidate_cache,
    short_cache,
    medium_cache,
    long_cache
)

router = APIRouter(prefix="/cache", tags=["Cache Admin"])


@router.get("/stats")
async def cache_statistics():
    """
    Get cache performance statistics
    Returns: Hit rate, cache sizes, and request counts
    """
    return get_cache_stats()


@router.post("/clear")
async def clear_cache(cache_type: str = "all"):
    """
    Clear cache entries
    
    Args:
        cache_type: Which cache to clear (short, medium, long, or all)
    """
    if cache_type == "all":
        short_cache.clear()
        medium_cache.clear()
        long_cache.clear()
        return {"message": "All caches cleared successfully"}
    elif cache_type == "short":
        short_cache.clear()
        return {"message": "Short cache cleared successfully"}
    elif cache_type == "medium":
        medium_cache.clear()
        return {"message": "Medium cache cleared successfully"}
    elif cache_type == "long":
        long_cache.clear()
        return {"message": "Long cache cleared successfully"}
    else:
        return {"error": "Invalid cache_type. Use: short, medium, long, or all"}


@router.post("/reset-stats")
async def reset_statistics():
    """
    Reset cache statistics counters
    """
    reset_cache_stats()
    return {"message": "Cache statistics reset successfully"}
