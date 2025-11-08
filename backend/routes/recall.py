"""
Recall Tasks Routes
Endpoints for spaced repetition recall tasks
"""

from fastapi import APIRouter
from db.repository.dashboard_data import RECALL_TASKS

router = APIRouter()


@router.get("/recall-tasks")
async def get_recall_tasks():
    """Get prioritized recall tasks for spaced repetition"""
    return {"tasks": RECALL_TASKS}
