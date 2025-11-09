import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search } from 'lucide-react';
import axios from 'axios';
import AppLayout from '../components/AppLayout';
import KnowledgeGraphD3 from '../components/KnowledgeGraphD3';
import { QuizModal } from '../components/modals';
import '../Dashboard.css';

const KnowledgeGraphPage = () => {
  const navigate = useNavigate();
  const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
  
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState(21); // Default: 3 weeks
  const [nodeStats, setNodeStats] = useState({ total: 0, showing: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Topic Detail Modal State
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [modalTab, setModalTab] = useState('summary'); // summary | quiz | performance
  const [quizData, setQuizData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuizResults, setShowQuizResults] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get(`${API}/nodes`, {
          params: {
            time_window: timeWindow,
            limit: 100
          }
        });
        setTopics(response.data?.nodes || []);
        setNodeStats({
          total: response.data?.total || 0,
          showing: response.data?.showing || 0
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching nodes:', error);
        setTopics([]);
        setLoading(false);
      }
    };

    fetchTopics();
  }, [API, timeWindow]);

  // Modal Handlers  
  const openTopicModal = async (topic, tab = 'summary') => {
    console.log('openTopicModal called with topic:', topic, 'tab:', tab);
    setSelectedTopic(topic);
    setModalTab(tab);
    
    // Fetch complete node details (summary + quiz + performance)
    try {
      const response = await axios.get(`${API}/node/${encodeURIComponent(topic.title)}`);
      const data = response.data;
      
      // Set quiz data if available
      if (data.quiz && data.quiz.questions) {
        setQuizData(data.quiz);
      } else {
        setQuizData(null);
      }
      
      // Store the full topic data for use in tabs
      setSelectedTopic({
        ...topic,
        summary: data.summary,
        performance: data.performance
      });
      
    } catch (error) {
      console.error('Error fetching node details:', error);
      setQuizData(null);
    }
  };
  
  // Callbacks for KnowledgeGraphD3
  const handleTakeQuiz = (node) => {
    console.log('handleTakeQuiz called:', node);
    openTopicModal(node, 'quiz');
  };

  const handleViewSummary = (node) => {
    console.log('handleViewSummary called:', node);
    openTopicModal(node, 'summary');
  };

  const closeTopicModal = () => {
    setSelectedTopic(null);
    setModalTab('summary');
    setQuizData(null);
    setQuizAnswers({});
    setQuizResults({});
    setCurrentQuestionIndex(0);
    setShowQuizResults(false);
  };

  // Quiz Handlers
  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const submitQuiz = async () => {
    if (!quizData || !quizData.questions) return;
    
    const results = {};
    const answers = [];
    
    quizData.questions.forEach((question, idx) => {
      const isCorrect = quizAnswers[idx] === question.correctIndex;
      results[idx] = isCorrect;
      answers.push({
        questionIndex: idx,
        selectedAnswer: quizAnswers[idx],
        isCorrect: isCorrect
      });
    });
    
    setQuizResults(results);
    setShowQuizResults(true);
    
    const score = Object.values(results).filter(Boolean).length;
    const percentage = Math.round((score / quizData.questions.length) * 100);
    
    // Submit quiz results to backend
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/quiz-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodeId: selectedTopic?.id || 't1',
          quizId: selectedTopic?.quizId || 'q1',
          answers: answers,
          score: score,
          percentage: percentage,
          totalQuestions: quizData.questions.length
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Quiz result submitted:', data);
        console.log(data.message); // Log the motivational message
      } else {
        console.error('Failed to submit quiz result');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const retakeQuiz = () => {
    setQuizAnswers({});
    setQuizResults({});
    setCurrentQuestionIndex(0);
    setShowQuizResults(false);
  };

  const calculateScore = () => {
    const correct = Object.values(quizResults).filter(Boolean).length;
    const total = quizData?.questions?.length || 0;
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  if (loading) {
    return (
      <AppLayout title="Your Knowledge Network">
        <div className="knowledge-graph-loading">
          <div className="loading-spinner"></div>
          <p>Loading your knowledge network...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="Your Knowledge Network"
      subtitle="Interactive memory visualization • Click nodes to explore"
      maxWidth="100%"
    >
      {/* Unified Controls Header - Filter & Search */}
      <div className="graph-controls-header">
        <div className="controls-left">
          <div className="time-filter-compact">
            <Filter size={16} className="filter-icon" />
            <select 
              value={timeWindow} 
              onChange={(e) => setTimeWindow(Number(e.target.value))}
              className="time-window-select-compact"
            >
              <option value={21}>Last 3 weeks</option>
              <option value={35}>Last 5 weeks</option>
              <option value={49}>Last 7 weeks</option>
              <option value={0}>All Time</option>
            </select>
          </div>
          <div className="node-stats-compact">
            {nodeStats.showing} of {nodeStats.total} topics
          </div>
        </div>
        <div className="controls-right">
          <div className="search-container-header">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-header"
            />
          </div>
        </div>
      </div>

      <KnowledgeGraphD3 
        topics={topics} 
        userAvatar="/default-avatar.png"
        userName="Demo User"
        onClose={() => navigate(-1)}
        onTakeQuiz={handleTakeQuiz}
        onViewSummary={handleViewSummary}
        hideHeader={true}
        externalSearchQuery={searchQuery}
      />

      {/* Topic Detail Modal - Using Shared Component */}
      {selectedTopic && (
        <QuizModal
          item={selectedTopic}
          modalTab={modalTab}
          onTabChange={setModalTab}
          onClose={closeTopicModal}
          quizData={quizData}
          quizAnswers={quizAnswers}
          currentQuestionIndex={currentQuestionIndex}
          showQuizResults={showQuizResults}
          quizResults={quizResults}
          onAnswerSelect={handleQuizAnswer}
          onPreviousQuestion={() => setCurrentQuestionIndex(prev => prev - 1)}
          onNextQuestion={() => setCurrentQuestionIndex(prev => prev + 1)}
          onSubmitQuiz={submitQuiz}
          onRetakeQuiz={retakeQuiz}
          calculateScore={calculateScore}
        />
      )}
    </AppLayout>
  );
};

export default KnowledgeGraphPage;
