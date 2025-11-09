"""
Health Check Routes
Endpoints for application health and status monitoring
"""

from fastapi import APIRouter
from typing import List
from datetime import datetime
from models.health import StatusCheck, StatusCheckCreate
from db.connection import db

router = APIRouter()


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
