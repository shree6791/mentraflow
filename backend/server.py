from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
from pathlib import Path
from auth import auth_router, set_database
from routes import google_auth

# Import modular routes
from routes import health, nodes, dashboard, stats, recall, insights, quiz

# Import middleware
from middleware.logging import RequestLoggingMiddleware
from middleware.rate_limit import RateLimitMiddleware
from middleware.cache import CacheMiddleware

# Import centralized database connection
from db.connection import db, client

# Import and setup centralized logging
from utils.logger import setup_logging, get_logger

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Setup logging (must be done before any logger usage)
setup_logging()
logger = get_logger(__name__)

# Set database for auth modules
set_database(db)
google_auth.set_database(db)

# Create the main app without a prefix
app = FastAPI(
    title="Knowledge Retention API",
    description="API for knowledge retention and learning platform",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Include modular routes
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(nodes.router, tags=["Nodes"])
api_router.include_router(dashboard.router, tags=["Dashboard"])
api_router.include_router(stats.router, tags=["Statistics"])
api_router.include_router(recall.router, tags=["Recall Tasks"])
api_router.include_router(insights.router, tags=["Insights"])
api_router.include_router(quiz.router, tags=["Quiz"])

# Include auth routers
api_router.include_router(auth_router, tags=["Authentication"])
api_router.include_router(google_auth.router, tags=["Google Authentication"])

# Include the router in the main app
app.include_router(api_router)

# Add middleware (order matters - last added runs first)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
app.add_middleware(CacheMiddleware)           # Cache responses
app.add_middleware(RateLimitMiddleware)       # Rate limiting
app.add_middleware(RequestLoggingMiddleware)  # Request logging

# Logging already configured via setup_logging() above

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()