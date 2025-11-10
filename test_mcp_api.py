"""
Test MCP API Endpoint
Tests the complete flow through the /api/mcp/receive-export endpoint
"""

import asyncio
import requests
import json
import time

BACKEND_URL = "http://localhost:8001"

def test_mcp_api():
    """Test the complete MCP flow through API"""
    
    print("=" * 80)
    print("Testing MCP API Endpoint: /api/mcp/receive-export")
    print("=" * 80)
    
    # Prepare test data
    export_data = {
        "user_id": "test_user_001",
        "conversations": [
            {
                "conversation_id": "api_test_001",
                "title": "Learning Python Async Programming",
                "platform": "claude",
                "messages": [
                    {
                        "role": "user",
                        "content": "Can you explain async/await in Python?"
                    },
                    {
                        "role": "assistant",
                        "content": "Async/await in Python allows you to write asynchronous code that looks like synchronous code. Key concepts: 1) async def creates a coroutine function, 2) await pauses execution until an awaitable completes, 3) asyncio.run() is used to run the main coroutine, 4) This enables concurrent operations without threading, 5) It's perfect for I/O-bound operations like API calls or database queries where you're waiting for external responses."
                    },
                    {
                        "role": "user",
                        "content": "When should I use async programming?"
                    },
                    {
                        "role": "assistant",
                        "content": "Use async programming when: 1) Making multiple API calls that can run concurrently, 2) Building web servers handling many simultaneous connections, 3) Working with websockets or streaming data, 4) Database operations where you're waiting for queries, 5) Any I/O-bound task where you spend time waiting. Don't use it for CPU-bound tasks like heavy computations - use multiprocessing instead."
                    }
                ],
                "created_at": "2024-01-15T10:30:00Z"
            }
        ]
    }
    
    print(f"\n📤 Sending test conversation:")
    print(f"   User: {export_data['user_id']}")
    print(f"   Platform: {export_data['conversations'][0]['platform']}")
    print(f"   Title: {export_data['conversations'][0]['title']}")
    print(f"   Messages: {len(export_data['conversations'][0]['messages'])}")
    
    # Send request
    print("\n🚀 Sending POST request to /api/mcp/receive-export...")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/mcp/receive-export",
            json=export_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ Request successful!")
            print(f"   Success: {result.get('success')}")
            print(f"   Message: {result.get('message')}")
            print(f"   Import ID: {result.get('import_id')}")
            print(f"   Processing Time: {result.get('processing_time_seconds')}s")
            
            import_id = result.get('import_id')
            
            # Wait a bit for background processing
            print("\n⏳ Waiting for background processing (5 seconds)...")
            time.sleep(5)
            
            # Check status
            print("\n🔍 Checking import status...")
            status_response = requests.get(
                f"{BACKEND_URL}/api/mcp/status/{import_id}"
            )
            
            if status_response.status_code == 200:
                status = status_response.json()
                print(f"\n📊 Import Status:")
                print(f"   Status: {status.get('status')}")
                print(f"   Progress: {status.get('progress')}%")
                print(f"   Concepts Extracted: {status.get('concepts_extracted')}")
                print(f"   Quizzes Generated: {status.get('quizzes_generated')}")
                print(f"   Nodes Created: {status.get('nodes_created')}")
            else:
                print(f"   ❌ Status check failed: {status_response.status_code}")
            
            # Get user's MCP concepts
            print("\n💡 Fetching extracted concepts...")
            concepts_response = requests.get(
                f"{BACKEND_URL}/api/mcp/concepts?user_id={export_data['user_id']}&limit=10"
            )
            
            if concepts_response.status_code == 200:
                concepts_data = concepts_response.json()
                concepts = concepts_data.get('concepts', [])
                print(f"   Total concepts: {len(concepts)}")
                if concepts:
                    print("\n   Concepts:")
                    for i, concept in enumerate(concepts[:5], 1):
                        print(f"   {i}. {concept.get('concept_text', 'N/A')[:80]}...")
            
            # Get user's MCP quizzes
            print("\n❓ Fetching generated quizzes...")
            quizzes_response = requests.get(
                f"{BACKEND_URL}/api/mcp/quizzes?user_id={export_data['user_id']}"
            )
            
            if quizzes_response.status_code == 200:
                quizzes_data = quizzes_response.json()
                quizzes = quizzes_data.get('quizzes', [])
                print(f"   Total quizzes: {len(quizzes)}")
                if quizzes:
                    quiz = quizzes[0]
                    questions = quiz.get('questions', [])
                    print(f"\n   Sample Quiz ({len(questions)} questions):")
                    if questions:
                        q = questions[0]
                        print(f"   Q: {q.get('question', 'N/A')}")
                        print(f"   Correct Answer: {q.get('correct', 'N/A')}")
            
        else:
            print(f"\n❌ Request failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 80)
    print("API Test Completed")
    print("=" * 80)


if __name__ == "__main__":
    test_mcp_api()
