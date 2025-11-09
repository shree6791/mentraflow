"""
Knowledge Capture Models
Data models for knowledge capture and content generation
"""

from pydantic import BaseModel
from typing import List, Optional


class KnowledgeCaptureRequest(BaseModel):
    """Request model for capturing and generating content from knowledge"""
    content: Optional[str] = None  # For paste text / file upload
    youtubeUrl: Optional[str] = None  # For YouTube link
    title: Optional[str] = None
    tags: Optional[List[str]] = []
    
    # Quiz customization options
    questionCount: Optional[int] = 5  # Default: 5 questions (max 10)
    difficulty: Optional[str] = "balanced"  # easy, balanced, advanced
    focusArea: Optional[str] = "all"  # Topic focus area


class SummaryResponse(BaseModel):
    """Response model for generated summary"""
    content: str
    keyTakeaways: List[str]
    keywords: List[str]


class QuizQuestion(BaseModel):
    """Single quiz question with options"""
    q: str
    options: List[str]
    correctIndex: int


class QuizResponse(BaseModel):
    """Response model for generated quiz"""
    questions: List[QuizQuestion]


class GenerateResponse(BaseModel):
    """Complete response for knowledge generation"""
    summary: SummaryResponse
    quiz: QuizResponse
