"""
Rate Limiting Middleware
Prevents abuse by limiting requests per IP
"""

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting by IP address
    Different limits for different route groups
    """
    
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)
        
        # Route-specific limits
        self.route_limits = {
            "/api/quiz-results": 10,  # Quiz submission: 10/min
            "/api/nodes": 30,          # Nodes: 30/min
            "/api/node/": 30,          # Node details: 30/min
            "/api/library": 20,        # Library: 20/min
        }
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host
        
        # Determine rate limit for this route
        rate_limit = self.requests_per_minute
        for route, limit in self.route_limits.items():
            if request.url.path.startswith(route):
                rate_limit = limit
                break
        
        # Clean old requests (older than 1 minute)
        now = datetime.now()
        cutoff_time = now - timedelta(minutes=1)
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if req_time > cutoff_time
        ]
        
        # Check rate limit
        if len(self.requests[client_ip]) >= rate_limit:
            logger.warning(f"Rate limit exceeded for {client_ip} on {request.url.path}")
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Max {rate_limit} requests per minute."
            )
        
        # Record this request
        self.requests[client_ip].append(now)
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(rate_limit)
        response.headers["X-RateLimit-Remaining"] = str(
            rate_limit - len(self.requests[client_ip])
        )
        
        return response
