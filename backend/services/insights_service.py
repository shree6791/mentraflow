"""
Insights Service
Business logic for knowledge clusters and personalized recommendations
"""


def get_knowledge_clusters(nodes):
    """Generate knowledge clusters by analyzing node connections"""
    clusters = []
    
    # Memory Retention cluster (high retention nodes)
    memory_nodes = [n for n in nodes if n["id"] in ["t1", "t2", "t5"]]
    if memory_nodes:
        avg_score = sum(n["score"] for n in memory_nodes) // len(memory_nodes)
        clusters.append({
            "id": "cluster1",
            "name": "Memory Retention",
            "topics": [n["title"] for n in memory_nodes],
            "strength": avg_score,
            "lastReview": min(n["lastReview"] for n in memory_nodes)
        })
    
    # Study Techniques cluster
    study_nodes = [n for n in nodes if n["id"] in ["t2", "t3", "t5"]]
    if study_nodes:
        avg_score = sum(n["score"] for n in study_nodes) // len(study_nodes)
        clusters.append({
            "id": "cluster2",
            "name": "Study Techniques",
            "topics": [n["title"] for n in study_nodes],
            "strength": avg_score,
            "lastReview": min(n["lastReview"] for n in study_nodes)
        })
    
    # Cognitive Science cluster
    cognitive_nodes = [n for n in nodes if n["id"] in ["t4", "t6", "t7"]]
    if cognitive_nodes:
        avg_score = sum(n["score"] for n in cognitive_nodes) // len(cognitive_nodes)
        clusters.append({
            "id": "cluster3",
            "name": "Cognitive Science",
            "topics": [n["title"] for n in cognitive_nodes],
            "strength": avg_score,
            "lastReview": min(n["lastReview"] for n in cognitive_nodes)
        })
    
    return clusters


def get_recommendations(nodes):
    """Generate personalized recommendations based on node states"""
    recommendations = []
    
    # Find fading nodes (need review)
    fading_nodes = [n for n in nodes if n["state"] == "fading"]
    for node in fading_nodes:
        recommendations.append({
            "id": f"rec_review_{node['id']}",
            "type": "review",
            "title": f"Review: {node['title']}",
            "description": "This topic is fading. Review now to strengthen retention.",
            "priority": "high",
            "action": "Review Now",
            "nodeId": node["id"]
        })
    
    # Find strong nodes (practice to maintain)
    strong_nodes = [n for n in nodes if n["state"] == "high" and n["score"] > 85]
    if strong_nodes:
        node = strong_nodes[0]  # Pick the strongest
        recommendations.append({
            "id": f"rec_practice_{node['id']}",
            "type": "practice",
            "title": f"Practice: {node['title']} Quiz",
            "description": f"Your {node['title']} knowledge is strong. Test yourself to maintain it.",
            "priority": "low",
            "action": "Take Quiz",
            "nodeId": node["id"]
        })
    
    # Find connection opportunities (nodes with many connections)
    connected_nodes = sorted(nodes, key=lambda n: len(n["connections"]), reverse=True)
    if len(connected_nodes) >= 2:
        n1, n2 = connected_nodes[0], connected_nodes[1]
        recommendations.append({
            "id": "rec_connection_1",
            "type": "connection",
            "title": f"Connect: {n1['title']} ↔ {n2['title']}",
            "description": "These concepts complement each other. Review together for deeper understanding.",
            "priority": "medium",
            "action": "Explore Connection"
        })
    
    return recommendations
