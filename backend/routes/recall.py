"""
Recall Tasks Routes
Endpoints for spaced repetition recall tasks and sessions
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from datetime import datetime, timedelta
from db.dashboard_data import NODES
from services.recall_service import get_recall_tasks
from db.connection import get_database
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Get MongoDB connection
db = get_database()
recall_sessions_collection = db['recall_sessions']


@router.get("/recall-tasks")
async def get_recall_tasks_endpoint():
    """Get prioritized recall tasks for spaced repetition"""
    tasks = get_recall_tasks(NODES)
    return {"tasks": tasks}


@router.get("/recall-sessions")
async def get_recall_sessions(
    user_id: str = Query(..., description="User ID"),
    status: Optional[str] = Query(None, description="Filter by status: pending, completed, skipped"),
    limit: int = Query(10, description="Max sessions to return")
):
    """
    Get user's recall sessions from MongoDB
    
    Returns:
    - List of recall sessions sorted by due_date
    - Sessions can be pending, completed, or skipped
    """
    try:
        # Build query
        query = {"user_id": user_id}
        if status:
            query["status"] = status
        
        # Fetch sessions
        cursor = recall_sessions_collection.find(query).sort("due_date", 1).limit(limit)
        sessions = await cursor.to_list(length=limit)
        
        # Remove MongoDB _id
        for session in sessions:
            session.pop('_id', None)
        
        # Get completed count
        completed_count = await recall_sessions_collection.count_documents({
            "user_id": user_id,
            "status": "completed"
        })
        
        return {
            "user_id": user_id,
            "sessions": sessions,
            "total": len(sessions),
            "completed_count": completed_count
        }
        
    except Exception as e:
        logger.error(f"Error fetching recall sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recall-sessions/{session_id}/complete")
async def complete_recall_session(
    session_id: str,
    success: bool = Query(..., description="Whether the recall was successful")
):
    """
    Mark a recall session as completed and schedule next one
    """
    try:
        # Get the session
        session = await recall_sessions_collection.find_one({"id": session_id})
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Update session
        update_data = {
            "status": "completed",
            "last_attempt": datetime.utcnow().isoformat(),
            "attempts": session.get("attempts", 0) + 1
        }
        
        await recall_sessions_collection.update_one(
            {"id": session_id},
            {"$set": update_data}
        )
        
        # If successful, schedule next recall session
        if success:
            next_interval = session.get("next_interval_days", 7)
            next_due_date = datetime.utcnow() + timedelta(days=next_interval)
            
            # Create next session
            next_session = {
                "id": f"recall_{session['node_id']}_{int(datetime.utcnow().timestamp())}",
                "user_id": session["user_id"],
                "node_id": session["node_id"],
                "concept_text": session["concept_text"],
                "type": session["type"],
                "status": "pending",
                "due_date": next_due_date.isoformat(),
                "interval_days": next_interval,
                "next_interval_days": next_interval * 2,  # Double the interval
                "attempts": 0,
                "last_attempt": None,
                "created_at": datetime.utcnow().isoformat()
            }
            
            await recall_sessions_collection.insert_one(next_session)
            logger.info(f"Scheduled next recall for {next_due_date.date()}")
        
        return {
            "success": True,
            "message": "Recall session completed",
            "next_session_scheduled": success
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing recall session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
