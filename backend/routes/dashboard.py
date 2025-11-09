"""
Dashboard Routes
All endpoints used on the Dashboard page:
- Library/Documents listing
- Knowledge capture and generation
"""

from fastapi import APIRouter, HTTPException
import logging
from db.dashboard_data import DOCUMENTS
from models.knowledge import (
    KnowledgeCaptureRequest,
    SummaryResponse,
    QuizQuestion,
    QuizResponse,
    GenerateResponse
)

router = APIRouter()
logger = logging.getLogger(__name__)


# ========================================
# LIBRARY / DOCUMENTS
# ========================================

@router.get("/library")
async def get_library_items():
    """Get all documents (user's uploaded study materials)"""
    return {"items": DOCUMENTS}


# ========================================
# KNOWLEDGE CAPTURE & GENERATION
# ========================================

@router.post("/generate", response_model=GenerateResponse)
async def generate_summary_and_quiz(request: KnowledgeCaptureRequest):
    """
    Generate summary and quiz from captured knowledge
    
    Supports 3 input methods:
    1. Paste Text (content field)
    2. Upload File (content field with file content)
    3. YouTube Link (youtubeUrl field)
    
    Limits:
    - Text/File: 20-10,000 characters
    - YouTube: Max 60 minutes video duration
    
    Mock implementation that returns customized dummy content.
    In production, this would call AI services (GPT-5, Claude, etc.) and
    YouTube Transcript API for video transcripts.
    
    Customization Options:
    - questionCount: Number of quiz questions (3-10, default 5)
    - difficulty: easy, balanced, or advanced (default balanced)
    - focusArea: Topic focus area (default all)
    """
    
    # Upper limits for different input methods
    MAX_TEXT_LENGTH = 10000  # 10,000 characters
    MIN_TEXT_LENGTH = 20     # 20 characters minimum
    MAX_YOUTUBE_DURATION = 60  # 60 minutes
    
    # Validate input: must provide either content or YouTube URL
    if not request.content and not request.youtubeUrl:
        raise HTTPException(
            status_code=400,
            detail="Please provide either text content or a YouTube URL."
        )
    
    if request.content and request.youtubeUrl:
        raise HTTPException(
            status_code=400,
            detail="Please provide only one input method: either text or YouTube URL, not both."
        )
    
    # Handle different input methods
    content_text = ""
    content_source = ""
    
    if request.youtubeUrl:
        # YouTube URL provided
        logger.info(f"Processing YouTube URL: {request.youtubeUrl}")
        
        # Validate YouTube URL format
        if not ("youtube.com" in request.youtubeUrl or "youtu.be" in request.youtubeUrl):
            raise HTTPException(
                status_code=400,
                detail="Invalid YouTube URL. Please provide a valid youtube.com or youtu.be link."
            )
        
        # Mock: Extract video ID and simulate transcript extraction
        # In production, use youtube-transcript-api
        video_id = request.youtubeUrl.split("v=")[-1].split("&")[0] if "v=" in request.youtubeUrl else request.youtubeUrl.split("/")[-1]
        
        # Mock transcript (in production, fetch actual transcript)
        content_text = (
            f"[YouTube Video Transcript - Mock]\n\n"
            f"This is a simulated transcript from the YouTube video (ID: {video_id}). "
            f"In production, this would contain the actual video transcript extracted using "
            f"the YouTube Transcript API. The transcript would include all spoken content from "
            f"the video, properly formatted and timed. This allows users to generate study "
            f"materials from educational videos without manual transcription."
        )
        content_source = f"YouTube Video: {video_id}"
        
        # Mock: Check video duration (in production, use YouTube Data API)
        # For now, assume all videos are under limit
        logger.info(f"Video duration check passed (mock)")
        
    else:
        # Text content provided (paste or file upload)
        content_text = request.content.strip()
        content_source = "Text/File Upload"
        
        # Validate text length
        if len(content_text) < MIN_TEXT_LENGTH:
            raise HTTPException(
                status_code=400,
                detail=f"Content too short. Please provide at least {MIN_TEXT_LENGTH} characters. Current: {len(content_text)}"
            )
        
        if len(content_text) > MAX_TEXT_LENGTH:
            raise HTTPException(
                status_code=400,
                detail=f"Content too long. Maximum {MAX_TEXT_LENGTH} characters allowed. Current: {len(content_text)}"
            )
    
    # Mock: Extract topic from content (first few words) or use title
    topic = request.title if request.title else content_text[:50].strip()
    
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
        f"(Source: {content_source}, Questions: {question_count}, Difficulty: {difficulty}, Focus: {focus_area})"
    )
    
    return GenerateResponse(
        summary=mock_summary,
        quiz=mock_quiz
    )
