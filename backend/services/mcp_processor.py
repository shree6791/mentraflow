"""
MCP Processor Service
Handles chat summarization, concept extraction, and quiz generation
"""

import logging
import json
from typing import List, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class MCPProcessor:
    """Process MCP exports: summarize, extract concepts, generate quizzes"""
    
    def __init__(self):
        self.llm_model = "gpt-5"  # Using GPT-5 with Emergent LLM Key
        
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
        """Format conversation messages for LLM processing"""
        formatted = f"Conversation from {conversation.platform}\n\n"
        
        if conversation.title:
            formatted += f"Title: {conversation.title}\n\n"
        
        formatted += "Messages:\n"
        for msg in conversation.messages:
            formatted += f"{msg.role.upper()}: {msg.content}\n\n"
        
        return formatted
    
    async def _summarize_conversation(self, conversation_text: str) -> str:
        """
        Summarize conversation using LLM
        
        Prompt engineering to extract:
        - Main topics discussed
        - Key insights gained
        - Important questions asked
        - Actionable takeaways
        """
        try:
            # Use Emergent LLM Key integration
            from emergentintegrations import EmergentLLM
            
            llm = EmergentLLM()
            
            prompt = f"""Analyze this AI conversation and provide a comprehensive summary.

Conversation:
{conversation_text}

Please provide:
1. Main Topics: What was discussed?
2. Key Insights: What did the user learn?
3. Important Questions: What questions were explored?
4. Actionable Takeaways: What can the user apply?

Format your response as structured JSON with these keys: main_topics, key_insights, questions, takeaways"""
            
            response = await llm.generate(
                prompt=prompt,
                model="gpt-5",
                max_tokens=1000,
                temperature=0.3
            )
            
            return response.get('text', '')
            
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
            from emergentintegrations import EmergentLLM
            
            llm = EmergentLLM()
            
            prompt = f"""Extract 3-5 key concepts or learnings from this conversation.

Summary:
{summary}

Return ONLY a JSON array of concept strings. Each concept should be:
- A single, clear idea or learning
- Suitable for creating a quiz question
- 5-15 words long

Example: ["Python decorators modify function behavior", "REST APIs use HTTP methods", "Database indexing improves query performance"]

JSON array:"""
            
            response = await llm.generate(
                prompt=prompt,
                model="gpt-5",
                max_tokens=300,
                temperature=0.5
            )
            
            # Parse JSON response
            concepts_text = response.get('text', '[]')
            concepts = json.loads(concepts_text)
            
            return concepts if isinstance(concepts, list) else []
            
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
            from emergentintegrations import EmergentLLM
            
            llm = EmergentLLM()
            
            concepts_str = "\n".join([f"{i+1}. {concept}" for i, concept in enumerate(concepts)])
            
            prompt = f"""Create 3-5 multiple choice quiz questions based on these concepts:

{concepts_str}

For each question, provide:
- question: Clear, testable question
- options: 4 answer choices (A, B, C, D)
- correct: Letter of correct answer
- explanation: Why the answer is correct

Return as JSON array of question objects.

Example:
[{{
  "question": "What is the primary purpose of Python decorators?",
  "options": {{
    "A": "To delete functions",
    "B": "To modify or enhance function behavior",
    "C": "To create classes",
    "D": "To import modules"
  }},
  "correct": "B",
  "explanation": "Decorators are used to modify or enhance the behavior of functions without changing their code."
}}]

JSON array:"""
            
            response = await llm.generate(
                prompt=prompt,
                model="gpt-5",
                max_tokens=1500,
                temperature=0.7
            )
            
            # Parse JSON response
            quiz_text = response.get('text', '[]')
            questions = json.loads(quiz_text)
            
            return questions if isinstance(questions, list) else []
            
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
        Create knowledge graph node from processed conversation
        
        Returns node_id
        """
        # TODO: Integrate with actual MongoDB database
        # For now, we'll use mock data structure
        
        node_id = f"mcp_{platform}_{conversation_id}"
        
        # Mock node creation
        logger.info(f"Created knowledge node: {node_id} with {len(concepts)} concepts and {len(quiz_questions)} quiz questions")
        
        # In real implementation:
        # - Store in MongoDB nodes collection
        # - Link to user's knowledge graph
        # - Schedule recall sessions
        # - Create quiz entries
        
        return node_id
