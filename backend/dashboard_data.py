# Dashboard Mock Data
# Consolidated and optimized data structure
# Single source of truth for all knowledge nodes and library items

# ========================================
# KNOWLEDGE NODES (Single Source of Truth)
# ========================================
# Used by: Dashboard, Insights, Knowledge Graph
# Each node contains: metadata, quiz questions, and summary content
NODES = [
    {
        "id": "t1",
        "title": "Forgetting Curve",
        "state": "high",
        "lastReview": "2 days ago",
        "score": 85,
        "connections": ["t2", "t5", "t7"],
        "libraryId": "lib1",
        "quizzesTaken": 5,
        "questions": [
            {
                "q": "What percentage of information do we typically forget within 24 hours?",
                "options": ["30%", "50%", "70%", "90%"],
                "correctIndex": 2
            },
            {
                "q": "What is the most effective way to combat the forgetting curve?",
                "options": ["Cramming", "Spaced repetition", "Highlighting", "Passive re-reading"],
                "correctIndex": 1
            }
        ],
        "summary": {
            "content": "The forgetting curve, discovered by Hermann Ebbinghaus in 1885, shows how memory retention declines exponentially over time without reinforcement. Within 24 hours, we forget approximately 70% of new information unless we actively review it.\n\nThe key to combating the forgetting curve is spaced repetition — reviewing material at increasing intervals (1 day, 3 days, 7 days, 14 days). Each review strengthens the memory trace, making it more resistant to decay.\n\nActive recall, where you actively retrieve information from memory rather than passively re-reading, is the most effective review method. This effortful retrieval process strengthens neural pathways and creates more durable memories.",
            "keyTakeaways": [
                "Review just before forgetting to maximize retention efficiency",
                "Spacing intervals should expand: 1d → 3d → 7d → 14d → 1m",
                "Active recall strengthens memory better than passive re-reading",
                "Each successful recall makes the next forgetting curve flatter"
            ],
            "keywords": ["Forgetting Curve", "Spaced Repetition", "Active Recall", "Memory Consolidation"]
        }
    },
    {
        "id": "t2",
        "title": "Active Recall",
        "state": "high",
        "lastReview": "1 day ago",
        "score": 92,
        "connections": ["t1", "t3", "t5"],
        "libraryId": "lib2",
        "quizzesTaken": 4,
        "questions": [
            {
                "q": "What is active recall?",
                "options": [
                    "Re-reading your notes carefully",
                    "Highlighting important information",
                    "Testing yourself without looking at notes",
                    "Listening to lectures repeatedly"
                ],
                "correctIndex": 2
            },
            {
                "q": "Why is active recall more effective than passive review?",
                "options": [
                    "It takes less time",
                    "It strengthens neural pathways through retrieval",
                    "It is easier to do",
                    "It requires no effort"
                ],
                "correctIndex": 1
            }
        ],
        "summary": {
            "content": "Active recall is a learning technique that involves actively retrieving information from memory rather than passively reviewing notes. This method has been proven to be one of the most effective study strategies.\n\nWhen you practice active recall, you're forcing your brain to reconstruct the information, which strengthens neural pathways. This is much more effective than simply re-reading or highlighting text.\n\nResearch shows that testing yourself regularly leads to better long-term retention than spending the same amount of time reviewing material.",
            "keyTakeaways": [
                "Actively retrieve information rather than passively reviewing",
                "Testing effect: Taking practice tests improves long-term memory",
                "Combines well with spaced repetition for maximum effect",
                "Initial difficulty during retrieval leads to stronger memories"
            ],
            "keywords": ["Active Recall", "Testing Effect", "Retrieval Practice", "Learning Strategies"]
        }
    },
    {
        "id": "t3",
        "title": "Spacing Effect",
        "state": "medium",
        "lastReview": "1 week ago",
        "score": 68,
        "connections": ["t2", "t4", "t6"],
        "libraryId": "lib3",
        "quizzesTaken": 3,
        "questions": [
            {
                "q": "What is the spacing effect?",
                "options": [
                    "Studying in a quiet space",
                    "Learning is more effective when spaced over time",
                    "Taking breaks during study sessions",
                    "Organizing notes with proper spacing"
                ],
                "correctIndex": 1
            },
            {
                "q": "Which study pattern demonstrates the spacing effect?",
                "options": [
                    "Reviewing 1 hour per day for 5 days",
                    "Reviewing 5 hours in one day",
                    "Reviewing only before exams",
                    "Never reviewing material"
                ],
                "correctIndex": 0
            }
        ],
        "summary": {
            "content": "The spacing effect demonstrates that learning is more effective when study sessions are spaced out over time rather than massed together in a single session. This phenomenon has been consistently demonstrated across various types of learning.\n\nWhen you space out your learning, you give your brain time to consolidate the information. Each time you return to the material, you're strengthening the neural connections associated with that knowledge.\n\nOptimal spacing intervals typically follow an expanding pattern: review after 1 day, then 3 days, then 7 days, then 14 days, and so on.",
            "keyTakeaways": [
                "Distributed practice beats massed practice (cramming)",
                "Optimal intervals expand over time as memory strengthens",
                "Spacing creates opportunities for memory consolidation",
                "Works across all types of learning and skill acquisition"
            ],
            "keywords": ["Spacing Effect", "Distributed Practice", "Memory Consolidation", "Study Schedule"]
        }
    },
    {
        "id": "t4",
        "title": "Working Memory",
        "state": "fading",
        "lastReview": "2 weeks ago",
        "score": 45,
        "connections": ["t3", "t5"],
        "libraryId": "lib6",
        "quizzesTaken": 2,
        "questions": [],
        "summary": None
    },
    {
        "id": "t5",
        "title": "Interleaved Practice",
        "state": "medium",
        "lastReview": "4 days ago",
        "score": 75,
        "connections": ["t1", "t2", "t4"],
        "libraryId": "lib4",
        "quizzesTaken": 3,
        "questions": [],
        "summary": None
    },
    {
        "id": "t6",
        "title": "Metacognition",
        "state": "high",
        "lastReview": "3 days ago",
        "score": 88,
        "connections": ["t3", "t7"],
        "libraryId": "lib5",
        "quizzesTaken": 4,
        "questions": [],
        "summary": None
    },
    {
        "id": "t7",
        "title": "Retrieval Practice",
        "state": "medium",
        "lastReview": "5 days ago",
        "score": 72,
        "connections": ["t1", "t6"],
        "libraryId": "lib7",
        "quizzesTaken": 2,
        "questions": [],
        "summary": None
    },
    {
        "id": "t8",
        "title": "Chunking",
        "state": "fading",
        "lastReview": "3 weeks ago",
        "score": 52,
        "connections": ["t4"],
        "libraryId": "lib8",
        "quizzesTaken": 1,
        "questions": [],
        "summary": None
    }
]

# Backward compatibility alias (will be removed in future)
TOPICS = NODES

# ========================================
# RECALL TASKS (Dynamically generated from NODES)
# ========================================
def get_recall_tasks():
    """Generate recall tasks from nodes that need review"""
    tasks = []
    
    for node in NODES:
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

# ========================================
# STATISTICS (Dynamically calculated from NODES)
# ========================================
def get_stats():
    """Calculate statistics from nodes and library items"""
    # Calculate items due today (from recall tasks)
    recall_tasks = get_recall_tasks()
    items_due_today = len(recall_tasks)
    
    # Calculate average retention (average score across all nodes)
    total_score = sum(n["score"] for n in NODES)
    avg_retention = total_score // len(NODES) if NODES else 0
    
    # Streak days (hardcoded for now, would be user-specific in real app)
    streak_days = 7
    
    # Count nodes by retention state
    strong_retention = len([n for n in NODES if n["state"] == "high"])
    needing_review = len([n for n in NODES if n["state"] == "fading"])
    
    # Count total connections
    total_connections = sum(len(n["connections"]) for n in NODES)
    
    return {
        "dashboard": {
            "itemsDueToday": items_due_today,
            "avgRetention": avg_retention,
            "streakDays": streak_days
        },
        "insights": {
            "totalTopics": len(NODES),
            "strongRetention": strong_retention,
            "needingReview": needing_review
        },
        "knowledge": {
            "totalNodes": len(NODES),
            "totalConnections": total_connections
        }
    }

STATS = get_stats()
RECALL_TASKS = get_recall_tasks()

# ========================================
# LIBRARY ITEMS (User's uploaded documents)
# ========================================
LIBRARY_ITEMS = [
    {
        "id": "lib1",
        "title": "Forgetting Curve & Memory Retention",
        "filename": "forgetting-curve.pdf",
        "uploadDate": "2024-10-25",
        "lastReview": "2 days ago",
        "status": "completed",
        "retention": "high",
        "nextReview": "In 5 days",
        "quizScore": 85,
        "hasQuiz": True,
        "nodeId": "t1"  # Links to node for quiz questions
    },
    {
        "id": "lib2",
        "title": "Active Recall Strategies",
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
        "title": "Spacing Effect Research Paper",
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
        "title": "Interleaved Practice Study",
        "filename": "interleaved-practice.pdf",
        "uploadDate": "2024-10-22",
        "lastReview": "4 days ago",
        "status": "completed",
        "retention": "medium",
        "nextReview": "In 3 days",
        "quizScore": 75,
        "hasQuiz": False,
        "nodeId": "t5"
    },
    {
        "id": "lib5",
        "title": "Metacognition & Learning",
        "filename": "metacognition.pdf",
        "uploadDate": "2024-10-28",
        "lastReview": "3 days ago",
        "status": "completed",
        "retention": "high",
        "nextReview": "In 4 days",
        "quizScore": 88,
        "hasQuiz": False,
        "nodeId": "t6"
    },
    {
        "id": "lib6",
        "title": "Working Memory Capacity",
        "filename": "working-memory.txt",
        "uploadDate": "2024-10-10",
        "lastReview": "2 weeks ago",
        "status": "needs-review",
        "retention": "fading",
        "nextReview": "Overdue",
        "quizScore": 45,
        "hasQuiz": False,
        "nodeId": "t4"
    },
    {
        "id": "lib7",
        "title": "Retrieval Practice Techniques",
        "filename": "retrieval-practice.pdf",
        "uploadDate": "2024-10-23",
        "lastReview": "5 days ago",
        "status": "completed",
        "retention": "medium",
        "nextReview": "In 2 days",
        "quizScore": 72,
        "hasQuiz": False,
        "nodeId": "t7"
    },
    {
        "id": "lib8",
        "title": "Chunking Information Guide",
        "filename": "chunking.txt",
        "uploadDate": "2024-10-05",
        "lastReview": "3 weeks ago",
        "status": "needs-review",
        "retention": "fading",
        "nextReview": "Overdue",
        "quizScore": 52,
        "hasQuiz": False,
        "nodeId": "t8"
    }
]

# ========================================
# KNOWLEDGE CLUSTERS (Dynamically generated from NODES)
# ========================================
def get_knowledge_clusters():
    """Generate knowledge clusters by analyzing node connections"""
    # Predefined clusters based on topic relationships
    clusters = []
    
    # Memory Retention cluster (high retention nodes)
    memory_nodes = [n for n in NODES if n["id"] in ["t1", "t2", "t5"]]
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
    study_nodes = [n for n in NODES if n["id"] in ["t2", "t3", "t5"]]
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
    cognitive_nodes = [n for n in NODES if n["id"] in ["t4", "t6", "t7"]]
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

KNOWLEDGE_CLUSTERS = get_knowledge_clusters()

# ========================================
# RECOMMENDATIONS (Dynamically generated from NODES)
# ========================================
def get_recommendations():
    """Generate personalized recommendations based on node states"""
    recommendations = []
    
    # Find fading nodes (need review)
    fading_nodes = [n for n in NODES if n["state"] == "fading"]
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
    strong_nodes = [n for n in NODES if n["state"] == "high" and n["score"] > 85]
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
    connected_nodes = sorted(NODES, key=lambda n: len(n["connections"]), reverse=True)
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

RECOMMENDATIONS = get_recommendations()
