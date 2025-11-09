"""
Recall Tasks Routes
Endpoints for spaced repetition recall tasks
"""

from fastapi import APIRouter
from db.dashboard_data import NODES
from services.recall_service import get_recall_tasks

router = APIRouter()


@router.get("/recall-tasks")
async def get_recall_tasks_endpoint():
    """Get prioritized recall tasks for spaced repetition"""
    tasks = get_recall_tasks(NODES)
    return {"tasks": tasks}
