"""
Health Check Models
Data models for health monitoring and status checks
"""

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone


class StatusCheck(BaseModel):
    """Status check model with timestamp"""
    id: str = Field(default_factory=lambda: str(__import__('uuid').uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field


class StatusCheckCreate(BaseModel):
    """Request model for creating status check"""
    client_name: str
