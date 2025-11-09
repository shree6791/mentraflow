from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional

class User(BaseModel):
    id: str = Field(alias="_id")
    email: str
    name: str
    picture: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        populate_by_name = True

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionData(BaseModel):
    id: str
    email: str
    name: str
    picture: str
    session_token: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: str