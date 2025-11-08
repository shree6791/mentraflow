"""
Logging Middleware
Logs request and response details for monitoring
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all API requests with timing information"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(f"→ {request.method} {request.url.path}")
        
        # Process request
        response = await call_next(request)
        
        # Calculate duration
        duration = (time.time() - start_time) * 1000  # Convert to ms
        
        # Log response
        logger.info(
            f"← {request.method} {request.url.path} "
            f"[{response.status_code}] {duration:.2f}ms"
        )
        
        # Add timing header
        response.headers["X-Response-Time"] = f"{duration:.2f}ms"
        
        return response
