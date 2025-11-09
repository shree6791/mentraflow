"""
MCP (Memory Control Protocol) Routes
Receives chat exports from Claude, Perplexity, and other AI platforms
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mcp", tags=["MCP"])


# ============================================
# Request Models
# ============================================

class ChatMessage(BaseModel):
    """Single chat message"""
    role: str = Field(..., description="Role: user, assistant, system")
    content: str = Field(..., description="Message content")
    timestamp: Optional[str] = Field(None, description="Message timestamp")


class ChatConversation(BaseModel):
    """Complete conversation thread"""
    conversation_id: str = Field(..., description="Unique conversation ID")
    title: Optional[str] = Field(None, description="Conversation title")
    platform: str = Field(..., description="Source platform: claude, perplexity, chatgpt")
    messages: List[ChatMessage] = Field(..., description="List of messages in conversation")
    created_at: Optional[str] = Field(None, description="Conversation creation time")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")


class MCPExportRequest(BaseModel):
    """MCP export request from AI platforms"""
    user_id: str = Field(..., description="MentraFlow user ID")
    conversations: List[ChatConversation] = Field(..., description="List of conversations to import")
    export_timestamp: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())


class MCPExportResponse(BaseModel):
    """Response after processing MCP export"""
    success: bool
    message: str
    concepts_extracted: int
    quizzes_generated: int
    knowledge_nodes_created: int
    processing_time_seconds: float
    import_id: str


# ============================================
# MCP Endpoints
# ============================================

@router.post("/receive-export", response_model=MCPExportResponse)
async def receive_export(
    export_data: MCPExportRequest,
    background_tasks: BackgroundTasks
):
    """
    Receive chat export from AI platforms (Claude, Perplexity, etc.)
    
    Flow:
    1. Validate incoming data
    2. Process latest 5-10 conversations
    3. Summarize with LLM
    4. Extract key concepts
    5. Generate quiz questions
    6. Create knowledge graph nodes
    7. Return success response
    
    This endpoint is called when user clicks "Export to MentraFlow" in AI platforms
    """
    start_time = datetime.utcnow()
    
    try:
        logger.info(f"Received MCP export from user: {export_data.user_id}, platform: {export_data.conversations[0].platform if export_data.conversations else 'unknown'}")
        
        # Validate data
        if not export_data.conversations:
            raise HTTPException(status_code=400, detail="No conversations provided")
        
        # Limit to latest 10 conversations
        conversations_to_process = export_data.conversations[:10]
        
        logger.info(f"Processing {len(conversations_to_process)} conversations")
        
        # Process in background to avoid timeout
        background_tasks.add_task(
            process_mcp_export,
            export_data.user_id,
            conversations_to_process
        )
        
        # Calculate processing time
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        # Generate import ID
        import_id = f"mcp_{export_data.user_id}_{int(datetime.utcnow().timestamp())}"
        
        # Return immediate response
        return MCPExportResponse(
            success=True,
            message=f"Processing {len(conversations_to_process)} conversations. You'll be notified when complete.",
            concepts_extracted=0,  # Will be updated in background
            quizzes_generated=0,
            knowledge_nodes_created=0,
            processing_time_seconds=processing_time,
            import_id=import_id
        )
        
    except Exception as e:
        logger.error(f"Error processing MCP export: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process export: {str(e)}")


@router.get("/status/{import_id}")
async def get_import_status(import_id: str):
    """
    Get status of MCP import processing
    
    Returns:
    - status: processing, completed, failed
    - progress: percentage complete
    - concepts_extracted: number
    - quizzes_generated: number
    """
    # TODO: Implement status tracking
    return {
        "import_id": import_id,
        "status": "processing",
        "progress": 50,
        "concepts_extracted": 0,
        "quizzes_generated": 0
    }


@router.get("/history")
async def get_mcp_import_history(user_id: str, limit: int = 10):
    """
    Get user's MCP import history
    
    Returns list of past imports with:
    - timestamp
    - platform
    - concepts extracted
    - quizzes generated
    """
    from db.mcp_data import get_user_mcp_history
    
    imports = get_user_mcp_history(user_id, limit)
    
    return {
        "user_id": user_id,
        "imports": imports,
        "total": len(imports)
    }


@router.get("/settings")
async def get_mcp_settings(user_id: str):
    """
    Get user's MCP settings and connection info
    
    Returns:
    - mcp_endpoint_url: URL to configure in AI platforms
    - enabled_platforms: list of enabled platforms
    - auto_quiz_generation: boolean
    - summarization_model: which LLM to use
    """
    # Get the MCP endpoint URL
    # In production, this would be from environment variable
    mcp_endpoint = "https://brain-vault-3.preview.emergentagent.com/api/mcp/receive-export"
    
    return {
        "user_id": user_id,
        "mcp_endpoint_url": mcp_endpoint,
        "enabled_platforms": ["claude", "perplexity"],
        "auto_quiz_generation": True,
        "summarization_model": "gpt-5",
        "max_conversations_per_export": 10
    }


# ============================================
# Background Processing
# ============================================

async def process_mcp_export(user_id: str, conversations: List[ChatConversation]):
    """
    Background task to process MCP export
    
    Steps:
    1. Summarize conversations with LLM
    2. Extract key concepts
    3. Generate quiz questions
    4. Create knowledge graph nodes
    5. Store results
    6. Notify user
    """
    try:
        logger.info(f"Starting background processing for user {user_id}")
        
        # Import here to avoid circular imports
        from services.mcp_processor import MCPProcessor
        
        processor = MCPProcessor()
        
        # Process each conversation
        for conv in conversations:
            await processor.process_conversation(user_id, conv)
        
        logger.info(f"Completed processing {len(conversations)} conversations for user {user_id}")
        
    except Exception as e:
        logger.error(f"Error in background processing: {str(e)}")
        # TODO: Store error for user to see
