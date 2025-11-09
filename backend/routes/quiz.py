"""
Quiz Routes
Endpoints for quiz submission and results tracking
"""

from fastapi import APIRouter
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os
import uuid
import logging
from db.dashboard_data import NODES
from validation.validators import QuizValidator
from models.quiz import QuizAnswer, QuizResultSubmit, QuizResultResponse

router = APIRouter()

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.knowledge_app


@router.post("/quiz-results", response_model=QuizResultResponse)
async def submit_quiz_result(quiz_result: QuizResultSubmit):
    """
    Submit quiz results and update user progress
    
    Mock implementation that:
    - Validates quiz submission
    - Stores quiz result in database
    - Calculates XP gain
    - Updates node score
    - Returns success response
    """
    # Validate quiz submission
    QuizValidator.validate_answers(
        quiz_result.answers,
        quiz_result.totalQuestions
    )
    QuizValidator.validate_score(
        quiz_result.score,
        quiz_result.percentage,
        quiz_result.totalQuestions
    )
    
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
