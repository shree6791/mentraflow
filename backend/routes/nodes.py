"""
Node/Topic Routes
Endpoints for knowledge graph nodes and topic details
"""

from fastapi import APIRouter, HTTPException
import urllib.parse
from dashboard_data import NODES
from quiz_data import QUIZ_CONTENT
from summary_data import SUMMARY_CONTENT

router = APIRouter()


@router.get("/nodes")
async def get_nodes():
    """
    LIGHTWEIGHT API - Get all nodes for graph display
    Returns: Minimal node data (no quiz/summary content)
    Used by: Knowledge Graph visualization
    """
    # Return lean nodes without embedded content
    return {"nodes": NODES}


@router.get("/node/{title}")
async def get_node_detail(title: str):
    """
    DETAIL API - Get comprehensive node data (with lazy loading)
    Returns: All node data + summary + quiz + performance
    Used by: Modal when user clicks on a node
    
    LAZY LOADING: Quiz and summary content loaded on-demand from separate files
    """
    decoded_title = urllib.parse.unquote(title)
    
    # Find the node
    node = next((n for n in NODES if n["title"] == decoded_title), None)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    # LAZY LOAD: Get quiz questions from QUIZ_CONTENT using quizId
    quiz_id = node.get("quizId")
    quiz_data = QUIZ_CONTENT.get(quiz_id) if quiz_id else None
    questions = quiz_data.get("questions", []) if quiz_data else []
    
    # LAZY LOAD: Get summary from SUMMARY_CONTENT using summaryId
    summary_id = node.get("summaryId")
    summary = SUMMARY_CONTENT.get(summary_id) if summary_id else None
    
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
