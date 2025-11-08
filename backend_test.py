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
        dashboard_keys = ["itemsDueToday", "avgRetention", "streakDays"]
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
        insights_keys = ["totalTopics", "strongRetention", "needingReview"]
        for key in insights_keys:
            if key not in insights:
                return f"Missing insights key: {key}"
        
        print_success(f"  totalTopics: {insights.get('totalTopics')}")
        print_success(f"  strongRetention: {insights.get('strongRetention')}")
        
        # Validate knowledge stats
        knowledge = data.get("knowledge", {})
        knowledge_keys = ["totalNodes", "totalConnections"]
        for key in knowledge_keys:
            if key not in knowledge:
                return f"Missing knowledge key: {key}"
        
        print_success(f"  totalNodes: {knowledge.get('totalNodes')}")
        print_success(f"  totalConnections: {knowledge.get('totalConnections')}")
        
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
            required_keys = ["id", "title", "dueTime", "priority", "nodeId"]
            for key in required_keys:
                if key not in task:
                    return f"Recall task missing key: {key}"
            
            print_success(f"  Sample task: {task['title']}")
            print_success(f"  Due: {task['dueTime']}")
            print_success(f"  Priority: {task['priority']}")
        
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
            required_keys = ["id", "name", "topics", "strength"]
            for key in required_keys:
                if key not in cluster:
                    return f"Cluster missing key: {key}"
            
            print_success(f"  Sample cluster: {cluster['name']}")
            print_success(f"  Topics: {len(cluster['topics'])}, Strength: {cluster['strength']}")
        
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
            required_keys = ["id", "type", "title", "description", "priority"]
            for key in required_keys:
                if key not in rec:
                    return f"Recommendation missing key: {key}"
            
            print_success(f"  Sample: {rec['title']}")
            print_success(f"  Type: {rec['type']}, Priority: {rec['priority']}")
        
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
        """Validate lightweight /api/nodes response (lazy loading architecture)"""
        if "nodes" not in data:
            return "Missing 'nodes' key"
        
        nodes = data["nodes"]
        if not isinstance(nodes, list):
            return f"nodes should be a list, got {type(nodes)}"
        
        if len(nodes) == 0:
            return "No nodes found"
        
        print_success(f"  Found {len(nodes)} nodes")
        
        # Validate lightweight structure (should only have minimal fields for lazy loading)
        if nodes:
            node = nodes[0]
            expected_keys = ["id", "title", "state", "lastReview", "score", "connections"]
            for key in expected_keys:
                if key not in node:
                    return f"Node missing key: {key}"
            
            # CRITICAL: Check that lazy loading is working - should NOT have quiz/summary content
            forbidden_fields = ["questions", "summary"]
            found_forbidden = [k for k in node.keys() if k in forbidden_fields]
            if found_forbidden:
                return f"LAZY LOADING FAILED: Found quiz/summary content in lightweight nodes: {found_forbidden}"
            
            # Check for reference fields (quizId, summaryId should be in full node data, not lightweight)
            reference_fields = [k for k in node.keys() if k in ["quizId", "summaryId"]]
            if reference_fields:
                print_info(f"  Reference fields present: {reference_fields} (acceptable)")
            
            # Validate connections is an array
            if not isinstance(node["connections"], list):
                return f"connections should be a list, got {type(node['connections'])}"
            
            print_success(f"  ✅ LAZY LOADING VERIFIED: No quiz/summary content in lightweight response")
            print_success(f"  Sample node: {node['title']}")
            print_success(f"  Connections: {len(node['connections'])} connections")
            print_success(f"  Score: {node['score']}")
            print_success(f"  State: {node['state']}")
        
        return True
    
    def validate_node_detail(self, data: Dict) -> bool:
        """Validate detailed /api/node/{title} response (lazy loading architecture)"""
        required_keys = ["node", "summary", "quiz", "performance"]
        for key in required_keys:
            if key not in data:
                return f"Missing key: {key}"
        
        # Validate node data
        node = data["node"]
        if not isinstance(node, dict):
            return f"node should be a dict, got {type(node)}"
        
        # Validate summary data (LAZY LOADED from SUMMARY_CONTENT)
        summary = data["summary"]
        if summary is not None:
            if not isinstance(summary, dict):
                return f"summary should be a dict or null, got {type(summary)}"
            
            summary_keys = ["content", "keyTakeaways", "keywords"]
            for key in summary_keys:
                if key not in summary:
                    return f"Summary missing key: {key}"
            
            print_success(f"  ✅ LAZY LOADED SUMMARY: {', '.join(summary.keys())}")
            print_success(f"  Summary content length: {len(summary['content'])} chars")
            print_success(f"  Key takeaways: {len(summary['keyTakeaways'])} items")
            print_success(f"  Keywords: {len(summary['keywords'])} items")
        else:
            print_info("  Summary data is null (no summary available)")
        
        # Validate quiz data (LAZY LOADED from QUIZ_CONTENT)
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
            
            # Validate question structure
            if len(quiz["questions"]) > 0:
                question = quiz["questions"][0]
                question_keys = ["q", "options", "correctIndex"]
                for key in question_keys:
                    if key not in question:
                        return f"Quiz question missing key: {key}"
                
                if not isinstance(question["options"], list):
                    return f"Question options should be a list, got {type(question['options'])}"
                
                print_success(f"  ✅ LAZY LOADED QUIZ: {len(quiz['questions'])} questions")
                print_success(f"  Sample question: {question['q'][:50]}...")
                print_success(f"  Options per question: {len(question['options'])}")
            else:
                return "Quiz has no questions"
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

    def run_lazy_loading_tests(self):
        """Run tests for the new lazy loading architecture as requested"""
        print_header("LAZY LOADING ARCHITECTURE TESTING")
        print_info("Testing the new architecture with lean NODES and on-demand content loading")
        print_info("Backend URL: https://learnmap-6.preview.emergentagent.com/api")
        
        # Test 1: Lightweight Nodes API (Critical - should NOT have quiz/summary content)
        print_header("Test 1: GET /api/nodes - Lightweight Nodes (Lazy Loading)")
        print_info("CRITICAL: Should return lean nodes WITHOUT quiz/summary content")
        print_info("Verify: id, title, state, score, connections, quizId, summaryId fields present")
        print_info("Verify: NO 'questions' or 'summary' fields in response (lazy loading)")
        
        self.test_endpoint(
            "Lightweight Nodes API - Lazy Loading",
            f"{BACKEND_URL}/nodes",
            expected_keys=["nodes"],
            validate_func=self.validate_lightweight_nodes
        )
        
        # Test 2: Lazy Loading Test - Forgetting Curve
        print_header("Test 2: GET /api/node/Forgetting%20Curve - Lazy Loading Test")
        print_info("Should fetch quiz from QUIZ_CONTENT using quizId")
        print_info("Should fetch summary from SUMMARY_CONTENT using summaryId")
        print_info("Verify: quiz.questions array has 2 questions")
        print_info("Verify: summary has content, keyTakeaways, keywords")
        print_info("Verify: All quiz questions have q, options, correctIndex")
        
        self.test_endpoint(
            "Lazy Loading - Forgetting Curve",
            f"{BACKEND_URL}/node/Forgetting%20Curve",
            expected_keys=["node", "summary", "quiz", "performance"],
            validate_func=self.validate_node_detail
        )
        
        # Test 3: Second Lazy Loading Test - Active Recall
        print_header("Test 3: GET /api/node/Active%20Recall - Second Lazy Loading Test")
        print_info("Test with different node to verify lazy loading works for all")
        print_info("Should return quiz and summary correctly")
        
        self.test_endpoint(
            "Lazy Loading - Active Recall",
            f"{BACKEND_URL}/node/Active%20Recall",
            expected_keys=["node", "summary", "quiz", "performance"],
            validate_func=self.validate_node_detail
        )
        
        # Test 4: Statistics (should still work)
        print_header("Test 4: GET /api/stats - Statistics (should still work)")
        self.test_endpoint(
            "Statistics API",
            f"{BACKEND_URL}/stats",
            expected_keys=["dashboard", "insights", "knowledge"],
            validate_func=self.validate_stats
        )
        
        # Test 5: Library (should still work)
        print_header("Test 5: GET /api/library - Library items (should still work)")
        self.test_endpoint(
            "Library API",
            f"{BACKEND_URL}/library",
            expected_keys=["items"],
            validate_func=self.validate_library
        )
        
        # Test 6: Recall Tasks (should still work)
        print_header("Test 6: GET /api/recall-tasks - Recall tasks (should still work)")
        self.test_endpoint(
            "Recall Tasks API",
            f"{BACKEND_URL}/recall-tasks",
            expected_keys=["tasks"],
            validate_func=self.validate_recall_tasks
        )
        
        # Test 7: Clusters (should still work)
        print_header("Test 7: GET /api/clusters - Clusters (should still work)")
        self.test_endpoint(
            "Clusters API",
            f"{BACKEND_URL}/clusters",
            expected_keys=["clusters"],
            validate_func=self.validate_clusters
        )
        
        # Test 8: Recommendations (should still work)
        print_header("Test 8: GET /api/recommendations - Recommendations (should still work)")
        self.test_endpoint(
            "Recommendations API",
            f"{BACKEND_URL}/recommendations",
            expected_keys=["recommendations"],
            validate_func=self.validate_recommendations
        )

    def run_refactored_api_tests(self):
        """Run tests for the refactored dashboard_data.py API endpoints"""
        print_header("REFACTORED DASHBOARD_DATA.PY API TESTING")
        
        # Test 1: Lightweight Nodes API
        print_header("Test 1: GET /api/nodes - Lightweight Nodes API")
        print_info("Should return minimal node data: id, title, state, lastReview, score, connections")
        print_info("Used by Knowledge Graph for initial render")
        
        self.test_endpoint(
            "Lightweight Nodes API",
            f"{BACKEND_URL}/nodes",
            expected_keys=["nodes"],
            validate_func=self.validate_lightweight_nodes
        )
        
        # Test 2: Node Detail API with specific node
        print_header("Test 2: GET /api/node/Forgetting%20Curve - Node Detail API")
        print_info("Should return: node data + summary + quiz + performance")
        print_info("Should have comprehensive data for modal display")
        
        self.test_endpoint(
            "Node Detail API - Forgetting Curve",
            f"{BACKEND_URL}/node/Forgetting%20Curve",
            expected_keys=["node", "summary", "quiz", "performance"],
            validate_func=self.validate_node_detail
        )
        
        # Test 3: All Statistics API
        print_header("Test 3: GET /api/stats - All Statistics")
        print_info("Should return dashboard, insights, and knowledge stats")
        print_info("Verify: dashboard.itemsDueToday, dashboard.avgRetention, dashboard.streakDays")
        
        self.test_endpoint(
            "All Statistics API",
            f"{BACKEND_URL}/stats",
            expected_keys=["dashboard", "insights", "knowledge"],
            validate_func=self.validate_stats
        )
        
        # Test 4: Library Items API
        print_header("Test 4: GET /api/library - Library Items")
        print_info("Should return all library items with metadata")
        print_info("Verify: items array with id, title, retention, quizScore, hasQuiz")
        
        self.test_endpoint(
            "Library Items API",
            f"{BACKEND_URL}/library",
            expected_keys=["items"],
            validate_func=self.validate_library
        )
        
        # Test 5: Recall Tasks API
        print_header("Test 5: GET /api/recall-tasks - Recall Tasks")
        print_info("Should return tasks array with priority levels")
        
        self.test_endpoint(
            "Recall Tasks API",
            f"{BACKEND_URL}/recall-tasks",
            expected_keys=["tasks"],
            validate_func=self.validate_recall_tasks
        )
        
        # Test 6: Knowledge Clusters API
        print_header("Test 6: GET /api/clusters - Knowledge Clusters")
        print_info("Should return clusters array with topics and strength")
        
        self.test_endpoint(
            "Knowledge Clusters API",
            f"{BACKEND_URL}/clusters",
            expected_keys=["clusters"],
            validate_func=self.validate_clusters
        )
        
        # Test 7: Personalized Recommendations API
        print_header("Test 7: GET /api/recommendations - Personalized Recommendations")
        print_info("Should return recommendations array with type and priority")
        
        self.test_endpoint(
            "Personalized Recommendations API",
            f"{BACKEND_URL}/recommendations",
            expected_keys=["recommendations"],
            validate_func=self.validate_recommendations
        )
        
        # Test 8: Node Detail API - Not found
        print_header("Test 8: GET /api/node/NonExistent - 404 Error Test")
        print_info("Should return 404 error with proper error message")
        
        self.test_404_endpoint(
            "Node Detail API - Not Found",
            f"{BACKEND_URL}/node/NonExistent"
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
    
    # Check if we should run specific tests
    if len(sys.argv) > 1 and sys.argv[1] == "all":
        tester.run_all_tests()
    else:
        # Run refactored API tests by default for this review
        tester.run_refactored_api_tests()
        tester.print_summary()
