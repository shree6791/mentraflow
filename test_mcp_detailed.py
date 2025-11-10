"""
Detailed Test Script for MCP Phase 2
Shows actual outputs: summary, concepts, and quiz questions
"""

import asyncio
import json
import sys
sys.path.insert(0, '/app/backend')

from services.mcp_processor import MCPProcessor
from routes.mcp import ChatMessage, ChatConversation


async def test_detailed():
    """Test with detailed output"""
    
    print("=" * 80)
    print("MCP Phase 2: Detailed Test with OpenAI SDK")
    print("=" * 80)
    
    # Sample conversation
    sample_conversation = ChatConversation(
        conversation_id="test_detailed_001",
        title="Understanding Neural Networks",
        platform="claude",
        messages=[
            ChatMessage(
                role="user",
                content="What are neural networks and how do they work?"
            ),
            ChatMessage(
                role="assistant",
                content="Neural networks are computational models inspired by the human brain. They consist of layers of interconnected nodes (neurons) that process information. Each connection has a weight that gets adjusted during training. The network learns by: 1) Forward propagation - passing input through layers to get output, 2) Calculating error between predicted and actual output, 3) Backward propagation - adjusting weights to minimize error, 4) Repeating this process with training data until the model learns patterns."
            ),
            ChatMessage(
                role="user",
                content="What's the difference between deep learning and machine learning?"
            ),
            ChatMessage(
                role="assistant",
                content="Machine learning is a broader field where algorithms learn from data without explicit programming. Deep learning is a subset that uses neural networks with multiple layers (hence 'deep'). Key differences: 1) Deep learning can automatically extract features from raw data, while traditional ML often needs manual feature engineering, 2) Deep learning excels with large datasets and complex patterns like images and text, 3) Deep learning requires more computational power but achieves better performance on complex tasks, 4) Traditional ML methods like decision trees or SVMs work better with smaller datasets."
            )
        ]
    )
    
    print(f"\n📝 Conversation: {sample_conversation.title}")
    print(f"   Messages: {len(sample_conversation.messages)}")
    
    processor = MCPProcessor()
    
    # Get formatted conversation text
    formatted_text = processor._format_conversation(sample_conversation)
    print(f"\n📄 Formatted Conversation Text:")
    print("-" * 80)
    print(formatted_text[:500] + "..." if len(formatted_text) > 500 else formatted_text)
    
    # Test summarization
    print("\n\n🔍 Step 1: Summarization")
    print("-" * 80)
    summary = await processor._summarize_conversation(formatted_text)
    summary_data = json.loads(summary)
    
    print("Main Topics:")
    for i, topic in enumerate(summary_data.get("main_topics", []), 1):
        print(f"  {i}. {topic}")
    
    print("\nKey Insights:")
    for i, insight in enumerate(summary_data.get("key_insights", []), 1):
        print(f"  {i}. {insight}")
    
    print("\nQuestions Explored:")
    for i, question in enumerate(summary_data.get("questions", []), 1):
        print(f"  {i}. {question}")
    
    print("\nActionable Takeaways:")
    for i, takeaway in enumerate(summary_data.get("takeaways", []), 1):
        print(f"  {i}. {takeaway}")
    
    # Test concept extraction
    print("\n\n💡 Step 2: Concept Extraction")
    print("-" * 80)
    concepts = await processor._extract_concepts(formatted_text, summary)
    print(f"Extracted {len(concepts)} concepts:")
    for i, concept in enumerate(concepts, 1):
        print(f"  {i}. {concept}")
    
    # Test quiz generation
    print("\n\n❓ Step 3: Quiz Generation")
    print("-" * 80)
    quiz_questions = await processor._generate_quiz(concepts, formatted_text)
    print(f"Generated {len(quiz_questions)} quiz questions:\n")
    
    for i, q in enumerate(quiz_questions, 1):
        print(f"Question {i}: {q.get('question', 'N/A')}")
        options = q.get('options', {})
        for key in ['A', 'B', 'C', 'D']:
            marker = "✓" if key == q.get('correct') else " "
            print(f"  [{marker}] {key}. {options.get(key, 'N/A')}")
        print(f"  💡 Explanation: {q.get('explanation', 'N/A')}")
        print()
    
    print("=" * 80)
    print("✅ All Phase 2 components working successfully!")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_detailed())
