import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Upload, FileText, BarChart3, Brain, CheckCircle, XCircle, ChevronDown, ChevronUp, Menu, X, Search, Filter, Eye, PenTool, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import KnowledgeGraph from '../components/KnowledgeGraph';
import '../Dashboard.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ========================================
// MOCK DATA - Aligned with New Structure
// ========================================

// Knowledge Library Items
const LIBRARY_ITEMS = [
  {
    id: 'lib1',
    title: 'The Forgetting Curve & Memory Retention',
    filename: 'forgetting-curve.pdf',
    uploadDate: '2024-10-28',
    status: 'summarized',
    hasQuiz: true,
    quizScore: 80,
    lastReview: '2 days ago',
    retention: 'high'
  },
  {
    id: 'lib2',
    title: 'Active Recall Techniques',
    filename: 'active-recall-notes.txt',
    uploadDate: '2024-10-25',
    status: 'quiz-available',
    hasQuiz: true,
    quizScore: null,
    lastReview: '5 days ago',
    retention: 'medium'
  },
  {
    id: 'lib3',
    title: 'Spacing Effect Research Paper',
    filename: 'spacing-effect.pdf',
    uploadDate: '2024-10-20',
    status: 'summarized',
    hasQuiz: true,
    quizScore: 60,
    lastReview: '2 weeks ago',
    retention: 'fading'
  },
  {
    id: 'lib4',
    title: 'Neuroplasticity and Learning',
    filename: 'neuroplasticity.docx',
    uploadDate: '2024-11-01',
    status: 'pending',
    hasQuiz: false,
    quizScore: null,
    lastReview: null,
    retention: null
  }
];

// Sample Topics for Knowledge Graph
const SAMPLE_TOPICS = [
  { id: 't1', title: 'Forgetting Curve', status: 'high', lastReview: '2 days ago', libraryId: 'lib1' },
  { id: 't2', title: 'Active Recall', status: 'medium', lastReview: '5 days ago', libraryId: 'lib2' },
  { id: 't3', title: 'Spacing Effect', status: 'fading', lastReview: '2 weeks ago', libraryId: 'lib3' },
  { id: 't4', title: 'Neuroplasticity', status: 'medium', lastReview: 'Never', libraryId: 'lib4' },
  { id: 't5', title: 'Memory Consolidation', status: 'high', lastReview: '3 days ago', libraryId: 'lib1' }
];

// Recall Tasks - Items due for review today
const RECALL_TASKS = [
  {
    id: 'recall1',
    title: 'Forgetting Curve',
    libraryId: 'lib1',
    type: 'quiz',
    dueIn: 'Due now',
    questionCount: 2,
    lastScore: 80
  },
  {
    id: 'recall2',
    title: 'Spacing Effect',
    libraryId: 'lib3',
    type: 'review',
    dueIn: 'Due in 2 hours',
    questionCount: 3,
    lastScore: 60
  },
  {
    id: 'recall3',
    title: 'Active Recall',
    libraryId: 'lib2',
    type: 'quiz',
    dueIn: 'Due in 5 hours',
    questionCount: 2,
    lastScore: null
  }
];

// Quick recall quiz questions (for micro-quiz modal)
const QUICK_RECALL_QUIZ = {
  'Forgetting Curve': [
    {
      q: 'What percentage of information do we typically forget within 24 hours?',
      options: ['30%', '50%', '70%', '90%'],
      correctIndex: 2
    },
    {
      q: 'What is the most effective way to combat the forgetting curve?',
      options: ['Cramming', 'Spaced repetition', 'Highlighting', 'Passive re-reading'],
      correctIndex: 1
    }
  ],
  'Spacing Effect': [
    {
      q: 'What is the spacing effect?',
      options: [
        'Studying in large blocks of time',
        'Learning improves when review sessions are spaced out',
        'Taking breaks during study sessions',
        'Organizing notes by topics'
      ],
      correctIndex: 1
    },
    {
      q: 'Which review schedule follows the spacing effect?',
      options: ['1d → 1d → 1d', '1d → 3d → 7d → 14d', 'Weekly reviews only', 'Daily reviews forever'],
      correctIndex: 1
    },
    {
      q: 'Why does spacing reviews work better than massing?',
      options: [
        'It takes less total time',
        'It creates stronger, more durable memories',
        'It requires less effort',
        'It covers more material'
      ],
      correctIndex: 1
    }
  ],
  'Active Recall': [
    {
      q: 'What is active recall?',
      options: [
        'Re-reading notes multiple times',
        'Highlighting important passages',
        'Actively retrieving information from memory',
        'Organizing notes into summaries'
      ],
      correctIndex: 2
    },
    {
      q: 'Why is active recall more effective than passive review?',
      options: [
        'It\'s faster',
        'It strengthens neural pathways through effortful retrieval',
        'It\'s easier',
        'It requires less understanding'
      ],
      correctIndex: 1
    }
  ]
};

// Sample Summary
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

// Sample Quiz
const SAMPLE_QUIZ = [
  {
    q: 'What does the Forgetting Curve demonstrate?',
    options: [
      'Memory improves over time without review',
      'We forget about 70% of new information within 24 hours',
      'Cramming is the best study method',
      'Memory retention is constant over time'
    ],
    correctIndex: 1
  },
  {
    q: 'What is the most effective way to combat the forgetting curve?',
    options: [
      'Re-reading notes multiple times',
      'Highlighting important text',
      'Spaced repetition with active recall',
      'Studying in one long session'
    ],
    correctIndex: 2
  },
  {
    q: 'Which review schedule best aligns with spaced repetition?',
    options: [
      'Review every day at the same time',
      'Review once a week',
      '1 day → 3 days → 7 days → 14 days',
      'Random review whenever you remember'
    ],
    correctIndex: 2
  },
  {
    q: 'Why is active recall more effective than passive re-reading?',
    options: [
      'It takes less time',
      'It requires effortful retrieval that strengthens neural pathways',
      'It is easier and less stressful',
      'It doesn\'t require understanding the material'
    ],
    correctIndex: 1
  },
  {
    q: 'What happens to the forgetting curve with each successful recall?',
    options: [
      'It gets steeper, causing faster forgetting',
      'It stays the same',
      'It gets flatter, indicating slower forgetting',
      'It disappears completely'
    ],
    correctIndex: 2
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Library state
  const [libraryItems, setLibraryItems] = useState(LIBRARY_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Dashboard state
  const [masteryScore, setMasteryScore] = useState(68);
  const [weeklyChange, setWeeklyChange] = useState(6);
  const [topics, setTopics] = useState(SAMPLE_TOPICS);
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedContent, setUploadedContent] = useState('');
  const [summary, setSummary] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState({});
  const [showGraph, setShowGraph] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuizResults, setShowQuizResults] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: 'Demo User',
    email: 'demo@mentraflow.com',
    phone: '',
    timezone: 'America/New_York',
    notificationPreferences: {
      emailNotifications: true,
      reviewReminders: true,
      weeklyProgress: false
    }
  });
  const [profileErrors, setProfileErrors] = useState({});

  useEffect(() => {
    // TEMPORARY: Bypass authentication for demo
    const mockUser = {
      id: 'demo-user',
      email: 'demo@mentraflow.com',
      name: 'Demo User',
      picture: 'https://ui-avatars.com/api/?name=Demo+User&background=0E7C7B&color=fff&size=150'
    };
    
    setUser(mockUser);
    setLoading(false);
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.avatar-dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, {
        withCredentials: true
      });
      authLogout(); // Clear auth context
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      authLogout(); // Clear auth context even on error
      navigate('/');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedContent(event.target.result);
        showToast('File uploaded successfully!');
      };
      reader.readAsText(file);
    }
  };

  const generateSummaryAndQuiz = () => {
    if (!uploadedContent) {
      showToast('Please upload or paste content first', 'error');
      return;
    }
    
    setGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      setSummary(SAMPLE_SUMMARY);
      setQuiz(SAMPLE_QUIZ);
      setQuizAnswers({});
      setQuizResults({});
      setCurrentQuestionIndex(0);
      setShowQuizResults(false);
      setGenerating(false);
      showToast('Summary and quiz generated!');
    }, 2000);
  };

  const handleQuizAnswer = (questionIndex, optionIndex) => {
    setQuizAnswers({ ...quizAnswers, [questionIndex]: optionIndex });
  };

  const submitQuiz = () => {
    const results = {};
    quiz.forEach((q, idx) => {
      results[idx] = quizAnswers[idx] === q.correctIndex;
    });
    setQuizResults(results);
    setShowQuizResults(true);
    
    const score = Object.values(results).filter(Boolean).length;
    const percentage = Math.round((score / quiz.length) * 100);
    
    // Update mastery score
    const change = percentage > masteryScore ? 2 : -1;
    setMasteryScore(prev => Math.min(100, Math.max(0, prev + change)));
    setWeeklyChange(prev => prev + change);
    
    showToast(`Quiz complete! You scored ${percentage}%`);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleProfileSave = () => {
    showToast('Profile updated successfully!');
    setShowProfileModal(false);
  };

  // Filter library items
  const filteredLibraryItems = libraryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate progress metrics
  const masteredCount = topics.filter(t => t.status === 'high').length;
  const fadingCount = topics.filter(t => t.status === 'fading').length;
  const mediumCount = topics.filter(t => t.status === 'medium').length;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <Link to="/" className="dashboard-logo">
          MentraFlow
        </Link>
        
        <div className="avatar-dropdown-container">
          <button 
            className="avatar-button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img src={user?.picture} alt="User avatar" className="avatar-image" />
            <ChevronDown size={16} className={`dropdown-icon ${showDropdown ? 'rotate' : ''}`} />
          </button>
          
          {showDropdown && (
            <div className="avatar-dropdown">
              <button onClick={() => { setShowProfileModal(true); setShowDropdown(false); }}>
                <User size={16} />
                Profile Settings
              </button>
              <button onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Dashboard Content - Two Column Layout */}
      <div className="dashboard-content">
        
        {/* LEFT COLUMN - Insights Zone */}
        <div className="dashboard-left">
          
          {/* My Knowledge Library */}
          <section className="dashboard-section library-section">
            <div className="section-header">
              <h2>My Knowledge Library</h2>
              <div className="library-controls">
                <div className="search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search your library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select 
                  className="filter-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="summarized">Summarized</option>
                  <option value="quiz-available">Quiz Available</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            
            <div className="library-list">
              {filteredLibraryItems.length === 0 ? (
                <div className="library-empty-state">
                  <FileText size={48} className="empty-icon" />
                  <h3>Start capturing what matters</h3>
                  <p>Upload your first note or document to begin building your knowledge base.</p>
                </div>
              ) : (
                filteredLibraryItems.map(item => (
                  <div key={item.id} className="library-item">
                    <div className="library-item-header">
                      <h3>{item.title}</h3>
                      <span className={`status-badge status-${item.status}`}>
                        {item.status === 'summarized' && '✅ Summarized'}
                        {item.status === 'quiz-available' && '🧠 Quiz Available'}
                        {item.status === 'pending' && '⏳ Pending'}
                      </span>
                    </div>
                    <p className="library-item-meta">
                      {item.filename} • Uploaded {new Date(item.uploadDate).toLocaleDateString()}
                    </p>
                    {item.lastReview && (
                      <p className="library-item-review">Last reviewed: {item.lastReview}</p>
                    )}
                    <div className="library-item-actions">
                      {item.status === 'summarized' && (
                        <button className="action-btn" onClick={() => setSummary(SAMPLE_SUMMARY)}>
                          <Eye size={16} /> View Summary
                        </button>
                      )}
                      {item.hasQuiz && (
                        <button className="action-btn" onClick={() => setQuiz(SAMPLE_QUIZ)}>
                          <Brain size={16} /> Take Quiz
                        </button>
                      )}
                      {item.quizScore !== null && (
                        <button className="action-btn">
                          <TrendingUp size={16} /> Score: {item.quizScore}%
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="autosave-banner">
              💾 Your work is saved automatically
            </div>
          </section>

          {/* Knowledge Graph */}
          <section className="dashboard-section graph-section">
            <div className="section-header">
              <h2>Knowledge Graph</h2>
              <button className="btn-secondary" onClick={() => setShowGraph(true)}>
                <Brain size={18} /> View Graph
              </button>
            </div>
            <div className="graph-legend">
              <span className="legend-item"><span className="dot dot-high"></span> High Retention</span>
              <span className="legend-item"><span className="dot dot-medium"></span> Medium</span>
              <span className="legend-item"><span className="dot dot-fading"></span> Fading</span>
            </div>
          </section>

          {/* Progress Overview */}
          <section className="dashboard-section progress-section">
            <div className="section-header">
              <h2>Progress Overview</h2>
            </div>
            <div className="progress-stats">
              <div className="mastery-stat">
                <h3>{masteryScore}%</h3>
                <p>Overall Mastery</p>
                <span className={`weekly-change ${weeklyChange >= 0 ? 'positive' : 'negative'}`}>
                  {weeklyChange >= 0 ? '+' : ''}{weeklyChange}% this week
                </span>
              </div>
              <div className="progress-bars">
                <div className="progress-bar-item">
                  <div className="bar-label">
                    <span>Mastered</span>
                    <span>{masteredCount}</span>
                  </div>
                  <div className="bar">
                    <div className="bar-fill bar-high" style={{width: `${(masteredCount/topics.length)*100}%`}}></div>
                  </div>
                </div>
                <div className="progress-bar-item">
                  <div className="bar-label">
                    <span>Medium</span>
                    <span>{mediumCount}</span>
                  </div>
                  <div className="bar">
                    <div className="bar-fill bar-medium" style={{width: `${(mediumCount/topics.length)*100}%`}}></div>
                  </div>
                </div>
                <div className="progress-bar-item">
                  <div className="bar-label">
                    <span>Fading</span>
                    <span>{fadingCount}</span>
                  </div>
                  <div className="bar">
                    <div className="bar-fill bar-fading" style={{width: `${(fadingCount/topics.length)*100}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Topics */}
          <section className="dashboard-section recent-topics-section">
            <div className="section-header">
              <h2>Recent Topics</h2>
            </div>
            <div className="recent-topics-list">
              {topics.slice(0, 5).map(topic => (
                <div key={topic.id} className="recent-topic-item">
                  <div className="topic-info">
                    <span className={`topic-status-dot status-${topic.status}`}></span>
                    <div>
                      <h4>{topic.title}</h4>
                      <p>Last reviewed: {topic.lastReview}</p>
                    </div>
                  </div>
                  <div className="topic-actions">
                    <button className="btn-icon" title="View Summary">
                      <Eye size={16} />
                    </button>
                    <button className="btn-icon" title="Practice">
                      <Brain size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN - Actions Zone */}
        <div className="dashboard-right">
          
          {/* Capture Knowledge */}
          <section className="dashboard-section capture-section">
            <div className="section-header">
              <h2>Capture Knowledge</h2>
            </div>
            
            <div className="capture-tabs">
              <button 
                className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                <Upload size={18} /> Upload File
              </button>
              <button 
                className={`tab ${activeTab === 'paste' ? 'active' : ''}`}
                onClick={() => setActiveTab('paste')}
              >
                <PenTool size={18} /> Paste Text
              </button>
            </div>

            {activeTab === 'upload' ? (
              <div className="upload-zone">
                <input
                  type="file"
                  id="file-upload"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" className="upload-label">
                  <Upload size={48} className="upload-icon" />
                  <p className="upload-text">Drag & drop or click to upload</p>
                  <p className="upload-hint">Supports .txt, .pdf, .doc, .docx</p>
                </label>
              </div>
            ) : (
              <div className="paste-zone">
                <textarea
                  placeholder="Paste your notes, articles, or any text you want to remember..."
                  value={uploadedContent}
                  onChange={(e) => setUploadedContent(e.target.value)}
                  rows={10}
                />
              </div>
            )}

            <button 
              className="btn-primary btn-generate"
              onClick={generateSummaryAndQuiz}
              disabled={generating || !uploadedContent}
            >
              {generating ? (
                <>
                  <div className="spinner-small"></div> Generating...
                </>
              ) : (
                <>
                  <Brain size={18} /> Generate Summary & Quiz
                </>
              )}
            </button>
          </section>

          {/* Summary Display */}
          {summary && (
            <section className="dashboard-section summary-section">
              <div className="section-header">
                <h2>Summary</h2>
              </div>
              <div className="summary-content">
                <h3>{summary.title}</h3>
                <p className="summary-text">{summary.content}</p>
                {summary.bullets && summary.bullets.length > 0 && (
                  <div className="summary-bullets">
                    <h4>Key Takeaways:</h4>
                    <ul>
                      {summary.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.keywords && summary.keywords.length > 0 && (
                  <div className="summary-keywords">
                    {summary.keywords.map((keyword, idx) => (
                      <span key={idx} className="keyword-tag">{keyword}</span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Quiz Display */}
          {quiz && !showQuizResults && (
            <section className="dashboard-section quiz-section">
              <div className="section-header">
                <h2>Quiz - Question {currentQuestionIndex + 1} of {quiz.length}</h2>
              </div>
              <div className="quiz-progress-bar">
                <div 
                  className="quiz-progress-fill"
                  style={{width: `${((currentQuestionIndex + 1) / quiz.length) * 100}%`}}
                ></div>
              </div>
              <div className="quiz-question">
                <h3>{quiz[currentQuestionIndex].q}</h3>
                <div className="quiz-options">
                  {quiz[currentQuestionIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      className={`quiz-option ${quizAnswers[currentQuestionIndex] === idx ? 'selected' : ''}`}
                      onClick={() => handleQuizAnswer(currentQuestionIndex, idx)}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                      <span className="option-text">{option}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="quiz-navigation">
                <button 
                  className="btn-secondary"
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </button>
                {currentQuestionIndex < quiz.length - 1 ? (
                  <button 
                    className="btn-primary"
                    onClick={nextQuestion}
                    disabled={quizAnswers[currentQuestionIndex] === undefined}
                  >
                    Next
                  </button>
                ) : (
                  <button 
                    className="btn-primary"
                    onClick={submitQuiz}
                    disabled={Object.keys(quizAnswers).length !== quiz.length}
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Quiz Results */}
          {showQuizResults && (
            <section className="dashboard-section quiz-results-section">
              <div className="section-header">
                <h2>Quiz Results</h2>
              </div>
              <div className="results-summary">
                <div className="results-score">
                  <h3>{Math.round((Object.values(quizResults).filter(Boolean).length / quiz.length) * 100)}%</h3>
                  <p>{Object.values(quizResults).filter(Boolean).length} out of {quiz.length} correct</p>
                </div>
                <div className="results-message">
                  {Object.values(quizResults).filter(Boolean).length === quiz.length ? (
                    <p className="message-success">🎉 Perfect score! You've mastered this topic.</p>
                  ) : Object.values(quizResults).filter(Boolean).length >= quiz.length * 0.7 ? (
                    <p className="message-good">✅ Great work! You're building strong retention.</p>
                  ) : (
                    <p className="message-review">🧠 Keep practicing — each recall makes your memory stronger.</p>
                  )}
                </div>
              </div>
              <div className="results-breakdown">
                {quiz.map((q, idx) => (
                  <div key={idx} className={`result-item ${quizResults[idx] ? 'correct' : 'incorrect'}`}>
                    <div className="result-icon">
                      {quizResults[idx] ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    </div>
                    <div className="result-content">
                      <h4>Question {idx + 1}</h4>
                      <p>{q.q}</p>
                      <p className="result-answer">
                        {quizResults[idx] ? (
                          <span className="correct-answer">Your answer was correct!</span>
                        ) : (
                          <>
                            <span className="wrong-answer">Your answer: {q.options[quizAnswers[idx]]}</span>
                            <span className="correct-answer">Correct: {q.options[q.correctIndex]}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="btn-primary"
                onClick={() => {
                  setQuiz(null);
                  setQuizAnswers({});
                  setQuizResults({});
                  setShowQuizResults(false);
                  setCurrentQuestionIndex(0);
                }}
              >
                Start New Quiz
              </button>
            </section>
          )}

        </div>
      </div>

      {/* Knowledge Graph Modal */}
      {showGraph && (
        <div className="modal-overlay" onClick={() => setShowGraph(false)}>
          <div className="modal-content graph-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Your Knowledge Network</h2>
              <button className="modal-close" onClick={() => setShowGraph(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p className="graph-description">
                Each node represents a concept. Color indicates retention strength.
              </p>
              <KnowledgeGraph topics={topics} />
            </div>
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Profile Settings</h2>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <form className="profile-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  <select
                    value={profileData.timezone}
                    onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
                <div className="form-section">
                  <h3>Notification Preferences</h3>
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={profileData.notificationPreferences.emailNotifications}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          notificationPreferences: {
                            ...profileData.notificationPreferences,
                            emailNotifications: e.target.checked
                          }
                        })}
                      />
                      Email Notifications
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={profileData.notificationPreferences.reviewReminders}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          notificationPreferences: {
                            ...profileData.notificationPreferences,
                            reviewReminders: e.target.checked
                          }
                        })}
                      />
                      Review Reminders
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={profileData.notificationPreferences.weeklyProgress}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          notificationPreferences: {
                            ...profileData.notificationPreferences,
                            weeklyProgress: e.target.checked
                          }
                        })}
                      />
                      Weekly Progress Reports
                    </label>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowProfileModal(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn-primary" onClick={handleProfileSave}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
