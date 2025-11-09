"""
Custom validators for route-specific validation
"""

from fastapi import HTTPException
from typing import List


class QuizValidator:
    """Validation for quiz submissions"""
    
    @staticmethod
    def validate_answers(answers: List, total_questions: int):
        """Validate quiz answers"""
        if len(answers) != total_questions:
            raise HTTPException(
                status_code=400,
                detail=f"Answer count mismatch. Expected {total_questions}, got {len(answers)}"
            )
        
        # Validate each answer
        for idx, answer in enumerate(answers):
            if answer.questionIndex != idx:
                raise HTTPException(
                    status_code=400,
                    detail=f"Question index mismatch at position {idx}"
                )
            
            if not isinstance(answer.selectedAnswer, int):
                raise HTTPException(
                    status_code=400,
                    detail=f"Selected answer must be an integer at question {idx}"
                )
    
    @staticmethod
    def validate_score(score: int, percentage: int, total_questions: int):
        """Validate score calculation"""
        expected_percentage = round((score / total_questions) * 100) if total_questions > 0 else 0
        
        if abs(percentage - expected_percentage) > 1:  # Allow 1% tolerance for rounding
            raise HTTPException(
                status_code=400,
                detail=f"Score calculation error. Expected ~{expected_percentage}%, got {percentage}%"
            )
        
        if score > total_questions:
            raise HTTPException(
                status_code=400,
                detail=f"Score cannot exceed total questions. Got {score}/{total_questions}"
            )


class NodeValidator:
    """Validation for node endpoints"""
    
    @staticmethod
    def validate_title(title: str):
        """Validate node title"""
        if not title or len(title.strip()) == 0:
            raise HTTPException(
                status_code=400,
                detail="Node title cannot be empty"
            )
        
        if len(title) > 200:
            raise HTTPException(
                status_code=400,
                detail="Node title too long (max 200 characters)"
            )
