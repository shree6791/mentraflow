#!/usr/bin/env python3
"""
Backend API Testing Script
Tests all consolidated API endpoints for Phase 1 Integration
"""

import requests
import json
import sys
from typing import Dict, Any, List

# Backend URL from environment
BACKEND_URL = "https://learnmap-6.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text: str):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.RESET}\n")

def print_success(text: str):
    print(f"{Colors.GREEN}✅ {text}{Colors.RESET}")

def print_error(text: str):
    print(f"{Colors.RED}❌ {text}{Colors.RESET}")

def print_warning(text: str):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.RESET}")

def print_info(text: str):
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.RESET}")

class BackendTester:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        
    def test_endpoint(self, name: str, url: str, expected_keys: List[str] = None, 
                     expected_type: type = dict, validate_func = None) -> bool:
        """Generic endpoint testing function"""
        print(f"\n{Colors.BOLD}Testing: {name}{Colors.RESET}")
        print(f"URL: {url}")
        
        try:
            response = requests.get(url, timeout=10)
            
            # Check status code
            if response.status_code != 200:
                print_error(f"Status code: {response.status_code}")
                print_error(f"Response: {response.text}")
                self.failed += 1
                self.errors.append(f"{name}: HTTP {response.status_code}")
                return False
            
            print_success(f"Status code: 200")
            
            # Parse JSON
            try:
                data = response.json()
            except json.JSONDecodeError as e:
                print_error(f"Invalid JSON response: {e}")
                self.failed += 1
                self.errors.append(f"{name}: Invalid JSON")
                return False
            
            # Check expected type
            if expected_type and not isinstance(data, expected_type):
                print_error(f"Expected type {expected_type.__name__}, got {type(data).__name__}")
                self.failed += 1
                self.errors.append(f"{name}: Wrong data type")
                return False
            
            # Check expected keys
            if expected_keys:
                missing_keys = [key for key in expected_keys if key not in data]
                if missing_keys:
                    print_error(f"Missing keys: {missing_keys}")
                    self.failed += 1
                    self.errors.append(f"{name}: Missing keys {missing_keys}")
                    return False
                print_success(f"All expected keys present: {expected_keys}")
            
            # Custom validation
            if validate_func:
                validation_result = validate_func(data)
                if validation_result is not True:
                    print_error(f"Validation failed: {validation_result}")
                    self.failed += 1
                    self.errors.append(f"{name}: {validation_result}")
                    return False
            
            # Print sample data
            print_info(f"Sample response: {json.dumps(data, indent=2)[:500]}...")
            
            print_success(f"{name} - PASSED")
            self.passed += 1
            return True
            
        except requests.exceptions.RequestException as e:
            print_error(f"Request failed: {e}")
            self.failed += 1
            self.errors.append(f"{name}: Request error - {str(e)}")
            return False
    
    def validate_stats(self, data: Dict) -> bool:
        """Validate /api/stats response"""
        required_sections = ["dashboard", "insights", "knowledge"]
        for section in required_sections:
            if section not in data:
                return f"Missing section: {section}"
        
        # Validate dashboard stats
        dashboard = data.get("dashboard", {})
        dashboard_keys = ["totalItems", "itemsDueToday", "avgRetention", "streakDays"]
        for key in dashboard_keys:
            if key not in dashboard:
                return f"Missing dashboard key: {key}"
        
        # Check avgRetention value
        avg_retention = dashboard.get("avgRetention")
        if not isinstance(avg_retention, (int, float)):
            return f"avgRetention should be numeric, got {type(avg_retention)}"
        
        # Check streakDays value
        streak_days = dashboard.get("streakDays")
        if not isinstance(streak_days, (int, float)):
            return f"streakDays should be numeric, got {type(streak_days)}"
        
        print_success(f"  avgRetention: {avg_retention}")
        print_success(f"  streakDays: {streak_days}")
        
        # Validate insights stats
        insights = data.get("insights", {})
        insights_keys = ["totalQuizzes", "avgScore", "strongTopics", "needsReview"]
        for key in insights_keys:
            if key not in insights:
                return f"Missing insights key: {key}"
        
        print_success(f"  totalQuizzes: {insights.get('totalQuizzes')}")
        print_success(f"  avgScore: {insights.get('avgScore')}")
        
        return True
    
    def validate_topics(self, data: Dict) -> bool:
        """Validate /api/topics response"""
        if "topics" not in data:
            return "Missing 'topics' key"
        
        topics = data["topics"]
        if not isinstance(topics, list):
            return f"topics should be a list, got {type(topics)}"
        
        if len(topics) != 8:
            return f"Expected 8 topics, got {len(topics)}"
        
        print_success(f"  Found {len(topics)} topics")
        
        # Validate first topic structure
        if topics:
            topic = topics[0]
            required_keys = ["id", "title", "state", "lastReview", "score", "connections", "libraryId", "quizzesTaken"]
            for key in required_keys:
                if key not in topic:
                    return f"Topic missing key: {key}"
            
            # Validate connections is an array
            if not isinstance(topic["connections"], list):
                return f"connections should be a list, got {type(topic['connections'])}"
            
            print_success(f"  Sample topic: {topic['title']}")
            print_success(f"  Connections: {len(topic['connections'])} connections")
            print_success(f"  Score: {topic['score']}")
        
        return True
    
    def validate_library(self, data: Dict) -> bool:
        """Validate /api/library response"""
        if "items" not in data:
            return "Missing 'items' key"
        
        items = data["items"]
        if not isinstance(items, list):
            return f"items should be a list, got {type(items)}"
        
        if len(items) == 0:
            return "No library items found"
        
        print_success(f"  Found {len(items)} library items")
        
        # Validate first item structure
        if items:
            item = items[0]
            required_keys = ["id", "title", "filename", "retention", "nextReview", "quizScore"]
            for key in required_keys:
                if key not in item:
                    return f"Library item missing key: {key}"
            
            print_success(f"  Sample item: {item['title']}")
            print_success(f"  Retention: {item['retention']}")
            print_success(f"  Quiz Score: {item['quizScore']}")
        
        return True
    
    def validate_recall_tasks(self, data: Dict) -> bool:
        """Validate /api/recall-tasks response"""
        if "tasks" not in data:
            return "Missing 'tasks' key"
        
        tasks = data["tasks"]
        if not isinstance(tasks, list):
            return f"tasks should be a list, got {type(tasks)}"
        
        print_success(f"  Found {len(tasks)} recall tasks")
        
        # Validate task structure if tasks exist
        if tasks:
            task = tasks[0]
            required_keys = ["id", "title", "libraryId", "type", "dueIn"]
            for key in required_keys:
                if key not in task:
                    return f"Recall task missing key: {key}"
            
            print_success(f"  Sample task: {task['title']}")
            print_success(f"  Due: {task['dueIn']}")
        
        return True
    
    def validate_clusters(self, data: Dict) -> bool:
        """Validate /api/clusters response"""
        if "clusters" not in data:
            return "Missing 'clusters' key"
        
        clusters = data["clusters"]
        if not isinstance(clusters, list):
            return f"clusters should be a list, got {type(clusters)}"
        
        print_success(f"  Found {len(clusters)} clusters")
        
        # Validate cluster structure
        if clusters:
            cluster = clusters[0]
            required_keys = ["name", "topics", "avgScore"]
            for key in required_keys:
                if key not in cluster:
                    return f"Cluster missing key: {key}"
            
            print_success(f"  Sample cluster: {cluster['name']}")
            print_success(f"  Topics: {cluster['topics']}, Avg Score: {cluster['avgScore']}")
        
        return True
    
    def validate_recommendations(self, data: Dict) -> bool:
        """Validate /api/recommendations response"""
        if "recommendations" not in data:
            return "Missing 'recommendations' key"
        
        recommendations = data["recommendations"]
        if not isinstance(recommendations, list):
            return f"recommendations should be a list, got {type(recommendations)}"
        
        print_success(f"  Found {len(recommendations)} recommendations")
        
        # Validate recommendation structure
        if recommendations:
            rec = recommendations[0]
            required_keys = ["text", "priority"]
            for key in required_keys:
                if key not in rec:
                    return f"Recommendation missing key: {key}"
            
            print_success(f"  Sample: {rec['text'][:50]}...")
        
        return True
    
    def validate_quiz(self, data: Dict) -> bool:
        """Validate /api/quiz/{title} response"""
        required_keys = ["title", "questions"]
        for key in required_keys:
            if key not in data:
                return f"Missing key: {key}"
        
        questions = data["questions"]
        if not isinstance(questions, list):
            return f"questions should be a list, got {type(questions)}"
        
        if len(questions) == 0:
            return "No questions found"
        
        print_success(f"  Found {len(questions)} questions")
        
        # Validate question structure
        question = questions[0]
        required_keys = ["q", "options", "correctIndex"]
        for key in required_keys:
            if key not in question:
                return f"Question missing key: {key}"
        
        if not isinstance(question["options"], list):
            return "options should be a list"
        
        print_success(f"  Sample question: {question['q'][:50]}...")
        print_success(f"  Options: {len(question['options'])}")
        
        return True
    
    def validate_lightweight_nodes(self, data: Dict) -> bool:
        """Validate lightweight /api/nodes response (optimized)"""
        if "nodes" not in data:
            return "Missing 'nodes' key"
        
        nodes = data["nodes"]
        if not isinstance(nodes, list):
            return f"nodes should be a list, got {type(nodes)}"
        
        if len(nodes) == 0:
            return "No nodes found"
        
        print_success(f"  Found {len(nodes)} nodes")
        
        # Validate lightweight structure (should only have minimal fields)
        if nodes:
            node = nodes[0]
            expected_keys = ["id", "title", "state", "lastReview", "score", "connections"]
            for key in expected_keys:
                if key not in node:
                    return f"Node missing key: {key}"
            
            # Check that it's lightweight (shouldn't have extra fields like libraryId, quizzesTaken)
            extra_fields = [k for k in node.keys() if k not in expected_keys]
            if extra_fields:
                print_warning(f"  Extra fields found (not lightweight): {extra_fields}")
            
            # Validate connections is an array
            if not isinstance(node["connections"], list):
                return f"connections should be a list, got {type(node['connections'])}"
            
            print_success(f"  Sample node: {node['title']}")
            print_success(f"  Connections: {len(node['connections'])} connections")
            print_success(f"  Score: {node['score']}")
            print_success(f"  State: {node['state']}")
        
        return True
    
    def validate_topic_detail(self, data: Dict) -> bool:
        """Validate detailed /api/topic/{title} response"""
        required_keys = ["topic", "summary", "quiz", "performance"]
        for key in required_keys:
            if key not in data:
                return f"Missing key: {key}"
        
        # Validate topic data
        topic = data["topic"]
        if not isinstance(topic, dict):
            return f"topic should be a dict, got {type(topic)}"
        
        # Validate summary data
        summary = data["summary"]
        if not isinstance(summary, dict):
            return f"summary should be a dict, got {type(summary)}"
        
        summary_keys = ["content", "keyTakeaways", "keywords"]
        for key in summary_keys:
            if key not in summary:
                return f"Summary missing key: {key}"
        
        print_success(f"  Summary has: {', '.join(summary.keys())}")
        
        # Validate quiz data
        quiz = data["quiz"]
        if quiz is not None:
            if not isinstance(quiz, dict):
                return f"quiz should be a dict or null, got {type(quiz)}"
            
            quiz_keys = ["title", "questions"]
            for key in quiz_keys:
                if key not in quiz:
                    return f"Quiz missing key: {key}"
            
            if not isinstance(quiz["questions"], list):
                return f"quiz questions should be a list, got {type(quiz['questions'])}"
            
            print_success(f"  Quiz has {len(quiz['questions'])} questions")
        else:
            print_info("  Quiz data is null (no quiz available)")
        
        # Validate performance data
        performance = data["performance"]
        if not isinstance(performance, dict):
            return f"performance should be a dict, got {type(performance)}"
        
        performance_keys = ["quizzesTaken", "currentScore", "state", "lastReview"]
        for key in performance_keys:
            if key not in performance:
                return f"Performance missing key: {key}"
        
        print_success(f"  Performance - Score: {performance['currentScore']}, State: {performance['state']}")
        
        return True
    
    def test_404_endpoint(self, name: str, url: str) -> bool:
        """Test endpoint that should return 404"""
        print(f"\n{Colors.BOLD}Testing: {name}{Colors.RESET}")
        print(f"URL: {url}")
        
        try:
            response = requests.get(url, timeout=10)
            
            # Check status code should be 404
            if response.status_code != 404:
                print_error(f"Expected 404, got status code: {response.status_code}")
                print_error(f"Response: {response.text}")
                self.failed += 1
                self.errors.append(f"{name}: Expected 404, got {response.status_code}")
                return False
            
            print_success(f"Status code: 404 (as expected)")
            
            # Try to parse JSON for error message
            try:
                data = response.json()
                if "error" in data:
                    print_success(f"Error message: {data['error']}")
                else:
                    print_warning("No error message in response")
            except json.JSONDecodeError:
                print_warning("Response is not JSON")
            
            print_success(f"{name} - PASSED")
            self.passed += 1
            return True
            
        except requests.exceptions.RequestException as e:
            print_error(f"Request failed: {e}")
            self.failed += 1
            self.errors.append(f"{name}: Request error - {str(e)}")
            return False

    def run_optimized_api_tests(self):
        """Run tests for the new optimized API architecture"""
        print_header("OPTIMIZED API ARCHITECTURE TESTING")
        
        # Test 1: Lightweight List API
        print_header("Test 1: GET /api/topics - Lightweight List API")
        print_info("Should return minimal data: id, title, state, lastReview, score, connections")
        print_info("Should be fast (< 100ms) and return all topics")
        
        self.test_endpoint(
            "Lightweight Topics API",
            f"{BACKEND_URL}/topics",
            expected_keys=["topics"],
            validate_func=self.validate_lightweight_topics
        )
        
        # Test 2: Detail API with specific topic
        print_header("Test 2: GET /api/topic/Forgetting%20Curve - Detail API")
        print_info("Should return: topic data + summary + quiz + performance")
        print_info("Should have nested structure with all comprehensive data")
        
        self.test_endpoint(
            "Topic Detail API - Forgetting Curve",
            f"{BACKEND_URL}/topic/Forgetting%20Curve",
            expected_keys=["topic", "summary", "quiz", "performance"],
            validate_func=self.validate_topic_detail
        )
        
        # Test 3: Detail API with URL encoding
        print_header("Test 3: GET /api/topic/Active%20Recall - URL Encoding Test")
        print_info("Should properly decode the title and return correct data")
        
        self.test_endpoint(
            "Topic Detail API - Active Recall (URL encoded)",
            f"{BACKEND_URL}/topic/Active%20Recall",
            expected_keys=["topic", "summary", "quiz", "performance"],
            validate_func=self.validate_topic_detail
        )
        
        # Test 4: Detail API - Not found
        print_header("Test 4: GET /api/topic/NonExistent - 404 Error Test")
        print_info("Should return 404 error with error message")
        
        self.test_404_endpoint(
            "Topic Detail API - Not Found",
            f"{BACKEND_URL}/topic/NonExistent"
        )

    def run_all_tests(self):
        """Run all backend API tests"""
        print_header("BACKEND API TESTING - Phase 1 Integration")
        
        # Test 1: GET /api/stats
        print_header("Test 1: GET /api/stats - All Statistics")
        self.test_endpoint(
            "GET /api/stats",
            f"{BACKEND_URL}/stats",
            expected_keys=["dashboard", "insights", "knowledge"],
            validate_func=self.validate_stats
        )
        
        # Test 2: GET /api/topics
        print_header("Test 2: GET /api/topics - All Topics with Connections")
        self.test_endpoint(
            "GET /api/topics",
            f"{BACKEND_URL}/topics",
            expected_keys=["topics"],
            validate_func=self.validate_topics
        )
        
        # Test 3: GET /api/library
        print_header("Test 3: GET /api/library - Library Items")
        self.test_endpoint(
            "GET /api/library",
            f"{BACKEND_URL}/library",
            expected_keys=["items"],
            validate_func=self.validate_library
        )
        
        # Test 4: GET /api/recall-tasks
        print_header("Test 4: GET /api/recall-tasks - Recall Tasks")
        self.test_endpoint(
            "GET /api/recall-tasks",
            f"{BACKEND_URL}/recall-tasks",
            expected_keys=["tasks"],
            validate_func=self.validate_recall_tasks
        )
        
        # Test 5: GET /api/clusters
        print_header("Test 5: GET /api/clusters - Knowledge Clusters")
        self.test_endpoint(
            "GET /api/clusters",
            f"{BACKEND_URL}/clusters",
            expected_keys=["clusters"],
            validate_func=self.validate_clusters
        )
        
        # Test 6: GET /api/recommendations
        print_header("Test 6: GET /api/recommendations - Personalized Recommendations")
        self.test_endpoint(
            "GET /api/recommendations",
            f"{BACKEND_URL}/recommendations",
            expected_keys=["recommendations"],
            validate_func=self.validate_recommendations
        )
        
        # Test 7: GET /api/quiz/{title}
        print_header("Test 7: GET /api/quiz/Forgetting%20Curve - Quiz Questions")
        self.test_endpoint(
            "GET /api/quiz/Forgetting Curve",
            f"{BACKEND_URL}/quiz/Forgetting%20Curve",
            expected_keys=["title", "questions"],
            validate_func=self.validate_quiz
        )
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print_header("TEST SUMMARY")
        
        total = self.passed + self.failed
        print(f"\n{Colors.BOLD}Total Tests: {total}{Colors.RESET}")
        print(f"{Colors.GREEN}Passed: {self.passed}{Colors.RESET}")
        print(f"{Colors.RED}Failed: {self.failed}{Colors.RESET}")
        
        if self.failed > 0:
            print(f"\n{Colors.BOLD}{Colors.RED}FAILED TESTS:{Colors.RESET}")
            for error in self.errors:
                print(f"  {Colors.RED}• {error}{Colors.RESET}")
            print(f"\n{Colors.RED}{'='*80}{Colors.RESET}")
            print(f"{Colors.RED}{Colors.BOLD}OVERALL RESULT: FAILED{Colors.RESET}")
            print(f"{Colors.RED}{'='*80}{Colors.RESET}\n")
            sys.exit(1)
        else:
            print(f"\n{Colors.GREEN}{'='*80}{Colors.RESET}")
            print(f"{Colors.GREEN}{Colors.BOLD}OVERALL RESULT: ALL TESTS PASSED ✅{Colors.RESET}")
            print(f"{Colors.GREEN}{'='*80}{Colors.RESET}\n")
            sys.exit(0)

if __name__ == "__main__":
    import sys
    
    tester = BackendTester()
    
    # Check if we should run optimized API tests specifically
    if len(sys.argv) > 1 and sys.argv[1] == "optimized":
        tester.run_optimized_api_tests()
    else:
        # Run optimized API tests by default for this review
        tester.run_optimized_api_tests()
