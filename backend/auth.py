from fastapi import APIRouter, HTTPException, Response, Request, Cookie
from typing import Optional
import httpx
from datetime import datetime, timezone, timedelta
from models import User, UserSession, SessionData, UserResponse
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging

logger = logging.getLogger(__name__)

# Database will be injected from server.py
db = None

def set_database(database):
    """Set the database connection for auth module"""
    global db
    db = database

auth_router = APIRouter(prefix="/auth", tags=["auth"])

EMERGENT_SESSION_API = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

# Helper function to get user from session
async def get_user_from_session(session_token: str) -> Optional[User]:
    """Get user from session token (checks cookie first, then Authorization header)"""
    if not session_token:
        return None
    
    try:
        # Find session in database
        session = await db.user_sessions.find_one({"session_token": session_token})
        if not session:
            logger.warning(f"Session not found for token: {session_token[:10]}...")
            return None
        
        # Check if session expired
        if session["expires_at"] < datetime.now(timezone.utc):
            logger.warning(f"Session expired for token: {session_token[:10]}...")
            await db.user_sessions.delete_one({"session_token": session_token})
            return None
        
        # Get user
        user_doc = await db.users.find_one({"_id": session["user_id"]})
        if not user_doc:
            logger.warning(f"User not found for session: {session['user_id']}")
            return None
        
        # Map MongoDB _id to Pydantic id
        user_doc["id"] = user_doc.pop("_id")
        return User(**user_doc)
    except Exception as e:
        logger.error(f"Error getting user from session: {str(e)}")
        return None

@auth_router.post("/process-session")
async def process_session(request: Request, response: Response):
    """Process session_id from Emergent OAuth and create local session"""
    try:
        data = await request.json()
        session_id = data.get("session_id")
        
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id is required")
        
        # Call Emergent API to get session data
        async with httpx.AsyncClient() as http_client:
            emergent_response = await http_client.get(
                EMERGENT_SESSION_API,
                headers={"X-Session-ID": session_id},
                timeout=10.0
            )
            
            if emergent_response.status_code != 200:
                logger.error(f"Emergent API error: {emergent_response.status_code}")
                raise HTTPException(status_code=401, detail="Invalid session")
            
            session_data = SessionData(**emergent_response.json())
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": session_data.email})
        
        if not existing_user:
            # Create new user
            user_doc = {
                "_id": session_data.id,
                "email": session_data.email,
                "name": session_data.name,
                "picture": session_data.picture,
                "created_at": datetime.now(timezone.utc)
            }
            await db.users.insert_one(user_doc)
            user_id = session_data.id
            logger.info(f"Created new user: {session_data.email}")
        else:
            user_id = existing_user["_id"]
            logger.info(f"User already exists: {session_data.email}")
        
        # Create session
        session_doc = {
            "user_id": user_id,
            "session_token": session_data.session_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
            "created_at": datetime.now(timezone.utc)
        }
        await db.user_sessions.insert_one(session_doc)
        
        # Set httpOnly cookie
        response.set_cookie(
            key="session_token",
            value=session_data.session_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=7 * 24 * 60 * 60,  # 7 days
            path="/"
        )
        
        logger.info(f"Session created for user: {session_data.email}")
        
        return {
            "success": True,
            "user": {
                "id": user_id,
                "email": session_data.email,
                "name": session_data.name,
                "picture": session_data.picture
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process session")

@auth_router.get("/me", response_model=UserResponse)
async def get_current_user(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get current authenticated user"""
    # Try cookie first
    token = session_token
    
    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await get_user_from_session(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        picture=user.picture
    )

@auth_router.post("/logout")
async def logout(
    response: Response,
    session_token: Optional[str] = Cookie(None)
):
    """Logout user and clear session"""
    if session_token:
        # Delete session from database
        await db.user_sessions.delete_one({"session_token": session_token})
    
    # Clear cookie
    response.delete_cookie(key="session_token", path="/")
    
    return {"success": True, "message": "Logged out successfully"}
