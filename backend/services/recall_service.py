"""
Recall Service
Business logic for spaced repetition and recall tasks
"""


def get_recall_tasks(nodes):
    """Generate recall tasks from nodes that need review"""
    tasks = []
    
    for node in nodes:
        # Add to recall if fading or low score
        if node["state"] == "fading" or node["score"] < 60:
            # Determine priority
            if node["state"] == "fading" and node["score"] < 50:
                priority = "critical"
            elif node["state"] == "fading":
                priority = "high"
            else:
                priority = "medium"
            
            # Calculate due time based on lastReview
            due_time = "Overdue"
            if "2 weeks" in node["lastReview"]:
                due_time = "Overdue (2 weeks)"
            elif "3 weeks" in node["lastReview"]:
                due_time = "Overdue (3 weeks)"
            elif "1 week" in node["lastReview"]:
                due_time = "2 hours ago"
            
            tasks.append({
                "id": f"recall_{node['id']}",
                "title": node["title"],
                "dueTime": due_time,
                "priority": priority,
                "nodeId": node["id"]
            })
    
    return tasks
