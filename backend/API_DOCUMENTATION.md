# MentraFlow API Documentation

## Base URL
All endpoints are prefixed with `/api`

---

## Dashboard Endpoints

### Get All Library Items
**GET** `/api/dashboard/library`

Returns all knowledge library items with retention data.

**Response:**
```json
{
  "items": [
    {
      "id": "lib1",
      "title": "The Forgetting Curve & Memory Retention",
      "filename": "forgetting-curve.pdf",
      "uploadDate": "2024-10-28",
      "status": "summarized",
      "hasQuiz": true,
      "quizScore": 80,
      "lastReview": "2 days ago",
      "retention": "high",
      "nextReview": "In 5 days",
      "nextReviewDays": 5
    }
    // ... more items
  ]
}
```

---

### Get Library Item by ID
**GET** `/api/dashboard/library/{item_id}`

Returns a specific library item.

**Parameters:**
- `item_id` (string): The library item ID

**Response:**
```json
{
  "id": "lib1",
  "title": "The Forgetting Curve & Memory Retention",
  // ... full item data
}
```

---

### Get Topics
**GET** `/api/dashboard/topics`

Returns all topics for the knowledge graph.

**Response:**
```json
{
  "topics": [
    {
      "id": "t1",
      "title": "Forgetting Curve",
      "status": "high",
      "lastReview": "2 days ago",
      "libraryId": "lib1"
    }
    // ... more topics
  ]
}
```

---

### Get Recall Tasks
**GET** `/api/dashboard/recall-tasks`

Returns recall tasks due today.

**Response:**
```json
{
  "tasks": [
    {
      "id": "recall1",
      "title": "Forgetting Curve",
      "libraryId": "lib1",
      "type": "quiz",
      "dueIn": "Due now",
      "questionCount": 2,
      "lastScore": 80
    }
    // ... more tasks
  ]
}
```

---

### Get Quiz for Topic
**GET** `/api/dashboard/quiz/{title}`

Returns quiz questions for a specific topic.

**Parameters:**
- `title` (string, URL-encoded): The topic title

**Example:** `/api/dashboard/quiz/Forgetting%20Curve`

**Response:**
```json
{
  "title": "Forgetting Curve",
  "questions": [
    {
      "q": "What percentage of information do we typically forget within 24 hours?",
      "options": ["30%", "50%", "70%", "90%"],
      "correctIndex": 2
    }
    // ... more questions
  ]
}
```

---

### Get Dashboard Stats
**GET** `/api/dashboard/stats`

Returns overall dashboard statistics.

**Response:**
```json
{
  "totalItems": 6,
  "itemsDueToday": 3,
  "avgRetention": 72,
  "streakDays": 7
}
```

---

## Insights Endpoints

### Get Performance Data
**GET** `/api/insights/performance`

Returns topics grouped by performance level (strong, medium, weak).

**Response:**
```json
{
  "strong": [
    {
      "topic": "Spacing Effect",
      "score": 92,
      "quizzesTaken": 5,
      "lastReview": "2 days ago"
    }
    // ... more strong topics
  ],
  "medium": [
    // ... medium topics
  ],
  "weak": [
    // ... weak topics
  ]
}
```

---

### Get Knowledge Clusters
**GET** `/api/insights/clusters`

Returns knowledge clusters with topics and average scores.

**Response:**
```json
{
  "clusters": [
    {
      "name": "Memory Techniques",
      "topics": 5,
      "avgScore": 85,
      "color": "#0E7C7B"
    }
    // ... more clusters
  ]
}
```

---

### Get Insights Stats
**GET** `/api/insights/stats`

Returns insights page statistics.

**Response:**
```json
{
  "totalQuizzes": 23,
  "avgScore": 75,
  "strongTopics": 3,
  "needsReview": 2,
  "streak": 4,
  "totalNotes": 12
}
```

---

### Get Recommendations
**GET** `/api/insights/recommendations`

Returns personalized recommendations.

**Response:**
```json
{
  "recommendations": [
    {
      "text": "Review \"Interleaving Practice\" - Last reviewed 2 weeks ago",
      "priority": "high"
    }
    // ... more recommendations
  ]
}
```

---

## Knowledge Graph Endpoints

### Get All Graph Nodes
**GET** `/api/knowledge-graph/nodes`

Returns all knowledge graph nodes with their connections.

**Response:**
```json
{
  "nodes": [
    {
      "id": "t1",
      "title": "Forgetting Curve",
      "state": "high",
      "lastReview": "2 days ago",
      "score": 85,
      "connections": ["t2", "t5", "t7"]
    }
    // ... more nodes
  ]
}
```

---

### Get Node by ID
**GET** `/api/knowledge-graph/node/{node_id}`

Returns a specific knowledge graph node.

**Parameters:**
- `node_id` (string): The node ID

**Example:** `/api/knowledge-graph/node/t1`

**Response:**
```json
{
  "id": "t1",
  "title": "Forgetting Curve",
  "state": "high",
  "lastReview": "2 days ago",
  "score": 85,
  "connections": ["t2", "t5", "t7"]
}
```

---

## State/Retention Levels

- **high**: Strong retention (green)
- **medium**: Medium retention (yellow)
- **fading**: Needs review (red)

## Priority Levels (Recommendations)

- **high**: Urgent action needed
- **medium**: Should address soon
- **success**: Positive feedback

---

## Testing Endpoints

You can test all endpoints using:

```bash
# Dashboard
curl http://localhost:3000/api/dashboard/library
curl http://localhost:3000/api/dashboard/stats

# Insights
curl http://localhost:3000/api/insights/performance
curl http://localhost:3000/api/insights/stats

# Knowledge Graph
curl http://localhost:3000/api/knowledge-graph/nodes
```

---

## Next Steps

These endpoints currently return mock data. In the future, they will:
1. Connect to MongoDB for persistent storage
2. Implement user authentication/authorization
3. Support CRUD operations (POST, PUT, DELETE)
4. Add pagination and filtering
5. Include real-time updates via WebSockets
