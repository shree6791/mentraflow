"""
Simple in-memory caching middleware
Caches GET requests for specified duration
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime, timedelta
import json
from utils.logger import get_logger

logger = get_logger(__name__)


class CacheMiddleware(BaseHTTPMiddleware):
    """
    In-memory caching for GET requests
    Different TTL for different endpoints
    """
    
    def __init__(self, app):
        super().__init__(app)
        self.cache = {}
        
        # Cache TTL (time-to-live) by route pattern
        self.cache_ttl = {
            "/api/nodes": 300,           # 5 minutes
            "/api/node/": 300,           # 5 minutes
            "/api/stats": 60,            # 1 minute
            "/api/library": 60,          # 1 minute
            "/api/clusters": 180,        # 3 minutes
            "/api/recommendations": 180, # 3 minutes
        }
    
    def get_cache_key(self, request: Request) -> str:
        """Generate cache key from request"""
        return f"{request.method}:{request.url.path}:{request.url.query}"
    
    def should_cache(self, request: Request) -> bool:
        """Check if this request should be cached"""
        # Only cache GET requests
        if request.method != "GET":
            return False
        
        # Check if path matches any cacheable route
        for route in self.cache_ttl.keys():
            if request.url.path.startswith(route):
                return True
        
        return False
    
    def get_ttl(self, request: Request) -> int:
        """Get TTL for this request"""
        for route, ttl in self.cache_ttl.items():
            if request.url.path.startswith(route):
                return ttl
        return 60  # Default 1 minute
    
    async def dispatch(self, request: Request, call_next):
        # Check if should cache
        if not self.should_cache(request):
            return await call_next(request)
        
        cache_key = self.get_cache_key(request)
        
        # Check cache
        if cache_key in self.cache:
            cached_data, expiry_time = self.cache[cache_key]
            
            # Check if still valid
            if datetime.now() < expiry_time:
                logger.info(f"Cache HIT: {request.url.path}")
                
                # Return cached response
                from fastapi.responses import JSONResponse
                response = JSONResponse(content=cached_data)
                response.headers["X-Cache"] = "HIT"
                return response
            else:
                # Expired, remove from cache
                del self.cache[cache_key]
                logger.info(f"Cache EXPIRED: {request.url.path}")
        
        # Cache miss - process request
        logger.info(f"Cache MISS: {request.url.path}")
        response = await call_next(request)
        
        # Cache the response if successful
        if response.status_code == 200:
            # Read response body
            body = b""
            async for chunk in response.body_iterator:
                body += chunk
            
            # Parse and store in cache
            try:
                cached_data = json.loads(body.decode())
                ttl = self.get_ttl(request)
                expiry_time = datetime.now() + timedelta(seconds=ttl)
                self.cache[cache_key] = (cached_data, expiry_time)
                logger.info(f"Cache STORED: {request.url.path} (TTL: {ttl}s)")
            except Exception as e:
                logger.error(f"Failed to cache response: {e}")
            
            # Recreate response
            from fastapi.responses import Response
            response = Response(
                content=body,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.media_type
            )
        
        response.headers["X-Cache"] = "MISS"
        return response
