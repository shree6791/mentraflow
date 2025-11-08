# Dashboard Mock Data
# Consolidated and optimized data structure

# ========================================
# UNIFIED TOPICS/NODES DATA (Single Source of Truth)
# ========================================
# Used by: Dashboard, Insights, Knowledge Graph
TOPICS = [
    {
        "id": "t1",
        "title": "Forgetting Curve",
        "state": "high",
        "lastReview": "2 days ago",
        "score": 85,
        "connections": ["t2", "t5", "t7"],
        "libraryId": "lib1",
        "quizzesTaken": 5
    },
    {
        "id": "t2",
        "title": "Active Recall",
        "state": "high",
        "lastReview": "1 day ago",
        "score": 92,
        "connections": ["t1", "t3", "t5"],
        "libraryId": "lib2",
        "quizzesTaken": 4
    },
    {
        "id": "t3",
        "title": "Spacing Effect",
        "state": "medium",
        "lastReview": "1 week ago",
        "score": 68,
        "connections": ["t2", "t4", "t6"],
        "libraryId": "lib3",
        "quizzesTaken": 3
    },
    {
        "id": "t4",
        "title": "Working Memory",
        "state": "fading",
        "lastReview": "2 weeks ago",
        "score": 45,
        "connections": ["t3", "t5"],
        "libraryId": "lib6",
        "quizzesTaken": 2
    },
    {
        "id": "t5",
        "title": "Cognitive Load",
        "state": "high",
        "lastReview": "3 days ago",
        "score": 88,
        "connections": ["t1", "t2", "t4", "t6"],
        "libraryId": "lib5",
        "quizzesTaken": 6
    },
    {
        "id": "t6",
        "title": "Neuroplasticity",
        "state": "medium",
        "lastReview": "5 days ago",
        "score": 72,
        "connections": ["t3", "t5", "t7"],
        "libraryId": "lib4",
        "quizzesTaken": 3
    },
    {
        "id": "t7",
        "title": "Memory Consolidation",
        "state": "fading",
        "lastReview": "3 weeks ago",
        "score": 38,
        "connections": ["t1", "t6"],
        "libraryId": "lib1",
        "quizzesTaken": 1
    },
    {
        "id": "t8",
        "title": "Metacognition",
        "state": "high",
        "lastReview": "1 day ago",
        "score": 90,
        "connections": ["t2", "t5"],
        "libraryId": "lib2",
        "quizzesTaken": 5
    }
]

# ========================================
# UNIFIED STATISTICS (Single Source of Truth)
# ========================================
# Used by: Dashboard, Insights
STATS = {
    "dashboard": {
        "totalItems": 6,
        "itemsDueToday": 3,
        "avgRetention": 72,
        "streakDays": 7
    },
    "insights": {
        "totalQuizzes": 23,
        "avgScore": 75,
        "strongTopics": 3,
        "needsReview": 2,
        "streak": 4,
        "totalNotes": 12
    },
    "knowledge": {
        "totalTopics": 8,
        "totalConnections": 24,
        "avgConnectionsPerTopic": 3
    }
}

# ========================================
# LIBRARY ITEMS (Dashboard specific)
# ========================================

LIBRARY_ITEMS = [
    {
        "id": "lib1",
        "title": "The Forgetting Curve & Memory Retention",
        "filename": "forgetting-curve.pdf",
        "uploadDate": "2024-10-28",
        "status": "summarized",
        "hasQuiz": True,
        "quizScore": 80,
        "lastReview": "2 days ago",
        "retention": "high",
        "nextReview": "In 5 days",
        "nextReviewDays": 5
    },
    {
        "id": "lib2",
        "title": "Active Recall Techniques",
        "filename": "active-recall-notes.txt",
        "uploadDate": "2024-10-25",
        "status": "summarized",
        "hasQuiz": True,
        "quizScore": 75,
        "lastReview": "5 days ago",
        "retention": "medium",
        "nextReview": "In 2 days",
        "nextReviewDays": 2
    },
    {
        "id": "lib3",
        "title": "Spacing Effect Research Paper",
        "filename": "spacing-effect.pdf",
        "uploadDate": "2024-10-20",
        "status": "summarized",
        "hasQuiz": True,
        "quizScore": 60,
        "lastReview": "2 weeks ago",
        "retention": "fading",
        "nextReview": "Overdue!",
        "nextReviewDays": -3
    },
    {
        "id": "lib4",
        "title": "Neuroplasticity and Learning",
        "filename": "neuroplasticity.docx",
        "uploadDate": "2024-11-01",
        "status": "summarized",
        "hasQuiz": True,
        "quizScore": 85,
        "lastReview": "1 day ago",
        "retention": "high",
        "nextReview": "In 6 days",
        "nextReviewDays": 6
    },
    {
        "id": "lib5",
        "title": "Cognitive Load Theory",
        "filename": "cognitive-load.pdf",
        "uploadDate": "2024-10-18",
        "status": "summarized",
        "hasQuiz": True,
        "quizScore": 55,
        "lastReview": "3 weeks ago",
        "retention": "fading",
        "nextReview": "Overdue!",
        "nextReviewDays": -10
    },
    {
        "id": "lib6",
        "title": "Working Memory Capacity",
        "filename": "working-memory.txt",
        "uploadDate": "2024-10-22",
        "status": "summarized",
        "hasQuiz": True,
        "quizScore": 70,
        "lastReview": "1 week ago",
        "retention": "medium",
        "nextReview": "Tomorrow",
        "nextReviewDays": 1
    }
]

SAMPLE_TOPICS = [
    {"id": "t1", "title": "Forgetting Curve", "status": "high", "lastReview": "2 days ago", "libraryId": "lib1"},
    {"id": "t2", "title": "Active Recall", "status": "medium", "lastReview": "5 days ago", "libraryId": "lib2"},
    {"id": "t3", "title": "Spacing Effect", "status": "fading", "lastReview": "2 weeks ago", "libraryId": "lib3"},
    {"id": "t4", "title": "Neuroplasticity", "status": "medium", "lastReview": "Never", "libraryId": "lib4"},
    {"id": "t5", "title": "Memory Consolidation", "status": "high", "lastReview": "3 days ago", "libraryId": "lib1"}
]

RECALL_TASKS = [
    {
        "id": "recall1",
        "title": "Forgetting Curve",
        "libraryId": "lib1",
        "type": "quiz",
        "dueIn": "Due now",
        "questionCount": 2,
        "lastScore": 80
    },
    {
        "id": "recall2",
        "title": "Spacing Effect",
        "libraryId": "lib3",
        "type": "review",
        "dueIn": "Due in 2 hours",
        "questionCount": 3,
        "lastScore": 60
    },
    {
        "id": "recall3",
        "title": "Active Recall",
        "libraryId": "lib2",
        "type": "quiz",
        "dueIn": "Due in 5 hours",
        "questionCount": 2,
        "lastScore": None
    }
]

# ========================================
# INSIGHTS SPECIFIC DATA
# ========================================

KNOWLEDGE_CLUSTERS = [
    {"name": "Memory Techniques", "topics": 5, "avgScore": 85, "color": "#0E7C7B"},
    {"name": "Learning Science", "topics": 4, "avgScore": 72, "color": "#4E9AF1"},
    {"name": "Neuroscience", "topics": 3, "avgScore": 68, "color": "#FFD166"},
    {"name": "Study Methods", "topics": 2, "avgScore": 58, "color": "#EF476F"}
]

RECOMMENDATIONS = [
    {"text": "Review \"Interleaving Practice\" - Last reviewed 2 weeks ago", "priority": "high"},
    {"text": "Your Memory Techniques cluster is strong! Keep it up", "priority": "success"},
    {"text": "Consider reviewing Neural Pathways before it fades", "priority": "medium"}
]

# ========================================
# QUIZ DATA
# ========================================

QUICK_RECALL_QUIZ = {
    "Forgetting Curve": [
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
    "Spacing Effect": [
        {
            "q": "What is the spacing effect?",
            "options": [
                "Studying in large blocks of time",
                "Learning improves when review sessions are spaced out",
                "Taking breaks during study sessions",
                "Organizing notes by topics"
            ],
            "correctIndex": 1
        },
        {
            "q": "Which review schedule follows the spacing effect?",
            "options": ["1d → 1d → 1d", "1d → 3d → 7d → 14d", "Weekly reviews only", "Daily reviews forever"],
            "correctIndex": 1
        },
        {
            "q": "Why does spacing reviews work better than massing?",
            "options": [
                "It takes less total time",
                "It creates stronger, more durable memories",
                "It requires less effort",
                "It covers more material"
            ],
            "correctIndex": 1
        }
    ],
    "Active Recall": [
        {
            "q": "What is active recall?",
            "options": [
                "Re-reading notes multiple times",
                "Highlighting important passages",
                "Actively retrieving information from memory",
                "Organizing notes into summaries"
            ],
            "correctIndex": 2
        },
        {
            "q": "Why is active recall more effective than passive review?",
            "options": [
                "It's faster",
                "It strengthens neural pathways through effortful retrieval",
                "It's easier",
                "It requires less understanding"
            ],
            "correctIndex": 1
        }
    ]
}

# ========================================
# TOPIC SUMMARIES (Detailed content)
# ========================================

TOPIC_SUMMARIES = {
    "Forgetting Curve": {
        "content": "The forgetting curve, discovered by Hermann Ebbinghaus in 1885, shows how memory retention declines exponentially over time without reinforcement. Within 24 hours, we forget approximately 70% of new information unless we actively review it.\n\nThe key to combating the forgetting curve is spaced repetition — reviewing material at increasing intervals (1 day, 3 days, 7 days, 14 days). Each review strengthens the memory trace, making it more resistant to decay.\n\nActive recall, where you actively retrieve information from memory rather than passively re-reading, is the most effective review method. This effortful retrieval process strengthens neural pathways and creates more durable memories.",
        "keyTakeaways": [
            "Review just before forgetting to maximize retention efficiency",
            "Spacing intervals should expand: 1d → 3d → 7d → 14d → 1m",
            "Active recall strengthens memory better than passive re-reading",
            "Each successful recall makes the next forgetting curve flatter"
        ],
        "keywords": ["Forgetting Curve", "Spaced Repetition", "Active Recall", "Memory Consolidation"]
    },
    "Active Recall": {
        "content": "Active recall is a learning technique that involves actively retrieving information from memory rather than passively reviewing notes. This method has been proven to be one of the most effective study strategies.\n\nWhen you practice active recall, you're forcing your brain to reconstruct the information, which strengthens neural pathways. This is much more effective than simply re-reading or highlighting text.\n\nResearch shows that testing yourself regularly leads to better long-term retention than spending the same amount of time reviewing material.",
        "keyTakeaways": [
            "Actively retrieve information rather than passively reviewing",
            "Testing effect: Taking practice tests improves long-term memory",
            "Combines well with spaced repetition for maximum effect",
            "Initial difficulty during retrieval leads to stronger memories"
        ],
        "keywords": ["Active Recall", "Testing Effect", "Retrieval Practice", "Learning Strategies"]
    },
    "Spacing Effect": {
        "content": "The spacing effect demonstrates that learning is more effective when study sessions are spaced out over time rather than massed together in a single session. This phenomenon has been consistently demonstrated across various types of learning.\n\nWhen you space out your learning, you give your brain time to consolidate the information. Each time you return to the material, you're strengthening the neural connections associated with that knowledge.\n\nOptimal spacing intervals typically follow an expanding pattern: review after 1 day, then 3 days, then 7 days, then 14 days, and so on.",
        "keyTakeaways": [
            "Distributed practice beats massed practice (cramming)",
            "Optimal intervals expand over time as memory strengthens",
            "Spacing creates opportunities for memory consolidation",
            "Works across all types of learning and skill acquisition"
        ],
        "keywords": ["Spacing Effect", "Distributed Practice", "Memory Consolidation", "Study Schedule"]
    }
}

