"""
Statistics Service
Business logic for calculating user statistics and metrics
"""

from services.recall_service import get_recall_tasks


def get_stats(nodes):
    """Calculate statistics from nodes"""
    # Calculate items due today (from recall tasks)
    recall_tasks = get_recall_tasks(nodes)
    items_due_today = len(recall_tasks)
    
    # Calculate average retention (average score across all nodes)
    total_score = sum(n["score"] for n in nodes)
    avg_retention = total_score // len(nodes) if nodes else 0
    
    # Streak days (hardcoded for now, would be user-specific in real app)
    streak_days = 7
    
    # Count nodes by retention state
    strong_retention = len([n for n in nodes if n["state"] == "high"])
    needing_review = len([n for n in nodes if n["state"] == "fading"])
    
    # Count total connections
    total_connections = sum(len(n["connections"]) for n in nodes)
    
    return {
        "dashboard": {
            "itemsDueToday": items_due_today,
            "avgRetention": avg_retention,
            "streakDays": streak_days
        },
        "insights": {
            "totalTopics": len(nodes),
            "strongRetention": strong_retention,
            "needingReview": needing_review
        },
        "knowledge": {
            "totalNodes": len(nodes),
            "totalConnections": total_connections
        }
    }
