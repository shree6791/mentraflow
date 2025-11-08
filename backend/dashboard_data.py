# Dashboard Mock Data
# Consolidated and optimized data structure
# Functions at top, data constants at bottom

# ========================================
# HELPER FUNCTIONS (Derive data dynamically)
# ========================================

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


def get_knowledge_clusters(nodes):
    """Generate knowledge clusters by analyzing node connections"""
    clusters = []
    
    # Memory Retention cluster (high retention nodes)
    memory_nodes = [n for n in nodes if n["id"] in ["t1", "t2", "t5"]]
    if memory_nodes:
        avg_score = sum(n["score"] for n in memory_nodes) // len(memory_nodes)
        clusters.append({
            "id": "cluster1",
            "name": "Memory Retention",
            "topics": [n["title"] for n in memory_nodes],
            "strength": avg_score,
            "lastReview": min(n["lastReview"] for n in memory_nodes)
        })
    
    # Study Techniques cluster
    study_nodes = [n for n in nodes if n["id"] in ["t2", "t3", "t5"]]
    if study_nodes:
        avg_score = sum(n["score"] for n in study_nodes) // len(study_nodes)
        clusters.append({
            "id": "cluster2",
            "name": "Study Techniques",
            "topics": [n["title"] for n in study_nodes],
            "strength": avg_score,
            "lastReview": min(n["lastReview"] for n in study_nodes)
        })
    
    # Cognitive Science cluster
    cognitive_nodes = [n for n in nodes if n["id"] in ["t4", "t6", "t7"]]
    if cognitive_nodes:
        avg_score = sum(n["score"] for n in cognitive_nodes) // len(cognitive_nodes)
        clusters.append({
            "id": "cluster3",
            "name": "Cognitive Science",
            "topics": [n["title"] for n in cognitive_nodes],
            "strength": avg_score,
            "lastReview": min(n["lastReview"] for n in cognitive_nodes)
        })
    
    return clusters


def get_recommendations(nodes):
    """Generate personalized recommendations based on node states"""
    recommendations = []
    
    # Find fading nodes (need review)
    fading_nodes = [n for n in nodes if n["state"] == "fading"]
    for node in fading_nodes:
        recommendations.append({
            "id": f"rec_review_{node['id']}",
            "type": "review",
            "title": f"Review: {node['title']}",
            "description": "This topic is fading. Review now to strengthen retention.",
            "priority": "high",
            "action": "Review Now",
            "nodeId": node["id"]
        })
    
    # Find strong nodes (practice to maintain)
    strong_nodes = [n for n in nodes if n["state"] == "high" and n["score"] > 85]
    if strong_nodes:
        node = strong_nodes[0]  # Pick the strongest
        recommendations.append({
            "id": f"rec_practice_{node['id']}",
            "type": "practice",
            "title": f"Practice: {node['title']} Quiz",
            "description": f"Your {node['title']} knowledge is strong. Test yourself to maintain it.",
            "priority": "low",
            "action": "Take Quiz",
            "nodeId": node["id"]
        })
    
    # Find connection opportunities (nodes with many connections)
    connected_nodes = sorted(nodes, key=lambda n: len(n["connections"]), reverse=True)
    if len(connected_nodes) >= 2:
        n1, n2 = connected_nodes[0], connected_nodes[1]
        recommendations.append({
            "id": "rec_connection_1",
            "type": "connection",
            "title": f"Connect: {n1['title']} ↔ {n2['title']}",
            "description": "These concepts complement each other. Review together for deeper understanding.",
            "priority": "medium",
            "action": "Explore Connection"
        })
    
    return recommendations


# ========================================
# DATA CONSTANTS
# ========================================

# KNOWLEDGE NODES (Lean Metadata Only)
# Content (quiz, summary) stored separately and loaded on-demand
# This keeps NODES lightweight and easier to manage
NODES = [
    {
        "id": "t1",
        "title": "Forgetting Curve",
        "state": "high",
        "lastReview": "2 days ago",
        "score": 85,
        "connections": ["t2", "t5", "t7"],
        "docId": "doc1",
        "quizzesTaken": 5,
        "quizId": "q1",
        "summaryId": "s1"
    },
    {
        "id": "t2",
        "title": "Active Recall",
        "state": "high",
        "lastReview": "1 day ago",
        "score": 92,
        "connections": ["t1", "t3", "t5"],
        "docId": "doc2",
        "quizzesTaken": 4,
        "quizId": "q2",
        "summaryId": "s2"
    },
    {
        "id": "t3",
        "title": "Spacing Effect",
        "state": "medium",
        "lastReview": "1 week ago",
        "score": 68,
        "connections": ["t2", "t4", "t6"],
        "docId": "doc3",
        "quizzesTaken": 3,
        "quizId": "q3",
        "summaryId": "s3"
    },
    {
        "id": "t4",
        "title": "Working Memory",
        "state": "fading",
        "lastReview": "2 weeks ago",
        "score": 45,
        "connections": ["t3", "t5"],
        "docId": "doc6",
        "quizzesTaken": 2,
        "quizId": "q4",
        "summaryId": "s4"
    },
    {
        "id": "t5",
        "title": "Interleaved Practice",
        "state": "medium",
        "lastReview": "4 days ago",
        "score": 75,
        "connections": ["t1", "t2", "t4"],
        "docId": "doc4",
        "quizzesTaken": 3,
        "quizId": "q5",
        "summaryId": "s5"
    },
    {
        "id": "t6",
        "title": "Metacognition",
        "state": "high",
        "lastReview": "3 days ago",
        "score": 88,
        "connections": ["t3", "t7"],
        "docId": "doc5",
        "quizzesTaken": 4,
        "quizId": "q6",
        "summaryId": "s6"
    },
    {
        "id": "t7",
        "title": "Retrieval Practice",
        "state": "medium",
        "lastReview": "5 days ago",
        "score": 72,
        "connections": ["t1", "t6"],
        "docId": "doc7",
        "quizzesTaken": 2,
        "quizId": "q7",
        "summaryId": "s7"
    },
    {
        "id": "t8",
        "title": "Chunking",
        "state": "fading",
        "lastReview": "3 weeks ago",
        "score": 52,
        "connections": ["t4"],
        "docId": "doc8",
        "quizzesTaken": 1,
        "quizId": "q8",
        "summaryId": "s8"
    }
]

# DOCUMENTS (User's uploaded documents)
# Each document links to a node via nodeId
# Title MUST match the corresponding node's title exactly
DOCUMENTS = [
    {
        "id": "doc1",
        "title": "Forgetting Curve",
        "filename": "forgetting-curve.pdf",
        "uploadDate": "2024-10-25",
        "lastReview": "2 days ago",
        "status": "completed",
        "retention": "high",
        "nextReview": "In 5 days",
        "quizScore": 85,
        "hasQuiz": True,
        "nodeId": "t1"
    },
    {
        "id": "lib2",
        "title": "Active Recall",
        "filename": "active-recall-notes.txt",
        "uploadDate": "2024-10-27",
        "lastReview": "1 day ago",
        "status": "completed",
        "retention": "high",
        "nextReview": "In 6 days",
        "quizScore": 92,
        "hasQuiz": True,
        "nodeId": "t2"
    },
    {
        "id": "lib3",
        "title": "Spacing Effect",
        "filename": "spacing-effect.pdf",
        "uploadDate": "2024-10-20",
        "lastReview": "1 week ago",
        "status": "completed",
        "retention": "medium",
        "nextReview": "Due today",
        "quizScore": 68,
        "hasQuiz": True,
        "nodeId": "t3"
    },
    {
        "id": "lib4",
        "title": "Interleaved Practice",
        "filename": "interleaved-practice.pdf",
        "uploadDate": "2024-10-22",
        "lastReview": "4 days ago",
        "status": "completed",
        "retention": "medium",
        "nextReview": "In 3 days",
        "quizScore": 75,
        "hasQuiz": True,
        "nodeId": "t5"
    },
    {
        "id": "lib5",
        "title": "Metacognition",
        "filename": "metacognition.pdf",
        "uploadDate": "2024-10-28",
        "lastReview": "3 days ago",
        "status": "completed",
        "retention": "high",
        "nextReview": "In 4 days",
        "quizScore": 88,
        "hasQuiz": True,
        "nodeId": "t6"
    },
    {
        "id": "lib6",
        "title": "Working Memory",
        "filename": "working-memory.txt",
        "uploadDate": "2024-10-10",
        "lastReview": "2 weeks ago",
        "status": "needs-review",
        "retention": "fading",
        "nextReview": "Overdue",
        "quizScore": 45,
        "hasQuiz": True,
        "nodeId": "t4"
    },
    {
        "id": "lib7",
        "title": "Retrieval Practice",
        "filename": "retrieval-practice.pdf",
        "uploadDate": "2024-10-23",
        "lastReview": "5 days ago",
        "status": "completed",
        "retention": "medium",
        "nextReview": "In 2 days",
        "quizScore": 72,
        "hasQuiz": True,
        "nodeId": "t7"
    },
    {
        "id": "lib8",
        "title": "Chunking",
        "filename": "chunking.txt",
        "uploadDate": "2024-10-05",
        "lastReview": "3 weeks ago",
        "status": "needs-review",
        "retention": "fading",
        "nextReview": "Overdue",
        "quizScore": 52,
        "hasQuiz": True,
        "nodeId": "t8"
    }
]

# Generate derived data using helper functions
STATS = get_stats(NODES)
RECALL_TASKS = get_recall_tasks(NODES)
KNOWLEDGE_CLUSTERS = get_knowledge_clusters(NODES)
RECOMMENDATIONS = get_recommendations(NODES)
