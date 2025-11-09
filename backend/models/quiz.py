"""
Quiz Models
Data models for quiz submission and results
"""

from pydantic import BaseModel, Field
from typing import List
from datetime import datetime, timezone


class QuizAnswer(BaseModel):
    """Single quiz answer"""
    questionIndex: int
    selectedAnswer: int
    isCorrect: bool


class QuizResultSubmit(BaseModel):
    """Request model for submitting quiz results"""
    nodeId: str
    quizId: str
    answers: List[QuizAnswer]
    score: int
    percentage: int
    totalQuestions: int


class QuizResultResponse(BaseModel):
    """Response model for quiz submission"""
    id: str = Field(default_factory=lambda: str(__import__('uuid').uuid4()))
    success: bool
    message: str
    xpGained: int
    updatedScore: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
