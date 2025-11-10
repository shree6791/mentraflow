"""
MCP Data Storage
MongoDB collections for MCP imports, concepts, and quizzes
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
import uuid
from db.connection import get_database

# Get MongoDB database
db = get_database()

# MongoDB Collections
mcp_imports_collection = db['mcp_imports']
mcp_concepts_collection = db['mcp_concepts']
mcp_quizzes_collection = db['mcp_quizzes']


async def create_mcp_import(user_id: str, platform: str, conversation_count: int) -> Dict[str, Any]:
    """
    Create a new MCP import record in MongoDB
    
    Returns import object with ID
    """
    import_record = {
        "import_id": f"mcp_{platform}_{uuid.uuid4().hex[:8]}",
        "user_id": user_id,
        "platform": platform,
        "conversation_count": conversation_count,
        "concepts_extracted": 0,
        "quizzes_generated": 0,
        "nodes_created": 0,
        "status": "processing",
        "created_at": datetime.utcnow().isoformat(),
        "completed_at": None,
        "error": None
    }
    
    await mcp_imports_collection.insert_one(import_record)
    return import_record


async def update_mcp_import(import_id: str, **updates) -> bool:
    """
    Update an MCP import record in MongoDB
    
    Args:
        import_id: Import ID
        **updates: Fields to update
    
    Returns:
        True if updated, False if not found
    """
    result = await mcp_imports_collection.update_one(
        {"import_id": import_id},
        {"$set": updates}
    )
    return result.modified_count > 0


async def get_mcp_import(import_id: str) -> Optional[Dict[str, Any]]:
    """Get import by ID from MongoDB"""
    import_record = await mcp_imports_collection.find_one({"import_id": import_id})
    if import_record:
        import_record.pop('_id', None)  # Remove MongoDB _id
    return import_record


async def get_user_mcp_history(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Get user's MCP import history from MongoDB
    
    Args:
        user_id: User ID
        limit: Max records to return
    
    Returns:
        List of import records, newest first
    """
    cursor = mcp_imports_collection.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(limit)
    
    user_imports = await cursor.to_list(length=limit)
    
    # Remove MongoDB _id field
    for imp in user_imports:
        imp.pop('_id', None)
    
    return user_imports


def create_mcp_concept(
    import_id: str,
    user_id: str,
    conversation_id: str,
    concept_text: str,
    platform: str,
    summary: str
) -> Dict[str, Any]:
    """
    Create a concept extracted from MCP conversation
    
    Returns concept object
    """
    concept = {
        "concept_id": f"concept_{uuid.uuid4().hex[:12]}",
        "import_id": import_id,
        "user_id": user_id,
        "conversation_id": conversation_id,
        "platform": platform,
        "concept_text": concept_text,
        "summary": summary,
        "created_at": datetime.utcnow().isoformat(),
        "quiz_generated": False,
        "node_created": False,
        "node_id": None
    }
    
    MCP_CONCEPTS.append(concept)
    return concept


def create_mcp_quiz(
    concept_id: str,
    user_id: str,
    questions: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Create quiz from MCP concept
    
    Returns quiz object
    """
    quiz = {
        "quiz_id": f"quiz_{uuid.uuid4().hex[:12]}",
        "concept_id": concept_id,
        "user_id": user_id,
        "questions": questions,
        "created_at": datetime.utcnow().isoformat(),
        "times_taken": 0,
        "average_score": 0,
        "last_taken": None
    }
    
    MCP_QUIZZES.append(quiz)
    return quiz


def get_user_mcp_concepts(user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Get all concepts for a user"""
    user_concepts = [c for c in MCP_CONCEPTS if c["user_id"] == user_id]
    user_concepts.sort(key=lambda x: x["created_at"], reverse=True)
    return user_concepts[:limit]


def get_concept_quiz(concept_id: str) -> Optional[Dict[str, Any]]:
    """Get quiz for a concept"""
    for quiz in MCP_QUIZZES:
        if quiz["concept_id"] == concept_id:
            return quiz
    return None


def get_user_mcp_quizzes(user_id: str) -> List[Dict[str, Any]]:
    """Get all MCP quizzes for a user"""
    return [q for q in MCP_QUIZZES if q["user_id"] == user_id]


def link_concept_to_node(concept_id: str, node_id: str) -> bool:
    """Link MCP concept to knowledge graph node"""
    for concept in MCP_CONCEPTS:
        if concept["concept_id"] == concept_id:
            concept["node_created"] = True
            concept["node_id"] = node_id
            return True
    return False


# Statistics functions
def get_mcp_stats(user_id: str) -> Dict[str, Any]:
    """Get MCP statistics for user"""
    user_imports = [imp for imp in MCP_IMPORTS if imp["user_id"] == user_id]
    user_concepts = [c for c in MCP_CONCEPTS if c["user_id"] == user_id]
    user_quizzes = [q for q in MCP_QUIZZES if q["user_id"] == user_id]
    
    return {
        "total_imports": len(user_imports),
        "total_concepts": len(user_concepts),
        "total_quizzes": len(user_quizzes),
        "concepts_from_claude": len([c for c in user_concepts if c["platform"] == "claude"]),
        "concepts_from_perplexity": len([c for c in user_concepts if c["platform"] == "perplexity"]),
        "latest_import": user_imports[0]["created_at"] if user_imports else None
    }
