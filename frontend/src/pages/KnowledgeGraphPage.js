import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Brain, Eye, BarChart3, X, CheckCircle, XCircle } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import KnowledgeGraphD3 from '../components/KnowledgeGraphD3';
import '../Dashboard.css';

// Sample Summary Data
const SAMPLE_SUMMARY = {
  title: 'The Forgetting Curve & Memory Retention',
  content: `The forgetting curve, discovered by Hermann Ebbinghaus in 1885, shows how memory retention declines exponentially over time without reinforcement. Within 24 hours, we forget approximately 70% of new information unless we actively review it.

The key to combating the forgetting curve is spaced repetition — reviewing material at increasing intervals (1 day, 3 days, 7 days, 14 days). Each review strengthens the memory trace, making it more resistant to decay.

Active recall, where you actively retrieve information from memory rather than passively re-reading, is the most effective review method. This effortful retrieval process strengthens neural pathways and creates more durable memories.`,
  bullets: [
    'Review just before forgetting to maximize retention efficiency',
    'Spacing intervals should expand: 1d → 3d → 7d → 14d → 1m',
    'Active recall strengthens memory better than passive re-reading',
    'Each successful recall makes the next forgetting curve flatter'
  ],
  keywords: ['Forgetting Curve', 'Spaced Repetition', 'Active Recall', 'Memory Consolidation']
};

const KnowledgeGraphPage = () => {
  const navigate = useNavigate();
  const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
  
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
        const response = await axios.get(`${API}/topics`);
        setTopics(response.data?.topics || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching topics:', error);
        setTopics([]);
        setLoading(false);
      }
    };

    fetchTopics();
  }, [API]);

  // Modal Handlers  
  const openTopicModal = async (topic, tab = 'summary') => {
    console.log('openTopicModal called with topic:', topic, 'tab:', tab);
    setSelectedTopic(topic);
    setModalTab(tab);
    
    // Fetch complete topic details (summary + quiz + performance)
    try {
      const response = await axios.get(`${API}/topic/${encodeURIComponent(topic.title)}`);
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
      console.error('Error fetching topic details:', error);
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

  const submitQuiz = () => {
    if (!quizData || !quizData.questions) return;
    
    const results = {};
    quizData.questions.forEach((question, idx) => {
      results[idx] = quizAnswers[idx] === question.correctIndex;
    });
    setQuizResults(results);
    setShowQuizResults(true);
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
      <KnowledgeGraphD3 
        topics={topics} 
        userAvatar="/default-avatar.png"
        userName="Demo User"
        onClose={() => navigate(-1)}
        onTakeQuiz={handleTakeQuiz}
        onViewSummary={handleViewSummary}
        hideHeader={true}
      />

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <div className="modal-overlay" onClick={closeTopicModal}>
          <div className="modal-content library-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedTopic.title}</h2>
                <p className="modal-subtitle">Last Review: {selectedTopic.lastReview}</p>
              </div>
              <button className="modal-close" onClick={closeTopicModal}>
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="library-modal-tabs">
              <button
                className={`library-tab ${modalTab === 'summary' ? 'active' : ''}`}
                onClick={() => setModalTab('summary')}
              >
                <Eye size={16} /> Summary
              </button>
              <button
                className={`library-tab ${modalTab === 'quiz' ? 'active' : ''}`}
                onClick={async () => {
                  setModalTab('quiz');
                  if (!quizData) {
                    try {
                      const response = await axios.get(`${API}/quiz/${encodeURIComponent(selectedTopic.title)}`);
                      setQuizData(response.data);
                    } catch (error) {
                      console.error('Error fetching quiz:', error);
                    }
                  }
                }}
              >
                <Brain size={16} /> Take Quiz
              </button>
              <button
                className={`library-tab ${modalTab === 'performance' ? 'active' : ''}`}
                onClick={() => setModalTab('performance')}
              >
                <BarChart3 size={16} /> Performance
              </button>
            </div>

            <div className="modal-body library-modal-body">
              {/* Summary Tab */}
              {modalTab === 'summary' && (
                <div className="library-tab-content">
                  <div className="summary-content">
                    <h3>Overview</h3>
                    <p>{SAMPLE_SUMMARY.content}</p>

                    <h4>Key Takeaways</h4>
                    <ul className="summary-bullets">
                      {SAMPLE_SUMMARY.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>

                    {SAMPLE_SUMMARY.keywords && SAMPLE_SUMMARY.keywords.length > 0 && (
                      <div className="summary-keywords">
                        <h4>Key Concepts</h4>
                        {SAMPLE_SUMMARY.keywords.map((keyword, idx) => (
                          <span key={idx} className="keyword-tag">{keyword}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quiz Tab */}
              {modalTab === 'quiz' && (
                <div className="library-tab-content">
                  {!quizData ? (
                    <div style={{textAlign: 'center', padding: '2rem'}}>
                      <div className="loading-spinner" style={{margin: '0 auto 1rem'}}></div>
                      <p>Loading quiz...</p>
                    </div>
                  ) : quizData.questions && quizData.questions.length > 0 ? (
                    !showQuizResults ? (
                      <>
                        <div className="quiz-progress-bar">
                          <div 
                            className="quiz-progress-fill"
                            style={{width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%`}}
                          ></div>
                        </div>
                        
                        <div className="quiz-question-card">
                          <div className="question-number">
                            Question {currentQuestionIndex + 1} of {quizData.questions.length}
                          </div>
                          <h3 className="quiz-question">{quizData.questions[currentQuestionIndex].q}</h3>
                          <div className="quiz-options">
                            {quizData.questions[currentQuestionIndex].options.map((option, idx) => (
                              <button
                                key={idx}
                                className={`quiz-option ${quizAnswers[currentQuestionIndex] === idx ? 'selected' : ''}`}
                                onClick={() => handleQuizAnswer(currentQuestionIndex, idx)}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="quiz-navigation">
                          {currentQuestionIndex > 0 && (
                            <button 
                              className="btn-secondary"
                              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                            >
                              Previous
                            </button>
                          )}
                          <div style={{flex: 1}}></div>
                          {currentQuestionIndex < quizData.questions.length - 1 ? (
                            <button 
                              className="btn-primary"
                              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                              disabled={quizAnswers[currentQuestionIndex] === undefined}
                            >
                              Next
                            </button>
                          ) : (
                            <button 
                              className="btn-primary"
                              onClick={submitQuiz}
                              disabled={Object.keys(quizAnswers).length !== quizData.questions.length}
                            >
                              Submit Quiz
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="quiz-results">
                        <div className="results-header">
                          <h3>Quiz Complete!</h3>
                          <div className="results-score">{calculateScore()}%</div>
                          <p className="results-message">
                            {calculateScore() >= 80 ? '🎉 Excellent work! Your memory is strong.' :
                             calculateScore() >= 60 ? '👍 Good job! Keep practicing.' :
                             '💪 Keep going! Review and try again.'}
                          </p>
                        </div>

                        <div className="results-breakdown">
                          {quizData.questions.map((question, idx) => (
                            <div key={idx} className={`result-item ${quizResults[idx] ? 'correct' : 'incorrect'}`}>
                              <div className="result-icon">
                                {quizResults[idx] ? <CheckCircle size={20} /> : <XCircle size={20} />}
                              </div>
                              <div className="result-details">
                                <p className="result-question">{question.q}</p>
                                <p className="result-answer">
                                  Your answer: <strong>{question.options[quizAnswers[idx]]}</strong>
                                  {!quizResults[idx] && (
                                    <span className="correct-answer">
                                      {' '}(Correct: {question.options[question.correctIndex]})
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button 
                          className="btn-primary"
                          style={{marginTop: '1rem', width: '100%'}}
                          onClick={retakeQuiz}
                        >
                          Retake Quiz
                        </button>
                      </div>
                    )
                  ) : (
                    <div style={{textAlign: 'center', padding: '2rem'}}>
                      <p>No quiz available for this topic yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Performance Tab */}
              {modalTab === 'performance' && (
                <div className="library-tab-content">
                  <div className="performance-overview">
                    <div className="perf-stat-card">
                      <h4>Current Score</h4>
                      <div className="perf-score">{selectedTopic.score}%</div>
                      <span className={`retention-badge retention-${selectedTopic.state}`}>
                        {selectedTopic.state === 'high' ? '🟢 Strong' : 
                         selectedTopic.state === 'medium' ? '🟡 Medium' : 
                         '🔴 Fading'}
                      </span>
                    </div>
                    
                    <div className="perf-info-card">
                      <h4>Learning Stats</h4>
                      <p>Quizzes taken: {selectedTopic.quizzesTaken || 0}</p>
                      <p>Last review: {selectedTopic.lastReview}</p>
                      <p>Connections: {selectedTopic.connections?.length || 0}</p>
                    </div>

                    {selectedTopic.state === 'fading' && (
                      <div className="perf-warning">
                        ⚠️ This topic needs reinforcement soon. Review the summary or retake the quiz to strengthen retention.
                      </div>
                    )}

                    <button 
                      className="btn-primary"
                      onClick={() => setModalTab('quiz')}
                    >
                      <Brain size={18} /> Practice Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default KnowledgeGraphPage;
