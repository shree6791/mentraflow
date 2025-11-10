"""
Knowledge Integration Service
Connects MCP concepts to knowledge graph and schedules recall sessions
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import uuid

logger = logging.getLogger(__name__)


class KnowledgeIntegrationService:
    """
    Service to integrate MCP concepts into the main knowledge graph
    
    Responsibilities:
    1. Create knowledge nodes from MCP concepts
    2. Link new nodes to existing graph
    3. Schedule spaced repetition recall sessions
    """
    
    def __init__(self, db):
        """
        Initialize with database connection
        
        Args:
            db: MongoDB database instance
        """
        self.db = db
        self.nodes_collection = db['knowledge_nodes']
        self.documents_collection = db['documents']
        self.recall_sessions_collection = db['recall_sessions']
        
    async def create_node_from_concept(
        self,
        user_id: str,
        concept_id: str,
        concept_text: str,
        quiz_id: str,
        summary_id: str,
        source_platform: str = "mcp",
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a knowledge graph node from an MCP concept
        
        Args:
            user_id: User ID
            concept_id: MCP concept ID
            concept_text: The concept text (becomes node title)
            quiz_id: ID of associated quiz
            summary_id: ID of associated summary
            source_platform: Source platform (claude, perplexity, etc.)
            conversation_id: Original conversation ID
            
        Returns:
            Created node document
        """
        try:
            logger.info(f"Creating knowledge node from concept: {concept_text[:50]}...")
            
            # Generate node ID
            node_id = f"mcp_{uuid.uuid4().hex[:8]}"
            
            # Create node document
            node = {
                "id": node_id,
                "title": concept_text[:100],  # Use concept as title (truncate if needed)
                "user_id": user_id,
                "state": "new",  # New concepts start as "new"
                "lastReview": None,
                "score": 0,  # Initial score
                "connections": [],  # Will be populated by linking
                "docId": None,  # MCP concepts may not have docs
                "quizzesTaken": 0,
                "quizId": quiz_id,
                "summaryId": summary_id,
                
                # MCP-specific metadata
                "source": "mcp",
                "source_platform": source_platform,
                "source_concept_id": concept_id,
                "source_conversation_id": conversation_id,
                
                # Timestamps
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Insert into database
            result = await self.nodes_collection.insert_one(node)
            node['_id'] = str(result.inserted_id)
            
            logger.info(f"Created node: {node_id} for user {user_id}")
            
            return node
            
        except Exception as e:
            logger.error(f"Error creating node from concept: {str(e)}")
            raise
    
    async def link_node_to_graph(
        self,
        node_id: str,
        user_id: str,
        concept_text: str
    ) -> List[str]:
        """
        Link a new node to existing nodes in the knowledge graph
        
        Uses semantic similarity (keywords/topics) to find related nodes
        
        Args:
            node_id: ID of new node to link
            user_id: User ID
            concept_text: Concept text to match against existing nodes
            
        Returns:
            List of connected node IDs
        """
        try:
            logger.info(f"Finding connections for node: {node_id}")
            
            # Get user's existing nodes
            existing_nodes = await self.nodes_collection.find({
                "user_id": user_id,
                "id": {"$ne": node_id}  # Exclude the new node itself
            }).to_list(length=100)
            
            if not existing_nodes:
                logger.info("No existing nodes to connect to")
                return []
            
            # Simple keyword-based matching
            # Extract keywords from concept text (simple approach)
            concept_keywords = set(
                word.lower() 
                for word in concept_text.split() 
                if len(word) > 4  # Only words longer than 4 chars
            )
            
            # Find nodes with similar keywords
            connections = []
            for node in existing_nodes:
                node_title_keywords = set(
                    word.lower() 
                    for word in node['title'].split() 
                    if len(word) > 4
                )
                
                # Calculate overlap
                overlap = concept_keywords & node_title_keywords
                
                # If there's keyword overlap, create connection
                if len(overlap) > 0:
                    connections.append(node['id'])
                    logger.info(f"Connected to: {node['title']} (overlap: {overlap})")
                
                # Limit to max 5 connections
                if len(connections) >= 5:
                    break
            
            # Update the new node with connections
            if connections:
                await self.nodes_collection.update_one(
                    {"id": node_id},
                    {"$set": {"connections": connections}}
                )
                
                # Also add bidirectional connections (update existing nodes)
                for connected_id in connections:
                    await self.nodes_collection.update_one(
                        {"id": connected_id},
                        {"$addToSet": {"connections": node_id}}
                    )
            
            logger.info(f"Linked node {node_id} to {len(connections)} existing nodes")
            
            return connections
            
        except Exception as e:
            logger.error(f"Error linking node to graph: {str(e)}")
            return []
    
    async def schedule_recall_session(
        self,
        user_id: str,
        node_id: str,
        concept_text: str
    ) -> Dict[str, Any]:
        """
        Schedule a spaced repetition recall session for a new concept
        
        Uses initial spaced repetition schedule:
        - First review: 1 day
        - Second review: 3 days
        - Third review: 7 days
        - Etc.
        
        Args:
            user_id: User ID
            node_id: Node ID
            concept_text: Concept text
            
        Returns:
            Created recall session document
        """
        try:
            logger.info(f"Scheduling recall session for node: {node_id}")
            
            # Calculate first review date (1 day from now)
            first_review_date = datetime.utcnow() + timedelta(days=1)
            
            # Create recall session
            session = {
                "id": f"recall_{uuid.uuid4().hex[:12]}",
                "user_id": user_id,
                "node_id": node_id,
                "concept_text": concept_text[:100],
                "type": "quiz",
                "status": "pending",
                "due_date": first_review_date.isoformat(),
                "interval_days": 1,  # Current interval
                "next_interval_days": 3,  # Next interval if successful
                "attempts": 0,
                "last_attempt": None,
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Insert into database
            result = await self.recall_sessions_collection.insert_one(session)
            session['_id'] = str(result.inserted_id)
            
            logger.info(f"Scheduled recall session: {session['id']} for {first_review_date.date()}")
            
            return session
            
        except Exception as e:
            logger.error(f"Error scheduling recall session: {str(e)}")
            raise
    
    async def integrate_concept(
        self,
        user_id: str,
        concept_id: str,
        concept_text: str,
        quiz_id: str,
        summary_id: str,
        source_platform: str = "mcp",
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Complete integration: create node, link to graph, schedule recall
        
        This is the main entry point for Phase 3 integration
        
        Args:
            user_id: User ID
            concept_id: MCP concept ID
            concept_text: Concept text
            quiz_id: Associated quiz ID
            summary_id: Associated summary ID
            source_platform: Source (claude, perplexity, etc.)
            conversation_id: Original conversation ID
            
        Returns:
            Integration result with node, connections, and recall session
        """
        try:
            logger.info(f"Starting full integration for concept: {concept_text[:50]}...")
            
            # Step 1: Create knowledge node
            node = await self.create_node_from_concept(
                user_id=user_id,
                concept_id=concept_id,
                concept_text=concept_text,
                quiz_id=quiz_id,
                summary_id=summary_id,
                source_platform=source_platform,
                conversation_id=conversation_id
            )
            
            # Step 2: Link to existing graph
            connections = await self.link_node_to_graph(
                node_id=node['id'],
                user_id=user_id,
                concept_text=concept_text
            )
            
            # Step 3: Schedule recall session
            recall_session = await self.schedule_recall_session(
                user_id=user_id,
                node_id=node['id'],
                concept_text=concept_text
            )
            
            logger.info(f"✅ Complete integration: node={node['id']}, connections={len(connections)}, recall={recall_session['id']}")
            
            return {
                "success": True,
                "node": node,
                "connections": connections,
                "recall_session": recall_session
            }
            
        except Exception as e:
            logger.error(f"Error in complete integration: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
