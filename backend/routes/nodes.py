"""
Node/Topic Routes
Endpoints for knowledge graph nodes and topic details
"""

from fastapi import APIRouter, HTTPException, Query
import urllib.parse
from datetime import datetime, timedelta
from db.dashboard_data import NODES
from db.quiz_data import QUIZ_CONTENT
from db.summary_data import SUMMARY_CONTENT
from validation.validators import NodeValidator
from utils.cache import cached, medium_cache, long_cache

router = APIRouter()


@router.get("/nodes")
async def get_nodes(
    time_window: int = Query(21, description="Filter nodes by days (21=3 weeks, 35=5 weeks, 49=7 weeks, 0=all time)"),
    limit: int = Query(100, description="Maximum number of nodes to return")
):
    """
    LIGHTWEIGHT API - Get nodes for graph display with time-based filtering
    Returns: Minimal node data (no quiz/summary content)
    Used by: Knowledge Graph visualization
    
    Filters:
    - time_window: Number of days to look back (21, 35, 49, or 0 for all)
    - limit: Max nodes to return (default 100)
    
    Sorting Priority:
    1. Fading topics (retention < 60%) - Highest priority
    2. Medium topics (retention 60-80%) - Medium priority
    3. Strong topics (retention > 80%) - Lower priority
    
    Cached: 5 minutes (medium_cache)
    """
    # Manual cache implementation for FastAPI compatibility
    from utils.cache import medium_cache, generate_cache_key, cache_stats
    
    cache_key = generate_cache_key("get_nodes", time_window=time_window, limit=limit)
    cache_stats['total_requests'] += 1
    
    if cache_key in medium_cache:
        cache_stats['hits'] += 1
        return medium_cache[cache_key]
    
    cache_stats['misses'] += 1
    
    filtered_nodes = NODES
    
    # Apply time window filter if not "all time"
    if time_window > 0:
        cutoff_date = datetime.now() - timedelta(days=time_window)
        # For mock data, we'll include all nodes but in production would filter by lastReview date
        # filtered_nodes = [n for n in NODES if parse_date(n['lastReview']) > cutoff_date]
        pass  # Mock data doesn't have proper dates, so skip for now
    
    # Sort by priority: fading > medium > strong
    def get_priority(node):
        score = node.get('score', 100)
        if score < 60:
            return 0  # Highest priority (fading)
        elif score < 80:
            return 1  # Medium priority
        else:
            return 2  # Lowest priority (strong)
    
    sorted_nodes = sorted(filtered_nodes, key=get_priority)
    
    # Apply limit
    limited_nodes = sorted_nodes[:limit]
    
    result = {
        "nodes": limited_nodes,
        "total": len(NODES),
        "showing": len(limited_nodes),
        "time_window_days": time_window
    }
    
    # Store in cache
    medium_cache[cache_key] = result
    
    return result


@router.get("/node/{title}")
async def get_node_detail(title: str):
    """
    DETAIL API - Get comprehensive node data (with lazy loading)
    Returns: All node data + summary + quiz + performance
    Used by: Modal when user clicks on a node
    
    LAZY LOADING: Quiz and summary content loaded on-demand from separate files
    Cached: 5 minutes (medium_cache)
    """
    # Manual cache implementation
    from utils.cache import medium_cache, generate_cache_key, cache_stats
    
    cache_key = generate_cache_key("get_node_detail", title=title)
    cache_stats['total_requests'] += 1
    
    if cache_key in medium_cache:
        cache_stats['hits'] += 1
        return medium_cache[cache_key]
    
    cache_stats['misses'] += 1
    
    decoded_title = urllib.parse.unquote(title)
    
    # Validate title
    NodeValidator.validate_title(decoded_title)
    
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
    result = {
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
    
    # Store in cache
    medium_cache[cache_key] = result
    
    return result
