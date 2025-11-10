"""
Test Script for MCP Phase 2: Intelligence Layer
Tests the OpenAI-powered summarization, concept extraction, and quiz generation
"""

import asyncio
import json
from backend.services.mcp_processor import MCPProcessor
from backend.routes.mcp import ChatMessage, ChatConversation


async def test_mcp_processor():
    """Test the MCP processor with a sample conversation"""
    
    print("=" * 80)
    print("Testing MCP Phase 2: Intelligence Layer with OpenAI SDK")
    print("=" * 80)
    
    # Create a sample conversation
    sample_conversation = ChatConversation(
        conversation_id="test_conv_001",
        title="Learning about Spaced Repetition",
        platform="claude",
        messages=[
            ChatMessage(
                role="user",
                content="Can you explain what spaced repetition is and why it's effective for learning?"
            ),
            ChatMessage(
                role="assistant",
                content="Spaced repetition is a learning technique that involves reviewing information at gradually increasing intervals. It's based on the 'forgetting curve' discovered by psychologist Hermann Ebbinghaus. The technique is effective because: 1) It fights the natural forgetting process by reviewing just before you're likely to forget, 2) Each successful recall strengthens the memory, 3) The spacing effect shows that distributed practice is more effective than cramming, 4) It optimizes your study time by focusing on what you're about to forget rather than what you already know well."
            ),
            ChatMessage(
                role="user",
                content="How do I implement this in my daily study routine?"
            ),
            ChatMessage(
                role="assistant",
                content="Here's how to implement spaced repetition: 1) Use flashcard apps like Anki or MentraFlow that automate the spacing intervals, 2) Review new material the same day you learn it, then again after 1 day, 3 days, 1 week, 2 weeks, and 1 month, 3) Focus your reviews on material you're struggling with - the app will show these more frequently, 4) Keep sessions short (20-30 minutes) but consistent daily, 5) Create good flashcards: one concept per card, use active recall questions, add context and examples. The key is consistency - even 15 minutes daily is better than occasional long sessions."
            )
        ]
    )
    
    print("\n📝 Sample Conversation:")
    print(f"   Title: {sample_conversation.title}")
    print(f"   Platform: {sample_conversation.platform}")
    print(f"   Messages: {len(sample_conversation.messages)}")
    print()
    
    # Initialize processor
    print("🔧 Initializing MCPProcessor with OpenAI SDK...")
    try:
        processor = MCPProcessor()
        print("   ✅ MCPProcessor initialized successfully")
    except Exception as e:
        print(f"   ❌ Error initializing processor: {str(e)}")
        return
    
    # Process the conversation
    print("\n🚀 Processing conversation...")
    print("-" * 80)
    
    try:
        result = await processor.process_conversation(
            user_id="test_user",
            conversation=sample_conversation
        )
        
        if result["success"]:
            print("\n✅ Processing completed successfully!")
            print(f"   Node ID: {result['node_id']}")
            print(f"   Concepts extracted: {result['concepts_count']}")
            print(f"   Quiz questions generated: {result['quiz_questions_count']}")
        else:
            print(f"\n❌ Processing failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"\n❌ Error during processing: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 80)
    print("Test completed")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_mcp_processor())
