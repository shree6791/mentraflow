from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
from auth import auth_router, set_database

# Import dashboard mock data
from dashboard_data import (
    LIBRARY_ITEMS,
    SAMPLE_TOPICS,
    RECALL_TASKS,
    QUICK_RECALL_QUIZ,
    DASHBOARD_STATS
)



ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Set database for auth module
set_database(db)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj



# ========================================
# DASHBOARD API ENDPOINTS
# ========================================

@api_router.get("/dashboard/library")
async def get_library_items():
    """Get all library items"""
    return {"items": LIBRARY_ITEMS}

@api_router.get("/dashboard/library/{item_id}")
async def get_library_item(item_id: str):
    """Get a specific library item by ID"""
    item = next((item for item in LIBRARY_ITEMS if item["id"] == item_id), None)
    if not item:
        return {"error": "Item not found"}, 404
    return item

@api_router.get("/dashboard/topics")
async def get_topics():
    """Get all topics for knowledge graph"""
    return {"topics": SAMPLE_TOPICS}

@api_router.get("/dashboard/recall-tasks")
async def get_recall_tasks():
    """Get recall tasks due today"""
    return {"tasks": RECALL_TASKS}

@api_router.get("/dashboard/quiz/{title}")
async def get_quiz(title: str):
    """Get quiz questions for a specific topic"""
    # URL decode the title
    import urllib.parse
    decoded_title = urllib.parse.unquote(title)
    
    quiz = QUICK_RECALL_QUIZ.get(decoded_title, [])
    if not quiz:
        return {"error": "Quiz not found"}, 404
    return {"title": decoded_title, "questions": quiz}

@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    return DASHBOARD_STATS

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include auth router
api_router.include_router(auth_router)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()