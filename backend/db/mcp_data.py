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


async def create_mcp_concept(
    import_id: str,
    user_id: str,
    conversation_id: str,
    concept_text: str,
    platform: str,
    summary: str
) -> Dict[str, Any]:
    """
    Create a concept extracted from MCP conversation in MongoDB
    
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
    
    await mcp_concepts_collection.insert_one(concept)
    return concept


async def create_mcp_quiz(
    concept_id: str,
    user_id: str,
    questions: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Create quiz from MCP concept in MongoDB
    
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
    
    await mcp_quizzes_collection.insert_one(quiz)
    return quiz


async def get_user_mcp_concepts(user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Get all concepts for a user from MongoDB"""
    cursor = mcp_concepts_collection.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(limit)
    
    user_concepts = await cursor.to_list(length=limit)
    
    # Remove MongoDB _id field
    for concept in user_concepts:
        concept.pop('_id', None)
    
    return user_concepts


async def get_concept_quiz(concept_id: str) -> Optional[Dict[str, Any]]:
    """Get quiz for a concept from MongoDB"""
    quiz = await mcp_quizzes_collection.find_one({"concept_id": concept_id})
    if quiz:
        quiz.pop('_id', None)
    return quiz


async def get_user_mcp_quizzes(user_id: str) -> List[Dict[str, Any]]:
    """Get all MCP quizzes for a user from MongoDB"""
    cursor = mcp_quizzes_collection.find({"user_id": user_id})
    quizzes = await cursor.to_list(length=100)
    
    # Remove MongoDB _id field
    for quiz in quizzes:
        quiz.pop('_id', None)
    
    return quizzes


async def link_concept_to_node(concept_id: str, node_id: str) -> bool:
    """Link MCP concept to knowledge graph node in MongoDB"""
    result = await mcp_concepts_collection.update_one(
        {"concept_id": concept_id},
        {"$set": {"node_created": True, "node_id": node_id}}
    )
    return result.modified_count > 0


# Statistics functions
async def get_mcp_stats(user_id: str) -> Dict[str, Any]:
    """Get MCP statistics for user from MongoDB"""
    total_imports = await mcp_imports_collection.count_documents({"user_id": user_id})
    total_concepts = await mcp_concepts_collection.count_documents({"user_id": user_id})
    total_quizzes = await mcp_quizzes_collection.count_documents({"user_id": user_id})
    
    concepts_from_claude = await mcp_concepts_collection.count_documents({
        "user_id": user_id,
        "platform": "claude"
    })
    
    concepts_from_perplexity = await mcp_concepts_collection.count_documents({
        "user_id": user_id,
        "platform": "perplexity"
    })
    
    latest_import = await mcp_imports_collection.find_one(
        {"user_id": user_id},
        sort=[("created_at", -1)]
    )
    
    return {
        "total_imports": total_imports,
        "total_concepts": total_concepts,
        "total_quizzes": total_quizzes,
        "concepts_from_claude": concepts_from_claude,
        "concepts_from_perplexity": concepts_from_perplexity,
        "latest_import": latest_import["created_at"] if latest_import else None
    }
