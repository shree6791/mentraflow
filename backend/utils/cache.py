"""
In-Memory Caching Utility
Uses TTL-based caching for improved performance
"""
from cachetools import TTLCache
from functools import wraps
import hashlib
import json
import logging
from typing import Any, Callable, Optional

logger = logging.getLogger(__name__)

# ============================================
# Cache Instances with Different TTLs
# ============================================

# Short-lived cache (1 minute) - for frequently changing data
short_cache = TTLCache(maxsize=100, ttl=60)

# Medium cache (5 minutes) - for semi-static data
medium_cache = TTLCache(maxsize=200, ttl=300)

# Long cache (15 minutes) - for mostly static data
long_cache = TTLCache(maxsize=100, ttl=900)

# Cache statistics
cache_stats = {
    'hits': 0,
    'misses': 0,
    'total_requests': 0
}


def generate_cache_key(prefix: str, *args, **kwargs) -> str:
    """
    Generate a unique cache key based on function arguments
    
    Args:
        prefix: Cache key prefix (usually function name)
        *args: Positional arguments
        **kwargs: Keyword arguments
    
    Returns:
        Hashed cache key
    """
    # Create a string representation of all arguments
    key_parts = [prefix]
    
    # Add positional args
    for arg in args:
        if arg is not None:
            key_parts.append(str(arg))
    
    # Add keyword args (sorted for consistency)
    for k, v in sorted(kwargs.items()):
        if v is not None:
            key_parts.append(f"{k}:{v}")
    
    # Join and hash for consistent key length
    key_string = "|".join(key_parts)
    return hashlib.md5(key_string.encode()).hexdigest()


def cached(cache_instance: TTLCache, key_prefix: Optional[str] = None):
    """
    Decorator to cache function results
    
    Args:
        cache_instance: Which cache to use (short_cache, medium_cache, long_cache)
        key_prefix: Optional prefix for cache key (defaults to function name)
    
    Usage:
        @cached(medium_cache, "get_user_data")
        async def get_user_data(user_id: str):
            # expensive operation
            return data
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Generate cache key
            prefix = key_prefix or func.__name__
            cache_key = generate_cache_key(prefix, *args, **kwargs)
            
            # Update statistics
            cache_stats['total_requests'] += 1
            
            # Try to get from cache
            if cache_key in cache_instance:
                cache_stats['hits'] += 1
                logger.debug(f"Cache HIT for {prefix}: {cache_key}")
                return cache_instance[cache_key]
            
            # Cache miss - execute function
            cache_stats['misses'] += 1
            logger.debug(f"Cache MISS for {prefix}: {cache_key}")
            
            # Call the actual function
            result = await func(*args, **kwargs)
            
            # Store in cache
            cache_instance[cache_key] = result
            
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # Generate cache key
            prefix = key_prefix or func.__name__
            cache_key = generate_cache_key(prefix, *args, **kwargs)
            
            # Update statistics
            cache_stats['total_requests'] += 1
            
            # Try to get from cache
            if cache_key in cache_instance:
                cache_stats['hits'] += 1
                logger.debug(f"Cache HIT for {prefix}: {cache_key}")
                return cache_instance[cache_key]
            
            # Cache miss - execute function
            cache_stats['misses'] += 1
            logger.debug(f"Cache MISS for {prefix}: {cache_key}")
            
            # Call the actual function
            result = func(*args, **kwargs)
            
            # Store in cache
            cache_instance[cache_key] = result
            
            return result
        
        # Return appropriate wrapper based on function type
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


def invalidate_cache(cache_instance: TTLCache, pattern: Optional[str] = None):
    """
    Invalidate cache entries
    
    Args:
        cache_instance: Cache to invalidate
        pattern: Optional pattern to match (if None, clears all)
    """
    if pattern is None:
        # Clear entire cache
        cache_instance.clear()
        logger.info(f"Cleared entire cache")
    else:
        # Clear matching keys
        keys_to_delete = [k for k in cache_instance.keys() if pattern in str(k)]
        for key in keys_to_delete:
            del cache_instance[key]
        logger.info(f"Invalidated {len(keys_to_delete)} cache entries matching '{pattern}'")


def invalidate_user_cache(user_id: str):
    """
    Invalidate all cache entries for a specific user
    Useful when user data changes
    """
    # Clear entries containing user_id
    for cache in [short_cache, medium_cache, long_cache]:
        keys_to_delete = [k for k in cache.keys() if user_id in str(k)]
        for key in keys_to_delete:
            del cache[key]
    
    logger.info(f"Invalidated cache for user: {user_id}")


def get_cache_stats() -> dict:
    """
    Get cache statistics
    
    Returns:
        Dictionary with cache performance metrics
    """
    total = cache_stats['total_requests']
    hits = cache_stats['hits']
    hit_rate = (hits / total * 100) if total > 0 else 0
    
    return {
        'total_requests': total,
        'cache_hits': hits,
        'cache_misses': cache_stats['misses'],
        'hit_rate_percentage': round(hit_rate, 2),
        'cache_sizes': {
            'short_cache': len(short_cache),
            'medium_cache': len(medium_cache),
            'long_cache': len(long_cache)
        }
    }


def reset_cache_stats():
    """Reset cache statistics"""
    cache_stats['hits'] = 0
    cache_stats['misses'] = 0
    cache_stats['total_requests'] = 0
    logger.info("Cache statistics reset")
