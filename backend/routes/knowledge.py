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
    
    # Get customization parameters with defaults
    question_count = min(request.questionCount or 5, 10)  # Max 10 questions
    difficulty = request.difficulty or "balanced"
    focus_area = request.focusArea or "all"
    
    # Mock Summary Generation (customized based on difficulty)
    if difficulty == "easy":
        summary_detail = "straightforward and easy-to-understand"
    elif difficulty == "advanced":
        summary_detail = "in-depth and comprehensive"
    else:
        summary_detail = "balanced and well-structured"
    
    mock_summary = SummaryResponse(
        content=f"This is a {summary_detail} summary of your knowledge about '{topic}'. "
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
    
    # Mock Quiz Generation (customized based on parameters)
    mock_questions = []
    
    # Generate questions based on requested count
    question_templates = [
        ("What is the main concept discussed in '{topic}'?", 
         ["First option", "Correct understanding", "Alternative view", "Unrelated idea"]),
        ("How can you apply the knowledge from '{topic}' in practice?",
         ["Memorizing facts", "Real-world scenarios", "Ignoring practice", "Theory only"]),
        ("Which of the following is a key takeaway from '{topic}'?",
         ["Unrelated info", "Main concept", "Random fact", "Contradictory point"]),
        ("What is the significance of '{topic}' in learning?",
         ["Not important", "Fundamental principle", "Optional knowledge", "Outdated concept"]),
        ("How does '{topic}' connect to other concepts?",
         ["No connections", "Multiple relationships", "Isolated concept", "Unrelated ideas"]),
        ("What would be a practical example of '{topic}'?",
         ["Abstract theory", "Real-world application", "Hypothetical scenario", "Unrelated case"]),
        ("Why is understanding '{topic}' important?",
         ["It's not important", "Essential for mastery", "Optional information", "Outdated knowledge"]),
        ("How can you test your understanding of '{topic}'?",
         ["Don't test it", "Practice problems", "Just read more", "Ignore assessments"]),
        ("What misconception exists about '{topic}'?",
         ["There are none", "Common misunderstanding", "Everyone gets it", "No confusion"]),
        ("How would you explain '{topic}' to someone else?",
         ["Can't explain it", "Clear and simple terms", "Complex jargon", "Avoid explaining"])
    ]
    
    for i in range(question_count):
        template_idx = i % len(question_templates)
        q_template, options_template = question_templates[template_idx]
        
        # Add difficulty suffix based on level
        difficulty_suffix = ""
        if difficulty == "advanced":
            difficulty_suffix = " (Advanced)"
        elif difficulty == "easy":
            difficulty_suffix = " (Easy)"
        
        mock_questions.append(
            QuizQuestion(
                q=q_template.format(topic=topic) + difficulty_suffix,
                options=[f"Option {chr(65+j)}: {opt}" for j, opt in enumerate(options_template)],
                correctIndex=1
            )
        )
    
    mock_quiz = QuizResponse(questions=mock_questions)
    
    logger.info(
        f"Generated content for: {topic[:30]}... "
        f"(Questions: {question_count}, Difficulty: {difficulty}, Focus: {focus_area})"
    )
    
    return GenerateResponse(
        summary=mock_summary,
        quiz=mock_quiz
    )
