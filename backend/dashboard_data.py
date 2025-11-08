# Dashboard Mock Data
# This file contains all mock data that will be returned by API endpoints

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

DASHBOARD_STATS = {
    "totalItems": 6,
    "itemsDueToday": 3,
    "avgRetention": 72,
    "streakDays": 7
}
