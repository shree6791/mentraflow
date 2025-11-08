"""
Health Check Routes
Endpoints for application health and status monitoring
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field, ConfigDict
from typing import List
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid

router = APIRouter()

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.knowledge_app

# Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    model_config = ConfigDict(extra="ignore")

class StatusCheckCreate(BaseModel):
    client_name: str


@router.get("/")
async def root():
    """Root endpoint - health check"""
    return {
        "status": "healthy",
        "message": "Knowledge Retention API is running",
        "version": "1.0.0"
    }


@router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    """Get all status checks"""
    try:
        status_checks = await db.status_checks.find().to_list(length=100)
        for check in status_checks:
            if isinstance(check['timestamp'], str):
                check['timestamp'] = datetime.fromisoformat(check['timestamp'].replace('Z', '+00:00'))
        return status_checks
    except Exception as e:
        return []


@router.post("/status", response_model=StatusCheck)
async def create_status_check(status: StatusCheckCreate):
    """Create a new status check"""
    status_obj = StatusCheck(client_name=status.client_name)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj
