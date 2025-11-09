import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Target, BookOpen, Zap, Brain, ExternalLink } from 'lucide-react';
import axios from 'axios';
import AppLayout from '../components/AppLayout';
import QuizModal from '../components/modals/QuizModal';
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
  
  // Quiz modal state
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  useEffect(() => {
    const fetchInsightsData = async () => {
      try {
        const [statsResponse, nodesResponse, clustersResponse, recommendationsResponse] = await Promise.all([
          axios.get(`${API}/stats`),
          axios.get(`${API}/nodes`),
          axios.get(`${API}/clusters`),
          axios.get(`${API}/recommendations`)
        ]);

        setStats(statsResponse.data?.insights || stats);
        
        // Process topics data into performance categories
        const topics = nodesResponse.data?.nodes || [];
        const categorizedTopics = {
          strong: topics.filter(t => t.score >= 80).map(t => ({
            topic: t.title,
            score: t.score,
            quizzesTaken: t.quizzesTaken || 0,
            lastReview: t.lastReview
          })),
          medium: topics.filter(t => t.score >= 60 && t.score < 80).map(t => ({
            topic: t.title,
            score: t.score,
            quizzesTaken: t.quizzesTaken || 0,
            lastReview: t.lastReview
          })),
          weak: topics.filter(t => t.score < 60).map(t => ({
            topic: t.title,
            score: t.score,
            quizzesTaken: t.quizzesTaken || 0,
            lastReview: t.lastReview
          }))
        };
        setPerformanceData(categorizedTopics);
        
        setKnowledgeClusters(clustersResponse.data?.clusters || []);
        setRecommendations(recommendationsResponse.data?.recommendations || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching insights data:', error);
        setLoading(false);
      }
    };

    fetchInsightsData();
  }, [API]);

  // Handler to open quiz for a specific topic
  const handleOpenQuiz = async (topicName) => {
    setLoadingQuiz(true);
    setSelectedTopicForQuiz(topicName);
    
    try {
      // Fetch the full node data including quiz
      const response = await axios.get(`${API}/node/${encodeURIComponent(topicName)}`);
      const nodeData = response.data;
      
      if (nodeData && nodeData.quiz) {
        setQuizData({
          type: 'quiz',
          title: nodeData.title,
          questions: nodeData.quiz
        });
        setShowQuizModal(true);
      } else {
        console.error('No quiz data available for this topic');
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    } finally {
      setLoadingQuiz(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Your Learning Insights">
        <div className="insights-loading">
          <div className="loading-spinner"></div>
          <p>Loading your insights...</p>
        </div>
      </AppLayout>
    );
  }

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
                <div 
                  key={idx} 
                  className="topic-card strong clickable" 
                  onClick={() => handleOpenQuiz(topic.topic)}
                  title="Click to take quiz"
                >
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
                <div 
                  key={idx} 
                  className="topic-card medium clickable"
                  onClick={() => handleOpenQuiz(topic.topic)}
                  title="Click to take quiz"
                >
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
            {knowledgeClusters.map((cluster, idx) => {
              const colors = ['#0E7C7B', '#118AB2', '#EF476F', '#FFD166'];
              const color = colors[idx % colors.length];
              
              return (
                <div key={cluster.id} className="cluster-card">
                  <div className="cluster-icon" style={{background: `${color}20`}}>
                    <div className="cluster-dot" style={{background: color}}></div>
                  </div>
                  <div className="cluster-content">
                    <h4>{cluster.name}</h4>
                    <div className="cluster-topics-list">
                      {cluster.topics.slice(0, 3).map((topic, i) => (
                        <span key={i} className="cluster-topic-tag">{topic}</span>
                      ))}
                    </div>
                    <div className="cluster-stats">
                      <span>{cluster.topics.length} topics</span>
                      <span className="cluster-score" style={{color: color}}>
                        {cluster.strength}% avg
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="activity-section">
          <h2>Recommendations</h2>
          <div className="recommendations-list">
            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <div key={rec.id} className={`recommendation-item ${rec.priority}`}>
                  <div className="rec-icon">
                    {rec.type === 'review' && '🔴'}
                    {rec.type === 'practice' && '🟢'}
                    {rec.type === 'connection' && '🔗'}
                  </div>
                  <div className="rec-content">
                    <h4>{rec.title}</h4>
                    <p>{rec.description}</p>
                  </div>
                  <button className={`rec-action-btn ${rec.priority}`}>
                    {rec.action}
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>✨ You're doing great! No urgent recommendations at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
  );
};

export default Insights;
