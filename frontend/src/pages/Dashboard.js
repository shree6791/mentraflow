import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Upload, FileText, BarChart3, Brain, CheckCircle, XCircle, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import axios from 'axios';
import KnowledgeGraph from '../components/KnowledgeGraph';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mock data
const SAMPLE_TOPICS = [
  { id: 't1', title: 'Transformer Attention Basics', status: 'medium', lastReview: '2 days ago' },
  { id: 't2', title: 'Active Recall Benefits', status: 'high', lastReview: '1 week ago' },
  { id: 't3', title: 'Forgetting Curve', status: 'fading', lastReview: '3 weeks ago' },
  { id: 't4', title: 'Spacing Effect Principles', status: 'high', lastReview: '3 days ago' },
  { id: 't5', title: 'Neuroplasticity Research', status: 'medium', lastReview: '5 days ago' }
];

const SAMPLE_SUMMARY = {
  title: 'Spacing Effect Notes',
  bullets: [
    'Reviewing just before forgetting maximizes retention.',
    'Intervals should expand over time (1d, 3d, 7d...).',
    'Short, effortful recall beats passive re-reading.',
    'Track what is fading to prioritize review.'
  ],
  keywords: ['Spacing Effect', 'Recall', 'Intervals', 'Prioritization']
};

const SAMPLE_QUIZ = [
  {
    q: 'What best describes the Spacing Effect?',
    options: ['Reviewing many times in one day', 'Massed practice (cramming)', 'Reinforcing just before forgetting', 'Only reading summaries'],
    correctIndex: 2
  },
  {
    q: 'Which method strengthens memory most?',
    options: ['Passive re-reading', 'Highlighting', 'Active recall', 'Long summaries'],
    correctIndex: 2
  },
  {
    q: 'Which schedule aligns with spacing?',
    options: ['1-1-1 daily same time', '1d > 3d > 7d > 14d', 'Only monthly reviews', 'Random reminders'],
    correctIndex: 1
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 968);
  
  // Dashboard state
  const [retentionScore, setRetentionScore] = useState(82);
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
    
    /* COMMENTED OUT - Re-enable for production auth
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API}/auth/me`, {
          withCredentials: true
        });
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        navigate('/login');
      }
    };

    fetchUser();
    */
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
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
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
      setGenerating(false);
      showToast('Summary and quiz generated!');
    }, 1500);
  };

  const handleQuizAnswer = (questionIndex, optionIndex) => {
    if (quizResults[questionIndex] !== undefined) return; // Already answered
    
    setQuizAnswers({ ...quizAnswers, [questionIndex]: optionIndex });
    
    const isCorrect = quiz[questionIndex].correctIndex === optionIndex;
    setQuizResults({ ...quizResults, [questionIndex]: isCorrect });
    
    if (isCorrect) {
      showToast('Correct! 🎉', 'success');
    } else {
      showToast('Not quite. Try to remember for next time!', 'error');
    }
  };

  const finishQuiz = () => {
    const correctCount = Object.values(quizResults).filter(Boolean).length;
    const scoreIncrease = correctCount;
    
    setRetentionScore(Math.min(100, retentionScore + scoreIncrease));
    showToast(`Quiz complete! Retention score +${scoreIncrease}%`);
    
    // Reset for next round
    setTimeout(() => {
      setUploadedContent('');
      setSummary(null);
      setQuiz(null);
      setQuizAnswers({});
      setQuizResults({});
    }, 2000);
  };

  const addToKnowledgeStore = () => {
    showToast('Added to Knowledge Store! 📚');
  };

  const validateProfileField = (field, value) => {
    switch (field) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? '' : 'Invalid email format';
      case 'phone':
        if (!value) return ''; // Phone is optional
        const phoneRegex = /^\+?[\d\s\-()]+$/;
        return phoneRegex.test(value) ? '' : 'Invalid phone number';
      case 'name':
        return value.trim().length > 0 ? '' : 'Name is required';
      default:
        return '';
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
    const error = validateProfileField(field, value);
    setProfileErrors({ ...profileErrors, [field]: error });
  };

  const handleNotificationChange = (field) => {
    setProfileData({
      ...profileData,
      notificationPreferences: {
        ...profileData.notificationPreferences,
        [field]: !profileData.notificationPreferences[field]
      }
    });
  };

  const saveProfile = () => {
    // Validate all fields
    const errors = {
      name: validateProfileField('name', profileData.name),
      email: validateProfileField('email', profileData.email),
      phone: validateProfileField('phone', profileData.phone)
    };

    setProfileErrors(errors);

    // Check if any errors exist
    if (Object.values(errors).some(error => error !== '')) {
      showToast('Please fix validation errors', 'error');
      return;
    }

    // Simulate save
    setUser({ ...user, name: profileData.name, email: profileData.email });
    setShowProfileModal(false);
    showToast('Your profile was updated successfully');
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header-new">
        <div className="header-left">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/" className="dashboard-logo">MentraFlow</Link>
        </div>
        <div className="dashboard-user">
          <div className="avatar-dropdown-container">
            <div 
              className="avatar-trigger" 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {user?.picture && (
                <img src={user.picture} alt={user.name} className="user-avatar-clickable" />
              )}
              <span className="user-name">{user?.name}</span>
              <ChevronDown size={16} className={`dropdown-arrow ${showDropdown ? 'open' : ''}`} />
            </div>
            
            {showDropdown && (
              <div className="avatar-dropdown">
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    setShowDropdown(false);
                    setShowProfileModal(true);
                  }}
                >
                  <User size={18} />
                  Profile Settings
                </button>
                <button 
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Left Sidebar */}
        <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          {/* Create Knowledge */}
          <div className="sidebar-card">
            <h3>Create Knowledge Store</h3>
            <button className="primary-btn" onClick={() => document.getElementById('file-upload').click()}>
              <Upload size={18} />
              New Upload or Paste Note
            </button>
            <p className="hint-text">PDF, text, chat excerpts</p>
          </div>

          {/* Knowledge Graph Preview */}
          <div className="sidebar-card">
            <h3>Knowledge Graph</h3>
            <div className="graph-preview" onClick={() => setShowGraph(true)}>
              <div className="preview-nodes">
                <div className="node-dot high"></div>
                <div className="node-dot medium"></div>
                <div className="node-dot fading"></div>
                <div className="node-dot high"></div>
                <div className="node-dot medium"></div>
              </div>
              <div className="graph-legend-mini">
                <span className="legend-mini-item">
                  <span className="dot-mini high"></span> High
                </span>
                <span className="legend-mini-item">
                  <span className="dot-mini medium"></span> Medium
                </span>
                <span className="legend-mini-item">
                  <span className="dot-mini fading"></span> Fading
                </span>
              </div>
            </div>
            <button className="link-btn" onClick={() => setShowGraph(true)}>
              Open full graph &rarr;
            </button>
          </div>

          {/* Progress Score */}
          <div className="sidebar-card score-card">
            <h3>Progress</h3>
            <div className="score-display">
              <div className="score-number">{retentionScore}%</div>
              <div className="score-change">+3% this week</div>
            </div>
            <div className="score-bars">
              <div className="bar-item">
                <span>Mastered</span>
                <div className="bar"><div className="fill high" style={{width: '40%'}}></div></div>
              </div>
              <div className="bar-item">
                <span>Fading</span>
                <div className="bar"><div className="fill fading" style={{width: '25%'}}></div></div>
              </div>
              <div className="bar-item">
                <span>New</span>
                <div className="bar"><div className="fill medium" style={{width: '35%'}}></div></div>
              </div>
            </div>
          </div>

          {/* Knowledge Summary & Quizzes */}
          <div className="sidebar-card">
            <h3>Recent Topics</h3>
            <div className="topic-list">
              {topics.map(topic => (
                <div key={topic.id} className="topic-item">
                  <div className="topic-header">
                    <span className={`status-dot ${topic.status}`}></span>
                    <div className="topic-info">
                      <div className="topic-title">{topic.title}</div>
                      <div className="topic-time">{topic.lastReview}</div>
                    </div>
                  </div>
                  <div className="topic-actions">
                    <button className="action-btn">Summary</button>
                    <button className="action-btn">Practice</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Workspace */}
        <main className="dashboard-workspace">
          {/* Upload/Paste Panel */}
          <div className="workspace-card">
            <div className="card-header">
              <h2>Capture Knowledge</h2>
              <p>Drop your ideas here — we'll help them stay remembered.</p>
            </div>
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                <Upload size={16} /> Upload File
              </button>
              <button 
                className={`tab ${activeTab === 'paste' ? 'active' : ''}`}
                onClick={() => setActiveTab('paste')}
              >
                <FileText size={16} /> Paste Text
              </button>
            </div>
            
            {activeTab === 'upload' ? (
              <div className="upload-zone">
                <input 
                  type="file" 
                  id="file-upload" 
                  accept=".txt,.pdf"
                  onChange={handleFileUpload}
                  style={{display: 'none'}}
                />
                <label htmlFor="file-upload" className="upload-label">
                  <Upload size={48} />
                  <p>Drag and drop or click to upload</p>
                  <span className="upload-hint">PDF or TXT files</span>
                </label>
              </div>
            ) : (
              <textarea
                className="paste-area"
                placeholder="Paste your notes, articles, or chat excerpts here...\n\nRecommended: 200-400 words for optimal summary and quiz generation."
                value={uploadedContent}
                onChange={(e) => setUploadedContent(e.target.value)}
                rows={10}
              />
            )}
            
            <button 
              className="generate-btn"
              onClick={generateSummaryAndQuiz}
              disabled={generating || !uploadedContent}
            >
              {generating ? (
                <><div className="btn-spinner"></div> Generating...</>
              ) : (
                <>Generate Summary & Quiz</>
              )}
            </button>
          </div>

          {/* Auto Summary Panel */}
          {summary && (
            <div className="workspace-card summary-card">
              <div className="card-header">
                <h2>Summary: {summary.title}</h2>
              </div>
              <ul className="summary-bullets">
                {summary.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
              <div className="keyword-chips">
                {summary.keywords.map((keyword, i) => (
                  <span key={i} className="chip">{keyword}</span>
                ))}
              </div>
              <button className="primary-btn" onClick={addToKnowledgeStore}>
                Add to Knowledge Store
              </button>
            </div>
          )}

          {/* Recall Quiz Panel */}
          {quiz && (
            <div className="workspace-card quiz-card">
              <div className="card-header">
                <h2>Recall Quiz</h2>
                <p>Test your understanding with these questions</p>
              </div>
              {quiz.map((question, qIndex) => (
                <div key={qIndex} className="quiz-question">
                  <div className="question-text">
                    <strong>Q{qIndex + 1}:</strong> {question.q}
                  </div>
                  <div className="quiz-options">
                    {question.options.map((option, oIndex) => {
                      const isSelected = quizAnswers[qIndex] === oIndex;
                      const isCorrect = question.correctIndex === oIndex;
                      const showResult = quizResults[qIndex] !== undefined;
                      
                      return (
                        <button
                          key={oIndex}
                          className={`quiz-option ${
                            isSelected && showResult
                              ? isCorrect ? 'correct' : 'incorrect'
                              : showResult && isCorrect
                              ? 'correct'
                              : ''
                          }`}
                          onClick={() => handleQuizAnswer(qIndex, oIndex)}
                          disabled={showResult}
                        >
                          <span className="option-letter">{String.fromCharCode(65 + oIndex)}</span>
                          <span className="option-text">{option}</span>
                          {showResult && isSelected && (
                            isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />
                          )}
                          {showResult && !isSelected && isCorrect && (
                            <CheckCircle size={20} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {Object.keys(quizResults).length === quiz.length && (
                <button className="finish-btn" onClick={finishQuiz}>
                  Finish & Update Score
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Profile Settings Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Profile Settings</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowProfileModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="profile-name">Name *</label>
                <input
                  id="profile-name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className={profileErrors.name ? 'input-error' : ''}
                  placeholder="Enter your name"
                />
                {profileErrors.name && (
                  <span className="error-text">{profileErrors.name}</span>
                )}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="profile-email">Email *</label>
                <input
                  id="profile-email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className={profileErrors.email ? 'input-error' : ''}
                  placeholder="you@example.com"
                />
                {profileErrors.email && (
                  <span className="error-text">{profileErrors.email}</span>
                )}
              </div>

              {/* Phone Field */}
              <div className="form-group">
                <label htmlFor="profile-phone">Phone (Optional)</label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  className={profileErrors.phone ? 'input-error' : ''}
                  placeholder="+1 (555) 000-0000"
                />
                {profileErrors.phone && (
                  <span className="error-text">{profileErrors.phone}</span>
                )}
              </div>

              {/* Timezone Field */}
              <div className="form-group">
                <label htmlFor="profile-timezone">Timezone</label>
                <select
                  id="profile-timezone"
                  value={profileData.timezone}
                  onChange={(e) => handleProfileChange('timezone', e.target.value)}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Dubai">Dubai (GST)</option>
                  <option value="Australia/Sydney">Sydney (AEST)</option>
                </select>
              </div>

              {/* Notification Preferences */}
              <div className="form-section">
                <h3>Notification Preferences</h3>
                
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={profileData.notificationPreferences.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                    />
                    <span>Email notifications</span>
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={profileData.notificationPreferences.reviewReminders}
                      onChange={() => handleNotificationChange('reviewReminders')}
                    />
                    <span>Review reminders</span>
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={profileData.notificationPreferences.weeklyProgress}
                      onChange={() => handleNotificationChange('weeklyProgress')}
                    />
                    <span>Weekly progress reports</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowProfileModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={saveProfile}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Knowledge Graph Modal */}
      {showGraph && (
        <div className="modal-overlay-graph" onClick={() => setShowGraph(false)}>
          <div className="modal-content-graph" onClick={(e) => e.stopPropagation()}>
            <KnowledgeGraph topics={topics} onClose={() => setShowGraph(false)} />
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Dashboard;