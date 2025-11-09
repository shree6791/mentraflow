from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from auth import auth_router, set_database

# Import modular routes
from routes import health, nodes, library, stats, recall, insights, quiz, knowledge

# Import middleware
from middleware.logging import RequestLoggingMiddleware
from middleware.rate_limit import RateLimitMiddleware
from middleware.cache import CacheMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Set database for auth module
set_database(db)

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
api_router.include_router(library.router, tags=["Library"])
api_router.include_router(stats.router, tags=["Statistics"])
api_router.include_router(recall.router, tags=["Recall Tasks"])
api_router.include_router(insights.router, tags=["Insights"])
api_router.include_router(quiz.router, tags=["Quiz"])
api_router.include_router(knowledge.router, tags=["Knowledge Capture"])

# Include auth router
api_router.include_router(auth_router, tags=["Authentication"])

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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()