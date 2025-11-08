from fastapi import FastAPI, APIRouter, HTTPException
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

# Import dashboard mock data (lean nodes only)
from dashboard_data import (
    NODES,
    STATS,
    LIBRARY_ITEMS,
    RECALL_TASKS,
    KNOWLEDGE_CLUSTERS,
    RECOMMENDATIONS
)

# Import content data (lazy loaded on-demand)
from quiz_data import QUIZ_CONTENT
from summary_data import SUMMARY_CONTENT



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
# CONSOLIDATED API ENDPOINTS
# ========================================

# --------------------------------------
# KNOWLEDGE GRAPH NODES (Lightweight & Detail)
# --------------------------------------

@api_router.get("/nodes")
async def get_all_nodes():
    """
    LIGHTWEIGHT API - Get minimal node data for graph display
    Returns: id, title, state, lastReview, score, connections
    Used by: Knowledge Graph for initial render
    """
    # Return only essential fields for graph visualization
    lightweight_nodes = [{
        "id": node["id"],
        "title": node["title"],
        "state": node["state"],
        "lastReview": node["lastReview"],
        "score": node["score"],
        "connections": node["connections"]
    } for node in NODES]
    
    return {"nodes": lightweight_nodes}

@api_router.get("/node/{title}")
async def get_node_detail(title: str):
    """
    DETAIL API - Get comprehensive node data
    Returns: All node data + summary + quiz + performance
    Used by: Modal when user clicks on a node
    """
    import urllib.parse
    decoded_title = urllib.parse.unquote(title)
    
    # Find the node
    node = next((n for n in NODES if n["title"] == decoded_title), None)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    # Get quiz questions from node
    questions = node.get("questions", [])
    
    # Get summary from node
    summary = node.get("summary", None)
    
    # Build comprehensive response
    return {
        "node": node,
        "summary": summary,
        "quiz": {
            "title": decoded_title,
            "questions": questions
        } if questions else None,
        "performance": {
            "quizzesTaken": node.get("quizzesTaken", 0),
            "currentScore": node.get("score", 0),
            "state": node.get("state", "unknown"),
            "lastReview": node.get("lastReview", "Never")
        }
    }

# --------------------------------------
# STATS (Unified - all statistics in one place)
# --------------------------------------

@api_router.get("/stats")
async def get_all_stats():
    """
    Get all statistics (dashboard, insights, knowledge graph)
    Frontend picks what it needs
    """
    return STATS

# --------------------------------------
# LIBRARY (Dashboard specific)
# --------------------------------------

@api_router.get("/library")
async def get_library_items():
    """Get all library items"""
    return {"items": LIBRARY_ITEMS}

# --------------------------------------
# RECALL TASKS
# --------------------------------------

@api_router.get("/recall-tasks")
async def get_recall_tasks():
    """Get recall tasks due today"""
    return {"tasks": RECALL_TASKS}

# --------------------------------------
# INSIGHTS SPECIFIC
# --------------------------------------

@api_router.get("/clusters")
async def get_knowledge_clusters():
    """Get knowledge clusters with topics and average scores"""
    return {"clusters": KNOWLEDGE_CLUSTERS}

@api_router.get("/recommendations")
async def get_recommendations():
    """Get personalized recommendations"""
    return {"recommendations": RECOMMENDATIONS}

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