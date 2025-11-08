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
        "libraryId": "lib1",
        "quizzesTaken": 5,
        "quizId": "t1",
        "summaryId": "t1"
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
        "questions": [
            {
                "q": "What is the typical capacity of working memory?",
                "options": ["3-5 items", "7±2 items", "15-20 items", "Unlimited"],
                "correctIndex": 1
            },
            {
                "q": "What happens when working memory is overloaded?",
                "options": [
                    "Learning becomes more effective",
                    "Information is lost or not processed",
                    "Long-term memory improves",
                    "Attention span increases"
                ],
                "correctIndex": 1
            }
        ],
        "summary": {
            "content": "Working memory is a cognitive system responsible for temporarily holding and manipulating information needed for complex tasks. Research suggests working memory has a limited capacity of about 7±2 items (Miller's Law).\n\nWorking memory is crucial for learning, reasoning, and comprehension. When overloaded, it becomes a bottleneck that impairs learning and performance.\n\nStrategies to optimize working memory include chunking information, reducing cognitive load, and using external aids like notes or diagrams.",
            "keyTakeaways": [
                "Limited capacity of approximately 7±2 items",
                "Essential for complex cognitive tasks",
                "Can be overloaded, reducing learning effectiveness",
                "Chunking and external aids help manage load"
            ],
            "keywords": ["Working Memory", "Miller's Law", "Cognitive Load", "Chunking"]
        }
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
        "questions": [
            {
                "q": "What is interleaved practice?",
                "options": [
                    "Practicing one skill repeatedly until mastered",
                    "Mixing different topics or skills in a single study session",
                    "Taking breaks between study sessions",
                    "Reviewing material in the same order every time"
                ],
                "correctIndex": 1
            },
            {
                "q": "How does interleaved practice differ from blocked practice?",
                "options": [
                    "Blocked practice is always more effective",
                    "Interleaved practice mixes topics, blocked practice focuses on one",
                    "They are the same thing",
                    "Blocked practice requires more effort"
                ],
                "correctIndex": 1
            }
        ],
        "summary": {
            "content": "Interleaved practice involves mixing different topics or types of problems during a study session, rather than focusing on one topic at a time (blocked practice).\n\nWhile blocked practice may feel easier and produce faster initial gains, interleaved practice leads to better long-term retention and transfer of knowledge. The difficulty of switching between topics forces deeper processing.\n\nInterleaved practice is particularly effective for subjects that require discrimination between different concepts or problem types.",
            "keyTakeaways": [
                "Mix different topics rather than blocking by topic",
                "Feels harder but produces better long-term learning",
                "Improves ability to discriminate between concepts",
                "Particularly effective for math and science problems"
            ],
            "keywords": ["Interleaved Practice", "Blocked Practice", "Discrimination", "Transfer"]
        }
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
        "questions": [
            {
                "q": "What is metacognition?",
                "options": [
                    "Memory of facts and figures",
                    "Thinking about one's own thinking",
                    "The ability to focus attention",
                    "Speed of information processing"
                ],
                "correctIndex": 1
            },
            {
                "q": "Why is metacognition important for learning?",
                "options": [
                    "It increases reading speed",
                    "It helps monitor understanding and adjust strategies",
                    "It makes studying feel easier",
                    "It eliminates the need for practice"
                ],
                "correctIndex": 1
            }
        ],
        "summary": {
            "content": "Metacognition refers to awareness and understanding of one's own thought processes. It involves monitoring what you know, recognizing when you don't understand something, and adjusting learning strategies accordingly.\n\nEffective learners use metacognitive strategies to assess their understanding, identify gaps in knowledge, and select appropriate study methods. This self-regulation is a key predictor of academic success.\n\nCommon metacognitive strategies include self-testing, reflection on learning, and conscious evaluation of comprehension during study.",
            "keyTakeaways": [
                "Awareness of your own thinking and learning processes",
                "Essential for self-regulated learning",
                "Includes planning, monitoring, and evaluating learning",
                "Strong predictor of academic achievement"
            ],
            "keywords": ["Metacognition", "Self-Regulation", "Learning Strategies", "Self-Assessment"]
        }
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
        "questions": [
            {
                "q": "What is retrieval practice?",
                "options": [
                    "Re-reading material multiple times",
                    "Actively recalling information from memory",
                    "Highlighting important text",
                    "Listening to lectures repeatedly"
                ],
                "correctIndex": 1
            },
            {
                "q": "What is the testing effect?",
                "options": [
                    "Tests cause anxiety that improves focus",
                    "Taking tests improves long-term retention more than studying",
                    "More tests lead to lower grades",
                    "Testing is only useful for assessment, not learning"
                ],
                "correctIndex": 1
            }
        ],
        "summary": {
            "content": "Retrieval practice involves actively recalling information from memory rather than passively reviewing it. This practice strengthens memory and is one of the most powerful learning strategies.\n\nThe testing effect demonstrates that the act of retrieving information strengthens the memory trace more than additional study. Even unsuccessful retrieval attempts can enhance subsequent learning.\n\nEffective retrieval practice includes flashcards, practice tests, free recall, and self-quizzing without looking at notes.",
            "keyTakeaways": [
                "Active recall is more effective than passive review",
                "Testing effect: retrieval strengthens memory",
                "Even failed retrieval attempts benefit learning",
                "Should be frequent and low-stakes"
            ],
            "keywords": ["Retrieval Practice", "Testing Effect", "Active Recall", "Self-Quizzing"]
        }
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
        "questions": [
            {
                "q": "What is chunking in cognitive psychology?",
                "options": [
                    "Breaking study time into small sessions",
                    "Grouping individual pieces of information into larger units",
                    "Memorizing information word-for-word",
                    "Taking breaks during study sessions"
                ],
                "correctIndex": 1
            },
            {
                "q": "How does chunking help working memory?",
                "options": [
                    "It increases working memory capacity",
                    "It reduces the number of items to remember",
                    "It makes studying more enjoyable",
                    "It eliminates the need for practice"
                ],
                "correctIndex": 1
            }
        ],
        "summary": {
            "content": "Chunking is a memory strategy that involves grouping individual pieces of information into larger, meaningful units. This technique effectively expands working memory capacity by reducing the number of items to remember.\n\nFor example, the sequence '2-0-2-4-1-2-2-5' is easier to remember as '2024-12-25' (a date). Expert knowledge is often characterized by sophisticated chunking of domain information.\n\nChunking is most effective when the grouped information is meaningful and follows familiar patterns or schemas.",
            "keyTakeaways": [
                "Groups individual items into meaningful larger units",
                "Expands effective working memory capacity",
                "More effective with meaningful patterns",
                "Underlies expert performance in many domains"
            ],
            "keywords": ["Chunking", "Working Memory", "Information Processing", "Pattern Recognition"]
        }
    }
]

# LIBRARY ITEMS (User's uploaded documents)
# Each library item links to a node via nodeId
# Title MUST match the corresponding node's title exactly
LIBRARY_ITEMS = [
    {
        "id": "lib1",
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
