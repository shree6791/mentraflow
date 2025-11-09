from fastapi import APIRouter, HTTPException, Response, Request
from google.oauth2 import id_token
from google.auth.transport import requests
import os
import jwt
from datetime import datetime, timezone, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth/google", tags=["Google Auth"])

# Database will be injected
db = None

def set_database(database):
    """Set the database connection"""
    global db
    db = database

# Get credentials from environment
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_DAYS = int(os.getenv("JWT_EXPIRATION_DAYS", 7))

def create_jwt_token(user_id: str, email: str) -> str:
    """Create JWT token for user"""
    expiration = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
    
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": expiration,
        "iat": datetime.now(timezone.utc)
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

def verify_jwt_token(token: str) -> Optional[dict]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        return None
    except jwt.InvalidTokenError:
        logger.warning("Invalid token")
        return None

@router.post("/callback")
async def google_auth_callback(request: Request, response: Response):
    """
    Handle Google OAuth callback
    Receives the access token and user info from Google
    """
    try:
        data = await request.json()
        user_info = data.get("userInfo")
        
        if not user_info:
            raise HTTPException(status_code=400, detail="User info is required")
        
        # Extract user information
        google_id = user_info.get("sub")
        email = user_info.get("email")
        name = user_info.get("name")
        picture = user_info.get("picture")
        
        if not google_id or not email:
            raise HTTPException(status_code=400, detail="Missing required user information")
        
        # Check if user exists in database
        existing_user = await db.users.find_one({"email": email})
        
        if existing_user:
            user_id = existing_user["_id"]
            # Update last login
            await db.users.update_one(
                {"_id": user_id},
                {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
            )
            logger.info(f"User logged in: {email}")
        else:
            # Create new user
            import uuid
            user_id = str(uuid.uuid4())
            
            now = datetime.now(timezone.utc).isoformat()
            user_doc = {
                "_id": user_id,
                "google_id": google_id,
                "email": email,
                "name": name,
                "picture": picture,
                "created_at": now,
                "last_login": now
            }
            
            await db.users.insert_one(user_doc)
            logger.info(f"New user created: {email}")
        
        # Create JWT token
        jwt_token = create_jwt_token(user_id, email)
        
        # Store session in database for tracking (optional but useful)
        now = datetime.now(timezone.utc)
        session_doc = {
            "user_id": user_id,
            "session_token": jwt_token,
            "expires_at": (now + timedelta(days=JWT_EXPIRATION_DAYS)).isoformat(),
            "created_at": now.isoformat()
        }
        await db.user_sessions.insert_one(session_doc)
        
        # Set httpOnly cookie with JWT token
        response.set_cookie(
            key="session_token",
            value=jwt_token,
            httponly=True,
            secure=True,  # Always use HTTPS
            samesite="none",  # Allow cross-site cookies
            max_age=JWT_EXPIRATION_DAYS * 24 * 60 * 60,
            path="/"
        )
        
        return {
            "success": True,
            "user": {
                "id": user_id,
                "email": email,
                "name": name,
                "picture": picture
            },
            "token": jwt_token  # Also return token for localStorage backup
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"Error in Google auth callback: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")

@router.get("/verify")
async def verify_token(request: Request):
    """Verify JWT token and return user info"""
    # Try to get token from cookie
    token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Verify token
    payload = verify_jwt_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Get user from database
    user_doc = await db.users.find_one({"_id": payload["user_id"]})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user_doc["_id"],
        "email": user_doc["email"],
        "name": user_doc["name"],
        "picture": user_doc.get("picture")
    }
