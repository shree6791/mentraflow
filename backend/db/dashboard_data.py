# Dashboard Data
# Pure data layer - only constants, no business logic
#
# Business logic moved to services/:
# - services/recall_service.py
# - services/stats_service.py
# - services/insights_service.py
#
# Routes call services directly with NODES as input


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
        "id": "doc2",
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
        "id": "doc3",
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
        "id": "doc4",
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
        "id": "doc5",
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
        "id": "doc6",
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
        "id": "doc7",
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
        "id": "doc8",
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
