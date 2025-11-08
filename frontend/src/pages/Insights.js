import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Target, BookOpen, Zap, Brain, ExternalLink } from 'lucide-react';
import axios from 'axios';
import AppLayout from '../components/AppLayout';
import '../styles/Insights.css';

const Insights = () => {
  const navigate = useNavigate();
  const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

  // State for insights data
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState({
    strong: [],
    medium: [],
    weak: []
  });
  const [knowledgeClusters, setKnowledgeClusters] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    avgScore: 0,
    strongTopics: 0,
    needsReview: 0,
    streak: 0,
    totalNotes: 0
  });
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchInsightsData = async () => {
      try {
        const [statsResponse, topicsResponse, clustersResponse, recommendationsResponse] = await Promise.all([
          axios.get(`${API}/stats`, { withCredentials: true }),
          axios.get(`${API}/topics`, { withCredentials: true }),
          axios.get(`${API}/clusters`, { withCredentials: true }),
          axios.get(`${API}/recommendations`, { withCredentials: true })
        ]);

        setStats(statsResponse.data || stats);
        
        // Process topics data into performance categories
        const topics = topicsResponse.data || [];
        const categorizedTopics = {
          strong: topics.filter(t => t.avgScore >= 80),
          medium: topics.filter(t => t.avgScore >= 60 && t.avgScore < 80),
          weak: topics.filter(t => t.avgScore < 60)
        };
        setPerformanceData(categorizedTopics);
        
        setKnowledgeClusters(clustersResponse.data || []);
        setRecommendations(recommendationsResponse.data || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching insights data:', error);
        setLoading(false);
      }
    };

    fetchInsightsData();
  }, [API]);

  return (
    <AppLayout 
      title="Your Learning Insights"
      subtitle="Track progress, identify patterns, and optimize retention"
    >
      {/* Quick Stats */}
      <div className="quick-stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{background: 'rgba(14, 124, 123, 0.1)'}}>
              <Brain size={24} color="#0E7C7B" />
            </div>
            <div className="stat-content">
              <h3>{stats.totalQuizzes}</h3>
              <p>Total Quizzes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background: 'rgba(6, 214, 160, 0.1)'}}>
              <Target size={24} color="#06D6A0" />
            </div>
            <div className="stat-content">
              <h3>{stats.avgScore}%</h3>
              <p>Average Score</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background: 'rgba(78, 154, 241, 0.1)'}}>
              <TrendingUp size={24} color="#4E9AF1" />
            </div>
            <div className="stat-content">
              <h3>{stats.strongTopics}</h3>
              <p>Strong Topics</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background: 'rgba(255, 209, 102, 0.1)'}}>
              <Zap size={24} color="#FFD166" />
            </div>
            <div className="stat-content">
              <h3>{stats.streak} days</h3>
              <p>Current Streak</p>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="activity-section">
          <h2>Performance Overview</h2>
          
          {/* Strong Topics */}
          <div className="performance-category">
            <div className="category-header strong">
              <TrendingUp size={20} />
              <h3>Strong Topics ({performanceData.strong.length})</h3>
            </div>
            <div className="topics-grid">
              {performanceData.strong.map((topic, idx) => (
                <div key={idx} className="topic-card strong">
                  <div className="topic-header">
                    <h4>{topic.topic}</h4>
                    <span className="score-badge strong">{topic.score}%</span>
                  </div>
                  <div className="topic-meta">
                    <span>{topic.quizzesTaken} quizzes</span>
                    <span>•</span>
                    <span>Last: {topic.lastReview}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill strong" style={{width: `${topic.score}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medium Topics */}
          <div className="performance-category">
            <div className="category-header medium">
              <Target size={20} />
              <h3>Medium Topics ({performanceData.medium.length})</h3>
            </div>
            <div className="topics-grid">
              {performanceData.medium.map((topic, idx) => (
                <div key={idx} className="topic-card medium">
                  <div className="topic-header">
                    <h4>{topic.topic}</h4>
                    <span className="score-badge medium">{topic.score}%</span>
                  </div>
                  <div className="topic-meta">
                    <span>{topic.quizzesTaken} quizzes</span>
                    <span>•</span>
                    <span>Last: {topic.lastReview}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill medium" style={{width: `${topic.score}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Topics */}
          <div className="performance-category">
            <div className="category-header weak">
              <TrendingDown size={20} />
              <h3>Needs Review ({performanceData.weak.length})</h3>
            </div>
            <div className="topics-grid">
              {performanceData.weak.map((topic, idx) => (
                <div key={idx} className="topic-card weak">
                  <div className="topic-header">
                    <h4>{topic.topic}</h4>
                    <span className="score-badge weak">{topic.score}%</span>
                  </div>
                  <div className="topic-meta">
                    <span>{topic.quizzesTaken} quizzes</span>
                    <span>•</span>
                    <span>Last: {topic.lastReview}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill weak" style={{width: `${topic.score}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Knowledge Clusters */}
        <div className="activity-section">
          <div className="section-header">
            <h2>Knowledge Clusters</h2>
            <button className="view-graph-btn" onClick={() => navigate('/knowledge-graph')}>
              <BookOpen size={16} />
              View Knowledge Graph
            </button>
          </div>
          <p className="section-description">Related topics you've mastered together</p>
          
          <div className="clusters-grid">
            {knowledgeClusters.map((cluster, idx) => (
              <div key={idx} className="cluster-card">
                <div className="cluster-icon" style={{background: `${cluster.color}20`}}>
                  <div className="cluster-dot" style={{background: cluster.color}}></div>
                </div>
                <div className="cluster-content">
                  <h4>{cluster.name}</h4>
                  <div className="cluster-stats">
                    <span>{cluster.topics} topics</span>
                    <span className="cluster-score" style={{color: cluster.color}}>
                      {cluster.avgScore}% avg
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="activity-section">
          <h2>Recommendations</h2>
          <div className="recommendations-list">
            {recommendations.map((rec, idx) => (
              <div key={idx} className={`recommendation-item ${rec.priority}`}>
                <div className="rec-icon">
                  {rec.priority === 'high' && '🔴'}
                  {rec.priority === 'medium' && '🟡'}
                  {rec.priority === 'success' && '🟢'}
                </div>
                <p>{rec.text}</p>
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
  );
};

export default Insights;
