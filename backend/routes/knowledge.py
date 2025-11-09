"""
Knowledge Capture Routes
Endpoints for capturing new knowledge and generating summaries/quizzes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


# Models
class KnowledgeCaptureRequest(BaseModel):
    content: str
    title: Optional[str] = None
    tags: Optional[List[str]] = []
    
    # Quiz customization options
    questionCount: Optional[int] = 5  # Default: 5 questions
    difficulty: Optional[str] = "balanced"  # Default: balanced (easy, balanced, advanced)
    focusArea: Optional[str] = "all"  # Default: all topics


class SummaryResponse(BaseModel):
    content: str
    keyTakeaways: List[str]
    keywords: List[str]


class QuizQuestion(BaseModel):
    q: str
    options: List[str]
    correctIndex: int


class QuizResponse(BaseModel):
    questions: List[QuizQuestion]


class GenerateResponse(BaseModel):
    summary: SummaryResponse
    quiz: QuizResponse


@router.post("/generate", response_model=GenerateResponse)
async def generate_summary_and_quiz(request: KnowledgeCaptureRequest):
    """
    Generate summary and quiz from captured knowledge
    
    Mock implementation that returns dummy content
    In production, this would call AI services (GPT-5, Claude, etc.)
    """
    
    if not request.content or len(request.content.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Content too short. Please provide at least 20 characters."
        )
    
    # Mock: Extract topic from content (first few words) or use title
    topic = request.title if request.title else request.content[:50].strip()
    
    # Mock Summary Generation
    mock_summary = SummaryResponse(
        content=f"This is a comprehensive summary of your knowledge about '{topic}'. "
                f"The content you provided covers several key concepts and ideas that are important "
                f"for understanding this topic. By breaking down the information into digestible parts, "
                f"you can better retain and recall this knowledge when needed. "
                f"Consider reviewing this material regularly to strengthen your understanding.",
        keyTakeaways=[
            f"Key concept 1: Main idea from '{topic}'",
            f"Key concept 2: Important detail about the subject",
            f"Key concept 3: Practical application of this knowledge",
            f"Key concept 4: Connection to related topics"
        ],
        keywords=["Learning", "Knowledge Retention", "Study", topic[:20]]
    )
    
    # Mock Quiz Generation
    mock_quiz = QuizResponse(
        questions=[
            QuizQuestion(
                q=f"What is the main concept discussed in '{topic}'?",
                options=[
                    "Option A: First possible answer",
                    "Option B: Correct understanding",
                    "Option C: Alternative interpretation",
                    "Option D: Unrelated concept"
                ],
                correctIndex=1
            ),
            QuizQuestion(
                q=f"How can you apply the knowledge from '{topic}' in practice?",
                options=[
                    "By memorizing facts without context",
                    "By connecting it to real-world scenarios",
                    "By ignoring the practical aspects",
                    "By only theoretical study"
                ],
                correctIndex=1
            ),
            QuizQuestion(
                q=f"Which of the following is a key takeaway from '{topic}'?",
                options=[
                    "Unrelated information",
                    "Main concept that supports understanding",
                    "Random fact",
                    "Contradictory statement"
                ],
                correctIndex=1
            )
        ]
    )
    
    logger.info(f"Generated content for: {topic[:30]}...")
    
    return GenerateResponse(
        summary=mock_summary,
        quiz=mock_quiz
    )
