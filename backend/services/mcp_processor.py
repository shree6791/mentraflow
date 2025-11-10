"""
MCP Processor Service
Handles chat summarization, concept extraction, and quiz generation
Using OpenAI SDK (industry standard, vendor-independent)
"""

import logging
import json
import os
from typing import List, Dict, Any
from datetime import datetime
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class MCPProcessor:
    """Process MCP exports: summarize, extract concepts, generate quizzes"""
    
    def __init__(self):
        self.llm_model = "gpt-4o"  # Using GPT-4o (or user can change to gpt-5 when available)
        
        # Initialize OpenAI client with API key from environment
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.error("OPENAI_API_KEY not found in environment variables")
            raise ValueError("OPENAI_API_KEY must be set in .env file")
        
        self.client = AsyncOpenAI(api_key=api_key)
        logger.info(f"MCPProcessor initialized with model: {self.llm_model}")
        
    async def process_conversation(self, user_id: str, conversation: Any) -> Dict[str, Any]:
        """
        Process a single conversation:
        1. Summarize
        2. Extract concepts
        3. Generate quiz
        4. Create knowledge node
        """
        try:
            logger.info(f"Processing conversation: {conversation.conversation_id}")
            
            # Step 1: Format conversation for LLM
            formatted_chat = self._format_conversation(conversation)
            
            # Step 2: Summarize with LLM
            summary = await self._summarize_conversation(formatted_chat)
            
            # Step 3: Extract key concepts
            concepts = await self._extract_concepts(formatted_chat, summary)
            
            # Step 4: Generate quiz questions
            quiz_questions = await self._generate_quiz(concepts, formatted_chat)
            
            # Step 5: Create knowledge node
            node_id = await self._create_knowledge_node(
                user_id=user_id,
                conversation_id=conversation.conversation_id,
                platform=conversation.platform,
                summary=summary,
                concepts=concepts,
                quiz_questions=quiz_questions
            )
            
            logger.info(f"Successfully processed conversation {conversation.conversation_id}, created node {node_id}")
            
            return {
                "success": True,
                "node_id": node_id,
                "concepts_count": len(concepts),
                "quiz_questions_count": len(quiz_questions)
            }
            
        except Exception as e:
            logger.error(f"Error processing conversation: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _format_conversation(self, conversation: Any) -> str:
        """
        Format conversation messages for LLM processing with intelligent truncation
        
        Handles long conversations by:
        - Keeping first 20 messages (context)
        - Keeping last 30 messages (recent content)
        - Summarizing middle if conversation is too long
        """
        messages = conversation.messages
        total_messages = len(messages)
        
        formatted = f"Conversation from {conversation.platform}\n\n"
        
        if conversation.title:
            formatted += f"Title: {conversation.title}\n\n"
        
        formatted += "Messages:\n"
        
        # Small conversations: use all messages
        if total_messages <= 50:
            for msg in messages:
                formatted += f"{msg.role.upper()}: {msg.content}\n\n"
            logger.info(f"Formatted {total_messages} messages (all included)")
        
        # Medium conversations: keep first 20 + last 30
        elif total_messages <= 100:
            # First 20 messages
            for msg in messages[:20]:
                formatted += f"{msg.role.upper()}: {msg.content}\n\n"
            
            # Note about truncation
            skipped = total_messages - 50
            formatted += f"\n[... {skipped} messages in the middle were summarized for processing ...]\n\n"
            
            # Last 30 messages
            for msg in messages[-30:]:
                formatted += f"{msg.role.upper()}: {msg.content}\n\n"
            
            logger.info(f"Formatted {total_messages} messages (kept first 20 + last 30, skipped {skipped})")
        
        # Very long conversations: aggressive truncation
        else:
            # First 15 messages
            for msg in messages[:15]:
                formatted += f"{msg.role.upper()}: {msg.content}\n\n"
            
            formatted += f"\n[... This conversation has {total_messages} messages total. For processing efficiency, showing first 15 and last 25 messages ...]\n\n"
            
            # Last 25 messages
            for msg in messages[-25:]:
                formatted += f"{msg.role.upper()}: {msg.content}\n\n"
            
            logger.warning(f"Very long conversation: {total_messages} messages. Truncated to 40 messages for processing.")
        
        return formatted
    
    def _estimate_tokens(self, text: str) -> int:
        """Rough token estimation (1 token ≈ 4 characters)"""
        return len(text) // 4
    
    async def _summarize_conversation(self, conversation_text: str) -> str:
        """
        Summarize conversation using OpenAI API
        
        Prompt engineering to extract:
        - Main topics discussed
        - Key insights gained
        - Important questions asked
        - Actionable takeaways
        
        Handles token limits gracefully
        """
        try:
            estimated_tokens = self._estimate_tokens(conversation_text)
            logger.info(f"Starting conversation summarization... (estimated tokens: {estimated_tokens})")
            
            # If estimated tokens exceed safe limit, truncate further
            if estimated_tokens > 6000:
                logger.warning(f"Conversation very long ({estimated_tokens} tokens). Truncating to last 5000 characters.")
                conversation_text = conversation_text[-5000:]
                estimated_tokens = self._estimate_tokens(conversation_text)
            
            response = await self.client.chat.completions.create(
                model=self.llm_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at analyzing conversations and extracting key information. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": f"""Analyze this AI conversation and provide a comprehensive summary.

Conversation:
{conversation_text}

Please provide:
1. Main Topics: What was discussed? (array of strings)
2. Key Insights: What did the user learn? (array of strings)
3. Important Questions: What questions were explored? (array of strings)
4. Actionable Takeaways: What can the user apply? (array of strings)

Format your response as valid JSON with these keys: main_topics, key_insights, questions, takeaways
Each should be an array of strings (2-5 items each)."""
                    }
                ],
                temperature=0.3,
                max_tokens=1000,
                response_format={"type": "json_object"}
            )
            
            summary_json = response.choices[0].message.content
            logger.info(f"Summary generated successfully: {len(summary_json)} chars")
            
            return summary_json
            
        except Exception as e:
            logger.error(f"Error summarizing conversation: {str(e)}")
            # Fallback: basic extraction
            return self._basic_summary(conversation_text)
    
    def _basic_summary(self, conversation_text: str) -> str:
        """Fallback basic summary if LLM fails"""
        lines = conversation_text.split('\n')
        topics = []
        
        # Extract user questions as topics
        for line in lines:
            if line.startswith('USER:'):
                question = line.replace('USER:', '').strip()
                if len(question) > 10 and '?' in question:
                    topics.append(question)
        
        return json.dumps({
            "main_topics": topics[:3],
            "key_insights": ["Summary unavailable - using basic extraction"],
            "questions": topics,
            "takeaways": []
        })
    
    async def _extract_concepts(self, conversation_text: str, summary: str) -> List[str]:
        """
        Extract key concepts/learnings from conversation
        Returns list of concept strings
        """
        try:
            logger.info("Extracting concepts from conversation...")
            
            response = await self.client.chat.completions.create(
                model=self.llm_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at extracting key concepts from conversations. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": f"""Extract 3-5 key concepts or learnings from this conversation summary.

Summary:
{summary}

Requirements for each concept:
- A single, clear idea or learning
- Suitable for creating a quiz question
- 5-15 words long
- Specific and actionable

Example format: {{"concepts": ["Python decorators modify function behavior", "REST APIs use HTTP methods", "Database indexing improves query performance"]}}

Return as JSON with a 'concepts' array."""
                    }
                ],
                temperature=0.5,
                max_tokens=300,
                response_format={"type": "json_object"}
            )
            
            # Parse JSON response
            concepts_json = response.choices[0].message.content
            concepts_data = json.loads(concepts_json)
            concepts = concepts_data.get("concepts", [])
            
            logger.info(f"Extracted {len(concepts)} concepts")
            
            return concepts if isinstance(concepts, list) and len(concepts) > 0 else ["General conversation insights"]
            
        except Exception as e:
            logger.error(f"Error extracting concepts: {str(e)}")
            # Fallback to simple extraction
            return ["Conversation about AI and knowledge management"]
    
    async def _generate_quiz(self, concepts: List[str], conversation_text: str) -> List[Dict[str, Any]]:
        """
        Generate quiz questions from concepts
        Returns list of quiz question objects
        """
        try:
            logger.info(f"Generating quiz from {len(concepts)} concepts...")
            
            concepts_str = "\n".join([f"{i+1}. {concept}" for i, concept in enumerate(concepts)])
            
            response = await self.client.chat.completions.create(
                model=self.llm_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert quiz creator. Always respond with valid JSON only. Create challenging but fair questions."
                    },
                    {
                        "role": "user",
                        "content": f"""Create 3-5 multiple choice quiz questions based on these concepts:

{concepts_str}

For each question, provide:
- question: Clear, testable question (not too easy, not too hard)
- options: Object with 4 answer choices (keys: A, B, C, D)
- correct: Letter of correct answer (A, B, C, or D)
- explanation: Brief explanation of why the answer is correct

Return as JSON with a 'questions' array.

Example format:
{{
  "questions": [
    {{
      "question": "What is the primary purpose of Python decorators?",
      "options": {{
        "A": "To delete functions",
        "B": "To modify or enhance function behavior",
        "C": "To create classes",
        "D": "To import modules"
      }},
      "correct": "B",
      "explanation": "Decorators are used to modify or enhance the behavior of functions without changing their code."
    }}
  ]
}}"""
                    }
                ],
                temperature=0.7,
                max_tokens=1500,
                response_format={"type": "json_object"}
            )
            
            # Parse JSON response
            quiz_json = response.choices[0].message.content
            quiz_data = json.loads(quiz_json)
            questions = quiz_data.get("questions", [])
            
            logger.info(f"Generated {len(questions)} quiz questions")
            
            return questions if isinstance(questions, list) and len(questions) > 0 else self._create_simple_quiz(concepts)
            
        except Exception as e:
            logger.error(f"Error generating quiz: {str(e)}")
            # Fallback: create simple questions from concepts
            return self._create_simple_quiz(concepts)
    
    def _create_simple_quiz(self, concepts: List[str]) -> List[Dict[str, Any]]:
        """Fallback quiz generation if LLM fails"""
        questions = []
        
        for i, concept in enumerate(concepts[:3]):
            questions.append({
                "question": f"What did you learn about: {concept}?",
                "options": {
                    "A": "Option A",
                    "B": "Option B",
                    "C": "Option C",
                    "D": "Option D"
                },
                "correct": "A",
                "explanation": f"This question is about: {concept}"
            })
        
        return questions
    
    async def _create_knowledge_node(
        self,
        user_id: str,
        conversation_id: str,
        platform: str,
        summary: str,
        concepts: List[str],
        quiz_questions: List[Dict[str, Any]]
    ) -> str:
        """
        Create knowledge graph nodes from processed conversation
        
        Phase 3: Full integration with knowledge graph
        - Creates concepts in MCP collections
        - Creates knowledge nodes
        - Links to existing graph
        - Schedules recall sessions
        
        Returns summary node_id
        """
        from db.mcp_data import create_mcp_concept, create_mcp_quiz, link_concept_to_node
        from db.connection import get_database
        from services.knowledge_integration import KnowledgeIntegrationService
        
        db = get_database()
        integration_service = KnowledgeIntegrationService(db)
        
        node_ids = []
        
        # Store each concept and integrate with knowledge graph
        for i, concept_text in enumerate(concepts):
            # Create MCP concept record
            concept = await create_mcp_concept(
                import_id=f"import_{user_id}_{conversation_id[:8]}",
                user_id=user_id,
                conversation_id=conversation_id,
                concept_text=concept_text,
                platform=platform,
                summary=summary
            )
            
            logger.info(f"Created concept: {concept['concept_id']} - {concept_text[:50]}...")
            
            # Create corresponding quiz for this concept (if available)
            quiz_id = None
            summary_id = None
            
            if i < len(quiz_questions):
                # Create quiz with just this concept's questions (1 question per concept)
                concept_quiz = await create_mcp_quiz(
                    concept_id=concept["concept_id"],
                    user_id=user_id,
                    questions=[quiz_questions[i]] if i < len(quiz_questions) else []
                )
                quiz_id = concept_quiz["quiz_id"]
                logger.info(f"Created quiz: {quiz_id} for concept")
            
            # Create a summary ID for this concept (using concept_id as summary_id)
            summary_id = f"summary_{concept['concept_id']}"
            
            # ✅ PHASE 3: Full Knowledge Integration
            integration_result = await integration_service.integrate_concept(
                user_id=user_id,
                concept_id=concept["concept_id"],
                concept_text=concept_text,
                quiz_id=quiz_id or f"quiz_{concept['concept_id']}",
                summary_id=summary_id,
                source_platform=platform,
                conversation_id=conversation_id
            )
            
            if integration_result["success"]:
                node = integration_result["node"]
                connections = integration_result["connections"]
                recall_session = integration_result["recall_session"]
                
                node_ids.append(node["id"])
                
                # Link concept to node in MCP database
                await link_concept_to_node(concept["concept_id"], node["id"])
                
                logger.info(f"✅ Integrated: node={node['id']}, connections={len(connections)}, recall={recall_session['id']}")
            else:
                logger.error(f"❌ Integration failed: {integration_result.get('error')}")
        
        summary_node_id = f"mcp_{platform}_{conversation_id[:8]}"
        logger.info(f"Created {len(node_ids)} knowledge nodes with full integration")
        
        return summary_node_id
