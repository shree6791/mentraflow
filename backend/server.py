from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from auth import auth_router, set_database

# Import modular routes
from routes import health, nodes, library, stats, recall, insights, quiz

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Set database for auth module
set_database(db)

# Create the main app without a prefix
app = FastAPI(
    title="Knowledge Retention API",
    description="API for knowledge retention and learning platform",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Quiz Result Models
class QuizAnswer(BaseModel):
    questionIndex: int
    selectedAnswer: int
    isCorrect: bool

class QuizResultSubmit(BaseModel):
    nodeId: str
    quizId: str
    answers: List[QuizAnswer]
    score: int
    percentage: int
    totalQuestions: int

class QuizResultResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    success: bool
    message: str
    xpGained: int
    updatedScore: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj



# ========================================
# CONSOLIDATED API ENDPOINTS
# ========================================

# --------------------------------------
# KNOWLEDGE GRAPH NODES (Lightweight & Detail)
# --------------------------------------

@api_router.get("/nodes")
async def get_all_nodes():
    """
    LIGHTWEIGHT API - Get minimal node data for graph display
    Returns: id, title, state, lastReview, score, connections
    Used by: Knowledge Graph for initial render
    """
    # Return only essential fields for graph visualization
    lightweight_nodes = [{
        "id": node["id"],
        "title": node["title"],
        "state": node["state"],
        "lastReview": node["lastReview"],
        "score": node["score"],
        "connections": node["connections"]
    } for node in NODES]
    
    return {"nodes": lightweight_nodes}

@api_router.get("/node/{title}")
async def get_node_detail(title: str):
    """
    DETAIL API - Get comprehensive node data (with lazy loading)
    Returns: All node data + summary + quiz + performance
    Used by: Modal when user clicks on a node
    
    LAZY LOADING: Quiz and summary content loaded on-demand from separate files
    """
    import urllib.parse
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

# --------------------------------------
# STATS (Unified - all statistics in one place)
# --------------------------------------

@api_router.get("/stats")
async def get_all_stats():
    """
    Get all statistics (dashboard, insights, knowledge graph)
    Frontend picks what it needs
    """
    return STATS

# --------------------------------------
# LIBRARY (Dashboard specific)
# --------------------------------------

@api_router.get("/library")
async def get_library_items():
    """Get all documents (user's uploaded study materials)"""
    return {"items": DOCUMENTS}

# --------------------------------------
# RECALL TASKS
# --------------------------------------

@api_router.get("/recall-tasks")
async def get_recall_tasks():
    """Get recall tasks due today"""
    return {"tasks": RECALL_TASKS}

# --------------------------------------
# INSIGHTS SPECIFIC
# --------------------------------------

@api_router.get("/clusters")
async def get_knowledge_clusters():
    """Get knowledge clusters with topics and average scores"""
    return {"clusters": KNOWLEDGE_CLUSTERS}

@api_router.get("/recommendations")
async def get_recommendations():
    """Get personalized recommendations"""
    return {"recommendations": RECOMMENDATIONS}

# --------------------------------------
# QUIZ SUBMISSION
# --------------------------------------

@api_router.post("/quiz-results", response_model=QuizResultResponse)
async def submit_quiz_result(quiz_result: QuizResultSubmit):
    """
    Submit quiz results and update user progress
    
    Mock implementation that:
    - Stores quiz result in database
    - Calculates XP gain
    - Updates node score
    - Returns success response
    """
    # Calculate XP based on performance
    xp_gain = 10  # Base XP
    if quiz_result.percentage == 100:
        xp_gain = 20  # Perfect score bonus
    elif quiz_result.percentage >= 80:
        xp_gain = 15  # High score bonus
    
    # Prepare data for storage
    result_doc = {
        "id": str(uuid.uuid4()),
        "nodeId": quiz_result.nodeId,
        "quizId": quiz_result.quizId,
        "score": quiz_result.score,
        "percentage": quiz_result.percentage,
        "totalQuestions": quiz_result.totalQuestions,
        "answers": [answer.model_dump() for answer in quiz_result.answers],
        "xpGained": xp_gain,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # Store in database (mock storage)
    try:
        await db.quiz_results.insert_one(result_doc)
    except Exception as e:
        logging.error(f"Error storing quiz result: {e}")
    
    # Find the node and update its score (in real app, this would update NODES in DB)
    node = next((n for n in NODES if n["id"] == quiz_result.nodeId), None)
    updated_score = quiz_result.percentage
    
    if node:
        # In a real implementation, update the node score in database
        updated_score = node.get("score", 0)
        logging.info(f"Quiz submitted for node {quiz_result.nodeId}: {quiz_result.percentage}%")
    
    # Generate motivational message
    if quiz_result.percentage == 100:
        message = f"🎉 Perfect score! +{xp_gain} XP. You've mastered this topic!"
    elif quiz_result.percentage >= 80:
        message = f"✅ Great work! {quiz_result.percentage}% correct. +{xp_gain} XP"
    elif quiz_result.percentage >= 60:
        message = f"🧠 Good effort! {quiz_result.percentage}% correct. +{xp_gain} XP. Keep practicing!"
    else:
        message = f"💪 {quiz_result.percentage}% correct. +{xp_gain} XP. Each recall strengthens your memory!"
    
    return QuizResultResponse(
        success=True,
        message=message,
        xpGained=xp_gain,
        updatedScore=updated_score
    )

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include auth router
api_router.include_router(auth_router)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()