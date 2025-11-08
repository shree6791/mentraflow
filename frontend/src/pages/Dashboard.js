import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Upload, FileText, BarChart3, Brain, CheckCircle, XCircle, ChevronDown, ChevronUp, Menu, X, Search, Filter, Eye, PenTool, TrendingUp, Clock, Settings, CreditCard } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import KnowledgeGraph from '../components/KnowledgeGraph';
import Tooltip from '../components/Tooltip';
import '../Dashboard.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ========================================
// DASHBOARD DATA - Fetched from API
// ========================================

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
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuizResults, setShowQuizResults] = useState(false);
  
  // Phase 2: Recall Tasks & Quiz Customization
  const [recallTasks, setRecallTasks] = useState(RECALL_TASKS);
  const [showRecallQuiz, setShowRecallQuiz] = useState(false);
  const [currentRecallTask, setCurrentRecallTask] = useState(null);
  const [recallQuizData, setRecallQuizData] = useState(null);
  const [showQuizCustomization, setShowQuizCustomization] = useState(false);
  const [quizConfig, setQuizConfig] = useState({
    questionCount: 5,
    difficulty: 'balanced',
    focusArea: 'all'
  });
  
  // Phase 3: Gamification & Onboarding
  const [streak, setStreak] = useState(4); // Days in a row
  const [xp, setXp] = useState(285); // Total XP
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [hasUploadedFirstNote, setHasUploadedFirstNote] = useState(false);
  
  // Library Item Detail Modal
  const [selectedLibraryItem, setSelectedLibraryItem] = useState(null);
  const [libraryModalTab, setLibraryModalTab] = useState('summary'); // summary | quiz | performance
  
  // Generated Content Modal
  const [showGeneratedModal, setShowGeneratedModal] = useState(false);
  const [generatedContentTab, setGeneratedContentTab] = useState('summary'); // summary | quiz
  
  // FAB Capture Modal
  const [showFABCapture, setShowFABCapture] = useState(false);
  const [fabAnimatePulse, setFabAnimatePulse] = useState(true); // Pulse on first visit
  
  // Priority Modal
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [priorityModalPage, setPriorityModalPage] = useState(1);
  const priorityModalItemsPerPage = 5;
  
  // Quick Filters and Sorting
  const [quickFilter, setQuickFilter] = useState('all'); // all, fading, due-soon, strong
  const [sortBy, setSortBy] = useState('priority'); // priority, recent, score
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Pagination for Library
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Priority Review Session
  const [showReviewSession, setShowReviewSession] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  
  // Priority Section Pagination
  const [priorityPage, setPriorityPage] = useState(1);
  const priorityItemsPerPage = 2;
  
  // Get items that need review (based on retention status)
  const itemsNeedingReview = libraryItems.filter(item => 
    item.retention === 'fading' || item.retention === 'medium'
  ).sort((a, b) => {
    // Sort by urgency: fading first, then medium
    if (a.retention === 'fading' && b.retention !== 'fading') return -1;
    if (a.retention !== 'fading' && b.retention === 'fading') return 1;
    return 0;
  });
  
  // Paginate priority items
  const totalPriorityPages = Math.ceil(itemsNeedingReview.length / priorityItemsPerPage);
  const priorityStartIndex = (priorityPage - 1) * priorityItemsPerPage;
  const priorityEndIndex = priorityStartIndex + priorityItemsPerPage;
  const paginatedPriorityItems = itemsNeedingReview.slice(priorityStartIndex, priorityEndIndex);
  
  const estimatedReviewTime = itemsNeedingReview.length * 3; // 3 min per item
  
  // Streak progress calculation
  const daysToNextMilestone = 5 - (streak % 5);
  const streakProgress = ((streak % 5) / 5) * 100;
  
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

  // Listen for profile settings event from AppHeader
  useEffect(() => {
    const handleOpenProfileSettings = () => {
      setShowProfileModal(true);
    };

    window.addEventListener('openProfileSettings', handleOpenProfileSettings);
    return () => window.removeEventListener('openProfileSettings', handleOpenProfileSettings);
  }, []);

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
      
      // Phase 3: Check onboarding
      if (!hasUploadedFirstNote) {
        setHasUploadedFirstNote(true);
        setOnboardingStep(2);
      }
      
      // Show the generated content modal
      setGeneratedContentTab('summary');
      setShowGeneratedModal(true);
      
      // Close the FAB capture modal after generation
      setShowFABCapture(false);
      
      // Stop pulse animation after first use
      setFabAnimatePulse(false);
      
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
    
    // Phase 3: Award XP
    const xpGain = 10;
    setXp(prev => prev + xpGain);
    
    // Motivational message based on performance
    let message = '';
    if (percentage === 100) {
      message = `🎉 Perfect score! +${xpGain} XP. You've mastered this!`;
    } else if (percentage >= 80) {
      message = `✅ Great work! ${percentage}% correct. +${xpGain} XP`;
    } else if (percentage >= 60) {
      message = `🧠 Good effort! ${percentage}% correct. +${xpGain} XP. Keep practicing!`;
    } else {
      message = `💪 ${percentage}% correct. +${xpGain} XP. Each recall strengthens your memory!`;
    }
    
    showToast(message);
  };

  const nextQuestion = () => {
    const activeQuiz = recallQuizData || quiz;
    if (activeQuiz && currentQuestionIndex < activeQuiz.length - 1) {
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

  // Phase 2: Recall Tasks Handlers
  const startRecallTask = (task) => {
    setCurrentRecallTask(task);
    setRecallQuizData(QUICK_RECALL_QUIZ[task.title]);
    setQuizAnswers({});
    setQuizResults({});
    setCurrentQuestionIndex(0);
    setShowRecallQuiz(true);
  };

  const submitRecallQuiz = () => {
    const results = {};
    recallQuizData.forEach((q, idx) => {
      results[idx] = quizAnswers[idx] === q.correctIndex;
    });
    setQuizResults(results);
    
    const score = Object.values(results).filter(Boolean).length;
    const percentage = Math.round((score / recallQuizData.length) * 100);
    
    // Update mastery score
    const change = percentage >= 70 ? 3 : 1;
    setMasteryScore(prev => Math.min(100, Math.max(0, prev + change)));
    setWeeklyChange(prev => prev + change);
    
    // Phase 3: Award XP for recall
    const xpGain = 5;
    setXp(prev => prev + xpGain);
    
    // Remove completed task
    setRecallTasks(prev => prev.filter(t => t.id !== currentRecallTask.id));
    
    showToast(`Great recall! ${percentage}% correct. +${xpGain} XP 🧠`);
    
    // Close modal after showing results briefly
    setTimeout(() => {
      setShowRecallQuiz(false);
      setCurrentRecallTask(null);
      setRecallQuizData(null);
    }, 2000);
  };

  const generateCustomQuiz = () => {
    setShowQuizCustomization(false);
    setGenerating(true);
    
    // Simulate API call with custom parameters
    setTimeout(() => {
      // Generate quiz based on configuration
      let questions = [...SAMPLE_QUIZ];
      
      // Adjust number of questions
      if (quizConfig.questionCount === 10) {
        questions = [...questions, ...SAMPLE_QUIZ.slice(0, 5)]; // Duplicate some
      } else if (quizConfig.questionCount === 15) {
        questions = [...questions, ...SAMPLE_QUIZ, ...SAMPLE_QUIZ.slice(0, 5)];
      }
      
      questions = questions.slice(0, quizConfig.questionCount);
      
      setSummary(SAMPLE_SUMMARY);
      setQuiz(questions);
      setQuizAnswers({});
      setQuizResults({});
      setCurrentQuestionIndex(0);
      setShowQuizResults(false);
      setGenerating(false);
      showToast(`Custom quiz generated! (${quizConfig.questionCount} questions, ${quizConfig.difficulty})`);
    }, 2000);
  };

  // Library Item Detail Modal Handlers
  const openLibraryItem = (item, tab = 'summary') => {
    setSelectedLibraryItem(item);
    setLibraryModalTab(tab);
  };

  const closeLibraryItem = () => {
    setSelectedLibraryItem(null);
    setLibraryModalTab('summary');
    setQuizAnswers({});
    setQuizResults({});
    setCurrentQuestionIndex(0);
  };
  
  // Start Priority Review Session
  const startReviewSession = () => {
    if (itemsNeedingReview.length > 0) {
      setCurrentReviewIndex(0);
      openLibraryItem(itemsNeedingReview[0], 'quiz');
    }
  };
  
  // Move to next item in review session
  const nextReviewItem = () => {
    if (currentReviewIndex < itemsNeedingReview.length - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1);
      openLibraryItem(itemsNeedingReview[currentReviewIndex + 1], 'quiz');
    } else {
      // Completed all reviews
      showToast(`🎉 Review session complete! You reviewed ${itemsNeedingReview.length} items.`);
      setSelectedLibraryItem(null);
      setCurrentReviewIndex(0);
    }
  };

  // Filter library items
  const filteredLibraryItems = libraryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    
    // Apply quick filter
    let matchesQuickFilter = true;
    if (quickFilter === 'fading') {
      matchesQuickFilter = item.retention === 'fading';
    } else if (quickFilter === 'due-soon') {
      matchesQuickFilter = item.nextReviewDays !== null && item.nextReviewDays <= 2;
    } else if (quickFilter === 'strong') {
      matchesQuickFilter = item.retention === 'high';
    }
    
    return matchesSearch && matchesFilter && matchesQuickFilter;
  });
  
  // Sort library items
  const sortedLibraryItems = [...filteredLibraryItems].sort((a, b) => {
    if (sortBy === 'priority') {
      // Sort by retention: fading > medium > high
      const retentionOrder = { fading: 0, medium: 1, high: 2, null: 3 };
      return retentionOrder[a.retention] - retentionOrder[b.retention];
    } else if (sortBy === 'recent') {
      return new Date(b.uploadDate) - new Date(a.uploadDate);
    } else if (sortBy === 'score') {
      return (b.quizScore || 0) - (a.quizScore || 0);
    }
    return 0;
  });
  
  // Paginate library items
  const totalPages = Math.ceil(sortedLibraryItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLibraryItems = sortedLibraryItems.slice(startIndex, endIndex);
  
  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, quickFilter, sortBy]);

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
    <AppLayout 
      title="Your Learning Dashboard"
      subtitle="Track progress, reinforce knowledge, and master retention"
    >
      {/* Stats Banner */}
      <div className="dashboard-stats-banner">
        <div className="stat-banner-item">
          <div className="progress-ring-container">
            <svg className="progress-ring" width="60" height="60">
              <circle
                className="progress-ring-circle-bg"
                stroke="#E0E0E0"
                strokeWidth="5"
                fill="transparent"
                r="25"
                cx="30"
                cy="30"
              />
              <circle
                className="progress-ring-circle mastery-ring"
                stroke="url(#masteryGradient)"
                strokeWidth="5"
                fill="transparent"
                r="25"
                cx="30"
                cy="30"
                strokeDasharray={`${(masteryScore / 100) * 157} 157`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="masteryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0E7C7B" />
                  <stop offset="100%" stopColor="#06D6A0" />
                </linearGradient>
              </defs>
              <text x="30" y="34" textAnchor="middle" className="progress-ring-text">
                {masteryScore}%
              </text>
            </svg>
          </div>
          <div className="stat-banner-content">
            <h3>Overall Mastery</h3>
            <p className="stat-context">
              {weeklyChange >= 0 ? '↑' : '↓'} {Math.abs(weeklyChange)}% this week
            </p>
          </div>
        </div>

        <div className="stat-banner-item">
          <div className="progress-ring-container">
            <svg className="progress-ring" width="60" height="60">
              <circle
                className="progress-ring-circle-bg"
                stroke="#E0E0E0"
                strokeWidth="5"
                fill="transparent"
                r="25"
                cx="30"
                cy="30"
              />
              <circle
                className="progress-ring-circle streak-ring"
                stroke="url(#streakGradient)"
                strokeWidth="5"
                fill="transparent"
                r="25"
                cx="30"
                cy="30"
                strokeDasharray={`${((streak % 7) / 7) * 157} 157`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF6B6B" />
                  <stop offset="100%" stopColor="#FFD166" />
                </linearGradient>
              </defs>
              <text x="30" y="30" textAnchor="middle" className="progress-ring-text-large">
                {streak}
              </text>
              <text x="30" y="40" textAnchor="middle" className="progress-ring-text-small">
                days
              </text>
            </svg>
          </div>
          <div className="stat-banner-content">
            <h3>Current Streak</h3>
            <p className="stat-context">{7 - (streak % 7)} days to weekly goal</p>
          </div>
        </div>

        <div className="stat-banner-item">
          <div className="progress-ring-container">
            <svg className="progress-ring" width="60" height="60">
              <circle
                className="progress-ring-circle-bg"
                stroke="#E0E0E0"
                strokeWidth="5"
                fill="transparent"
                r="25"
                cx="30"
                cy="30"
              />
              <circle
                className="progress-ring-circle xp-ring"
                stroke="url(#xpGradient)"
                strokeWidth="5"
                fill="transparent"
                r="25"
                cx="30"
                cy="30"
                strokeDasharray={`${((xp % 500) / 500) * 157} 157`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1FA6C0" />
                  <stop offset="100%" stopColor="#FFC130" />
                </linearGradient>
              </defs>
              <text x="30" y="34" textAnchor="middle" className="progress-ring-text">
                {xp}
              </text>
            </svg>
          </div>
          <div className="stat-banner-content">
            <h3>Total XP</h3>
            <p className="stat-context">{500 - (xp % 500)} XP to next level</p>
          </div>
        </div>

        {/* Priority Widget - Clickable */}
        <div 
          className="stat-banner-item priority-widget-card"
          onClick={() => {
            setPriorityModalPage(1); // Reset to page 1
            setShowPriorityModal(true);
          }}
          style={{cursor: 'pointer'}}
        >
          <div className="progress-ring-container">
            <svg className="progress-ring" width="60" height="60">
              <defs>
                <linearGradient id="priorityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EF476F" />
                  <stop offset="100%" stopColor="#FFD166" />
                </linearGradient>
              </defs>
              <circle
                cx="30"
                cy="30"
                r="25"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="5"
              />
              <circle
                className="progress-ring-circle"
                cx="30"
                cy="30"
                r="25"
                fill="none"
                stroke="url(#priorityGradient)"
                strokeWidth="5"
                strokeDasharray={`${(itemsNeedingReview.filter(i => i.retention === 'fading').length / Math.max(itemsNeedingReview.length, 1)) * 157} 157`}
                strokeLinecap="round"
              />
              <text x="30" y="30" className="progress-ring-text-large" textAnchor="middle" dominantBaseline="middle">
                {itemsNeedingReview.length}
              </text>
            </svg>
          </div>
          <div className="stat-banner-content">
            <h3>Priority Today</h3>
            <p className="stat-context">
              {itemsNeedingReview.filter(i => i.retention === 'fading').length > 0 
                ? `${itemsNeedingReview.filter(i => i.retention === 'fading').length} critical ${itemsNeedingReview.filter(i => i.retention === 'fading').length === 1 ? 'item' : 'items'} need review`
                : `${itemsNeedingReview.length} items need review`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Main Focus Area - Smart Priority Flow */}
      <div className="dashboard-main-focus">
        
        {/* My Knowledge Library - Main Content */}
        <section className="dashboard-section library-section-main">
          <div className="section-header">
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <h2>My Knowledge Library</h2>
              <Tooltip content="All your captured knowledge organized by retention strength. Use filters to focus on specific topics or sort by priority." position="right" />
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <button className="btn-icon-text" onClick={() => setShowFilterModal(true)}>
                <Filter size={18} /> Filters
              </button>
              <button className="btn-icon-text" onClick={() => navigate('/knowledge-graph')}>
                <Brain size={18} /> View Graph
              </button>
            </div>
          </div>
          
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
          </div>
          
          {filteredLibraryItems.length === 0 ? (
            <div className="library-empty-state">
              <FileText size={48} className="empty-icon" />
              <h3>Start capturing what matters</h3>
              <p>Click "Capture New Knowledge" above to begin building your knowledge base.</p>
              <button 
                className="btn-primary"
                onClick={() => setIsCaptureExpanded(true)}
                style={{marginTop: '1rem'}}
              >
                <Upload size={18} /> Start Capturing
              </button>
            </div>
          ) : (
            <>
              <div className="library-list">
                {paginatedLibraryItems.map(item => (
                  <div key={item.id} className={`library-item retention-${item.retention || 'none'}`}>
                    <div className="library-item-header">
                      <h3>{item.title}</h3>
                    </div>
                    
                    {/* Status Chips Row */}
                    <div className="library-item-meta-row">
                      {item.retention && (
                        <span className={`retention-chip retention-chip-${item.retention}`}>
                          {item.retention === 'high' && '🟢 Strong'}
                          {item.retention === 'medium' && '🟡 Review Soon'}
                          {item.retention === 'fading' && '🔴 Fading'}
                        </span>
                      )}
                      
                      {item.nextReview && (
                        <span className={`countdown-chip ${item.nextReviewDays < 0 ? 'overdue' : item.nextReviewDays <= 1 ? 'urgent' : 'normal'}`}>
                          <Clock size={12} />
                          {item.nextReview}
                        </span>
                      )}
                    </div>
                    
                    {/* Filename Row */}
                    <div className="library-item-filename-row">
                      <span className="filename-text">
                        {item.filename}
                      </span>
                    </div>
                    
                    {/* Quick Action Links Row */}
                    <div className="library-item-actions-row">
                      <div className="quick-action-links">
                        <button className="link-btn-compact" onClick={() => openLibraryItem(item, 'summary')}>
                          <Eye size={12} /> Summary
                        </button>
                        {item.quizScore !== null && (
                          <button className="link-btn-compact" onClick={() => openLibraryItem(item, 'performance')}>
                            <TrendingUp size={12} /> Score: {item.quizScore}%
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="library-item-actions">
                      {/* Primary Action - Color coded by urgency */}
                      {item.retention === 'fading' ? (
                        <button className="action-btn action-primary action-urgent" onClick={() => openLibraryItem(item, 'quiz')}>
                          <Brain size={18} /> Review Now
                        </button>
                      ) : item.retention === 'medium' ? (
                        <button className="action-btn action-primary action-warning" onClick={() => openLibraryItem(item, 'quiz')}>
                          <Brain size={18} /> Review Soon
                        </button>
                      ) : (
                        <button className="action-btn action-success" onClick={() => openLibraryItem(item, 'quiz')}>
                          <Brain size={18} /> Take Quiz
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  
                  <div className="pagination-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
              
              <div className="library-info">
                <p>Showing {startIndex + 1}-{Math.min(endIndex, filteredLibraryItems.length)} of {filteredLibraryItems.length} items</p>
                <p className="autosave-text">💾 Your work is saved automatically</p>
              </div>
            </>
          )}
        </section>

      </div>
        

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

      {/* Recall Quiz Modal - Phase 2 */}
      {showRecallQuiz && recallQuizData && (
        <div className="modal-overlay" onClick={() => setShowRecallQuiz(false)}>
          <div className="modal-content recall-quiz-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Quick Recall: {currentRecallTask?.title}</h2>
              <button className="modal-close" onClick={() => setShowRecallQuiz(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="quiz-progress-bar">
                <div 
                  className="quiz-progress-fill"
                  style={{width: `${((currentQuestionIndex + 1) / recallQuizData.length) * 100}%`}}
                ></div>
              </div>
              
              <div className="quiz-question">
                <p className="question-number">Question {currentQuestionIndex + 1} of {recallQuizData.length}</p>
                <h3>{recallQuizData[currentQuestionIndex].q}</h3>
                <div className="quiz-options">
                  {recallQuizData[currentQuestionIndex].options.map((option, idx) => (
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
                {currentQuestionIndex < recallQuizData.length - 1 ? (
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
                    onClick={submitRecallQuiz}
                    disabled={Object.keys(quizAnswers).length !== recallQuizData.length}
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Customization Modal - Phase 2 */}
      {showQuizCustomization && (
        <div className="modal-overlay" onClick={() => setShowQuizCustomization(false)}>
          <div className="modal-content quiz-custom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Customize Your Quiz</h2>
              <button className="modal-close" onClick={() => setShowQuizCustomization(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <form className="quiz-custom-form">
                <div className="form-group">
                  <label>Number of Questions</label>
                  <select
                    value={quizConfig.questionCount}
                    onChange={(e) => setQuizConfig({...quizConfig, questionCount: parseInt(e.target.value)})}
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Difficulty Level</label>
                  <div className="difficulty-options">
                    <button
                      type="button"
                      className={`difficulty-btn ${quizConfig.difficulty === 'easy' ? 'active' : ''}`}
                      onClick={() => setQuizConfig({...quizConfig, difficulty: 'easy'})}
                    >
                      🟢 Easy
                      <span className="difficulty-desc">60% recall, 30% conceptual, 10% applied</span>
                    </button>
                    <button
                      type="button"
                      className={`difficulty-btn ${quizConfig.difficulty === 'balanced' ? 'active' : ''}`}
                      onClick={() => setQuizConfig({...quizConfig, difficulty: 'balanced'})}
                    >
                      🟡 Balanced
                      <span className="difficulty-desc">Mixed difficulty across all types</span>
                    </button>
                    <button
                      type="button"
                      className={`difficulty-btn ${quizConfig.difficulty === 'advanced' ? 'active' : ''}`}
                      onClick={() => setQuizConfig({...quizConfig, difficulty: 'advanced'})}
                    >
                      🔴 Advanced
                      <span className="difficulty-desc">30% recall, 40% conceptual, 30% applied</span>
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Focus Area</label>
                  <select
                    value={quizConfig.focusArea}
                    onChange={(e) => setQuizConfig({...quizConfig, focusArea: e.target.value})}
                  >
                    <option value="all">All Topics</option>
                    {topics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.title}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setShowQuizCustomization(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={() => {
                      setShowQuizCustomization(false);
                      showToast('Quiz settings saved! Use "Generate Summary & Quiz" to create content.');
                    }}
                  >
                    <Filter size={18} /> Save Settings
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Tooltip - Phase 3 */}
      {showOnboarding && (
        <div className="onboarding-overlay">
          <div className="onboarding-tooltip">
            <button className="onboarding-close" onClick={() => setShowOnboarding(false)}>
              <X size={20} />
            </button>
            
            {onboardingStep === 1 && (
              <div className="onboarding-content">
                <h3>👋 Welcome to MentraFlow!</h3>
                <p>Let's get you started with building your knowledge base.</p>
                <div className="onboarding-steps">
                  <div className="onboarding-step active">
                    <span className="step-number">1</span>
                    <div>
                      <h4>Upload your first note</h4>
                      <p>Add any document, article, or notes you want to remember</p>
                    </div>
                  </div>
                  <div className="onboarding-step">
                    <span className="step-number">2</span>
                    <div>
                      <h4>Watch your knowledge graph grow</h4>
                      <p>See how concepts connect and track your retention</p>
                    </div>
                  </div>
                </div>
                <button className="btn-primary" onClick={() => setShowOnboarding(false)}>
                  Got it! Let's start
                </button>
              </div>
            )}
            
            {onboardingStep === 2 && hasUploadedFirstNote && (
              <div className="onboarding-content">
                <h3>🎉 Great! You've uploaded your first note</h3>
                <p>Now let's see how your memory graph evolves as you learn.</p>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    setShowOnboarding(false);
                  }}
                >
                  View Knowledge Graph
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowOnboarding(false)}
                  style={{marginTop: '0.5rem'}}
                >
                  I'll explore later
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generated Content Modal */}
      {showGeneratedModal && summary && quiz && (
        <div className="modal-overlay" onClick={() => setShowGeneratedModal(false)}>
          <div className="modal-content library-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Generated Summary & Quiz</h2>
                <p className="modal-subtitle">Review your generated content</p>
              </div>
              <button className="modal-close" onClick={() => setShowGeneratedModal(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="library-modal-tabs">
              <button
                className={`library-tab ${generatedContentTab === 'summary' ? 'active' : ''}`}
                onClick={() => setGeneratedContentTab('summary')}
              >
                <Eye size={16} /> Summary
              </button>
              <button
                className={`library-tab ${generatedContentTab === 'quiz' ? 'active' : ''}`}
                onClick={() => setGeneratedContentTab('quiz')}
              >
                <Brain size={16} /> Quiz Preview
              </button>
            </div>

            <div className="modal-body library-modal-body">
              {/* Summary Tab */}
              {generatedContentTab === 'summary' && (
                <div className="library-tab-content">
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
                  <div className="modal-actions" style={{marginTop: '1.5rem', display: 'flex', gap: '0.75rem'}}>
                    <button 
                      className="btn-primary"
                      onClick={() => setGeneratedContentTab('quiz')}
                    >
                      <Brain size={18} /> Take Quiz Now
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => setShowGeneratedModal(false)}
                    >
                      Save & Close
                    </button>
                  </div>
                </div>
              )}

              {/* Quiz Preview Tab */}
              {generatedContentTab === 'quiz' && (
                <div className="library-tab-content">
                  {!showQuizResults ? (
                    <>
                      <div className="quiz-progress-bar">
                        <div 
                          className="quiz-progress-fill"
                          style={{width: `${((currentQuestionIndex + 1) / quiz.length) * 100}%`}}
                        ></div>
                      </div>
                      
                      <div className="quiz-question">
                        <p className="question-number">Question {currentQuestionIndex + 1} of {quiz.length}</p>
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
                            Next Question
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
                    </>
                  ) : (
                    <div className="quiz-results">
                      <div className="results-summary">
                        <h3>Quiz Complete!</h3>
                        <div className="score-display">
                          {Object.values(quizResults).filter(Boolean).length} / {quiz.length}
                        </div>
                        <p className="score-percentage">
                          {Math.round((Object.values(quizResults).filter(Boolean).length / quiz.length) * 100)}%
                        </p>
                      </div>
                      <div className="results-detail">
                        {quiz.map((q, idx) => (
                          <div key={idx} className="result-item">
                            <div className="result-header">
                              {quizResults[idx] ? (
                                <CheckCircle size={20} className="icon-success" />
                              ) : (
                                <XCircle size={20} className="icon-error" />
                              )}
                              <span className="result-question">Question {idx + 1}</span>
                            </div>
                            <p className="question-text">{q.q}</p>
                            <p className="correct-answer">
                              ✓ Correct: {q.options[q.correctIndex]}
                            </p>
                            {!quizResults[idx] && (
                              <p className="your-answer">
                                ✗ Your answer: {q.options[quizAnswers[idx]]}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="motivation-message">
                        {Math.round((Object.values(quizResults).filter(Boolean).length / quiz.length) * 100) >= 80 ? (
                          <p className="message-good">✅ Great work! You're building strong retention.</p>
                        ) : (
                          <p className="message-review">🧠 Keep practicing — each recall makes your memory stronger.</p>
                        )}
                      </div>
                      <button 
                        className="btn-primary"
                        onClick={() => {
                          setQuizAnswers({});
                          setQuizResults({});
                          setShowQuizResults(false);
                          setCurrentQuestionIndex(0);
                        }}
                      >
                        Retake Quiz
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Library Item Detail Modal */}
      {selectedLibraryItem && (
        <div className="modal-overlay" onClick={closeLibraryItem}>
          <div className="modal-content library-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedLibraryItem.title}</h2>
                <p className="modal-subtitle">{selectedLibraryItem.filename}</p>
              </div>
              <button className="modal-close" onClick={closeLibraryItem}>
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="library-modal-tabs">
              <button
                className={`library-tab ${libraryModalTab === 'summary' ? 'active' : ''}`}
                onClick={() => setLibraryModalTab('summary')}
              >
                <Eye size={16} /> Summary
              </button>
              <button
                className={`library-tab ${libraryModalTab === 'quiz' ? 'active' : ''}`}
                onClick={() => setLibraryModalTab('quiz')}
                disabled={!selectedLibraryItem.hasQuiz}
              >
                <Brain size={16} /> Take Quiz
              </button>
              <button
                className={`library-tab ${libraryModalTab === 'performance' ? 'active' : ''}`}
                onClick={() => setLibraryModalTab('performance')}
                disabled={selectedLibraryItem.quizScore === null}
              >
                <BarChart3 size={16} /> Performance
              </button>
            </div>

            <div className="modal-body library-modal-body">
              {/* Summary Tab */}
              {libraryModalTab === 'summary' && (
                <div className="library-tab-content">
                  <div className="summary-content">
                    <h3>{SAMPLE_SUMMARY.title}</h3>
                    <p className="summary-text">{SAMPLE_SUMMARY.content}</p>
                    {SAMPLE_SUMMARY.bullets && SAMPLE_SUMMARY.bullets.length > 0 && (
                      <div className="summary-bullets">
                        <h4>Key Takeaways:</h4>
                        <ul>
                          {SAMPLE_SUMMARY.bullets.map((bullet, idx) => (
                            <li key={idx}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {SAMPLE_SUMMARY.keywords && SAMPLE_SUMMARY.keywords.length > 0 && (
                      <div className="summary-keywords">
                        {SAMPLE_SUMMARY.keywords.map((keyword, idx) => (
                          <span key={idx} className="keyword-tag">{keyword}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quiz Tab */}
              {libraryModalTab === 'quiz' && selectedLibraryItem.hasQuiz && (
                <div className="library-tab-content">
                  {!showQuizResults ? (
                    <>
                      <div className="quiz-progress-bar">
                        <div 
                          className="quiz-progress-fill"
                          style={{width: `${((currentQuestionIndex + 1) / SAMPLE_QUIZ.length) * 100}%`}}
                        ></div>
                      </div>
                      
                      <div className="quiz-question">
                        <p className="question-number">Question {currentQuestionIndex + 1} of {SAMPLE_QUIZ.length}</p>
                        <h3>{SAMPLE_QUIZ[currentQuestionIndex].q}</h3>
                        <div className="quiz-options">
                          {SAMPLE_QUIZ[currentQuestionIndex].options.map((option, idx) => (
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
                        {currentQuestionIndex < SAMPLE_QUIZ.length - 1 ? (
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
                            disabled={Object.keys(quizAnswers).length !== SAMPLE_QUIZ.length}
                          >
                            Submit Quiz
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="quiz-results-content">
                      <div className="results-summary">
                        <div className="results-score">
                          <h3>{Math.round((Object.values(quizResults).filter(Boolean).length / SAMPLE_QUIZ.length) * 100)}%</h3>
                          <p>{Object.values(quizResults).filter(Boolean).length} out of {SAMPLE_QUIZ.length} correct</p>
                        </div>
                        <div className="results-message">
                          {Object.values(quizResults).filter(Boolean).length === SAMPLE_QUIZ.length ? (
                            <p className="message-success">🎉 Perfect score! You've mastered this topic.</p>
                          ) : Object.values(quizResults).filter(Boolean).length >= SAMPLE_QUIZ.length * 0.7 ? (
                            <p className="message-good">✅ Great work! You're building strong retention.</p>
                          ) : (
                            <p className="message-review">🧠 Keep practicing — each recall makes your memory stronger.</p>
                          )}
                        </div>
                      </div>
                      <button 
                        className="btn-primary"
                        onClick={() => {
                          setQuizAnswers({});
                          setQuizResults({});
                          setShowQuizResults(false);
                          setCurrentQuestionIndex(0);
                        }}
                      >
                        Retake Quiz
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Performance Tab */}
              {libraryModalTab === 'performance' && selectedLibraryItem.quizScore !== null && (
                <div className="library-tab-content">
                  <div className="performance-overview">
                    <div className="perf-stat-card">
                      <h4>Current Score</h4>
                      <div className="perf-score">{selectedLibraryItem.quizScore}%</div>
                      <span className={`retention-badge retention-${selectedLibraryItem.retention}`}>
                        {selectedLibraryItem.retention === 'high' ? '🟢 High Retention' : 
                         selectedLibraryItem.retention === 'medium' ? '🟡 Medium Retention' : 
                         '🔴 Needs Review'}
                      </span>
                    </div>
                    
                    <div className="perf-info-card">
                      <h4>Quiz History</h4>
                      <p>Total attempts: {selectedLibraryItem.hasQuiz ? '3' : '0'}</p>
                      <p>Last reviewed: {selectedLibraryItem.lastReview}</p>
                      <p>Uploaded: {new Date(selectedLibraryItem.uploadDate).toLocaleDateString()}</p>
                    </div>

                    {selectedLibraryItem.retention === 'fading' && (
                      <div className="perf-warning">
                        ⚠️ This topic needs reinforcement soon. Review the summary or retake the quiz to strengthen retention.
                      </div>
                    )}

                    <button 
                      className="btn-primary"
                      onClick={() => setLibraryModalTab('quiz')}
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

      {/* Floating Action Button (FAB) */}
      <button 
        className={`fab-button ${fabAnimatePulse ? 'fab-pulse' : ''}`}
        onClick={() => setShowFABCapture(true)}
        title="Capture New Knowledge"
      >
        <Upload size={24} />
      </button>

      {/* FAB Capture Modal */}
      {showFABCapture && (
        <div className="modal-overlay" onClick={() => setShowFABCapture(false)}>
          <div className="modal-content fab-capture-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Capture New Knowledge</h2>
              <button className="modal-close" onClick={() => setShowFABCapture(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="fab-capture-header">
                <button 
                  className="btn-customize-small"
                  onClick={() => {
                    setShowQuizCustomization(true);
                    setShowFABCapture(false);
                  }}
                  title="Customize quiz settings"
                >
                  <Filter size={16} /> Customize Quiz
                </button>
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
                    id="fab-file-upload"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="fab-file-upload" className="upload-label">
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
                style={{marginTop: '1rem'}}
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
            </div>
          </div>
        </div>
      )}

      {/* Priority Modal */}
      {showPriorityModal && (
        <div className="modal-overlay" onClick={() => setShowPriorityModal(false)}>
          <div className="modal-content priority-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>🎯 Your Priority Today</h2>
                <p className="modal-subtitle">
                  {itemsNeedingReview.length} items • {estimatedReviewTime} min estimated
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowPriorityModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body priority-modal-body">
              {itemsNeedingReview.length > 0 ? (
                <>
                  <div className="library-list">
                    {itemsNeedingReview
                      .slice((priorityModalPage - 1) * priorityModalItemsPerPage, priorityModalPage * priorityModalItemsPerPage)
                      .map(item => (
                      <div key={item.id} className={`library-item retention-${item.retention || 'none'}`}>
                        <div className="library-item-header">
                          <h3>{item.title}</h3>
                        </div>
                        
                        {/* Unified Meta Row - Same as Library */}
                        <div className="library-item-meta-row">
                          {item.retention && (
                            <span className={`retention-chip retention-chip-${item.retention}`}>
                              {item.retention === 'high' && '🟢 Strong'}
                              {item.retention === 'medium' && '🟡 Review Soon'}
                              {item.retention === 'fading' && '🔴 Fading'}
                            </span>
                          )}
                          
                          {item.nextReview && (
                            <span className={`countdown-chip ${item.nextReviewDays < 0 ? 'overdue' : item.nextReviewDays <= 1 ? 'urgent' : 'normal'}`}>
                              <Clock size={12} />
                              {item.nextReview}
                            </span>
                          )}
                          
                          <span className="filename-text">
                            {item.filename}
                          </span>
                          
                          {/* Quick Action Links */}
                          <div className="quick-action-links">
                            <button className="link-btn-compact" onClick={() => {
                              setShowPriorityModal(false);
                              openLibraryItem(item, 'summary');
                            }}>
                              <Eye size={12} /> Summary
                            </button>
                            {item.quizScore !== null && (
                              <button className="link-btn-compact" onClick={() => {
                                setShowPriorityModal(false);
                                openLibraryItem(item, 'performance');
                              }}>
                                <TrendingUp size={12} /> Score: {item.quizScore}%
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="library-item-actions">
                          {item.retention === 'fading' ? (
                            <button className="action-btn action-primary action-urgent" onClick={() => {
                              setShowPriorityModal(false);
                              openLibraryItem(item, 'quiz');
                            }}>
                              <Brain size={18} /> Review Now
                            </button>
                          ) : item.retention === 'medium' ? (
                            <button className="action-btn action-primary action-warning" onClick={() => {
                              setShowPriorityModal(false);
                              openLibraryItem(item, 'quiz');
                            }}>
                              <Brain size={18} /> Review Soon
                            </button>
                          ) : (
                            <button className="action-btn action-success" onClick={() => {
                              setShowPriorityModal(false);
                              openLibraryItem(item, 'quiz');
                            }}>
                              <Brain size={18} /> Take Quiz
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  {itemsNeedingReview.length > priorityModalItemsPerPage && (
                    <div className="pagination-controls" style={{marginTop: '1.5rem', marginBottom: '1rem'}}>
                      <button 
                        className="pagination-btn"
                        onClick={() => setPriorityModalPage(prev => Math.max(1, prev - 1))}
                        disabled={priorityModalPage === 1}
                      >
                        ← Previous
                      </button>
                      <span className="pagination-info">
                        Page {priorityModalPage} of {Math.ceil(itemsNeedingReview.length / priorityModalItemsPerPage)}
                      </span>
                      <button 
                        className="pagination-btn"
                        onClick={() => setPriorityModalPage(prev => Math.min(Math.ceil(itemsNeedingReview.length / priorityModalItemsPerPage), prev + 1))}
                        disabled={priorityModalPage === Math.ceil(itemsNeedingReview.length / priorityModalItemsPerPage)}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                  
                  <button 
                    className="btn-primary btn-start-session"
                    onClick={() => {
                      setShowPriorityModal(false);
                      startReviewSession();
                    }}
                  >
                    <Brain size={20} /> Start Review Session ({itemsNeedingReview.length} items)
                  </button>
                </>
              ) : (
                <div className="caught-up-content">
                  <h3>✅ You're All Caught Up!</h3>
                  <p>Great job! All your knowledge is fresh.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="modal-content filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Filters & Sorting</h2>
              <button className="modal-close" onClick={() => setShowFilterModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="filter-section">
                <h3>Filter by Status</h3>
                <div className="filter-buttons">
                  <button 
                    className={`filter-option-btn ${quickFilter === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      setQuickFilter('all');
                      setShowFilterModal(false);
                    }}
                  >
                    All Items
                  </button>
                  <button 
                    className={`filter-option-btn warning ${quickFilter === 'due-soon' ? 'active' : ''}`}
                    onClick={() => {
                      setQuickFilter('due-soon');
                      setShowFilterModal(false);
                    }}
                  >
                    ⏰  Due Soon
                  </button>
                  <button 
                    className={`filter-option-btn urgent ${quickFilter === 'fading' ? 'active' : ''}`}
                    onClick={() => {
                      setQuickFilter('fading');
                      setShowFilterModal(false);
                    }}
                  >
                    🔴  Fading
                  </button>
                  <button 
                    className={`filter-option-btn success ${quickFilter === 'strong' ? 'active' : ''}`}
                    onClick={() => {
                      setQuickFilter('strong');
                      setShowFilterModal(false);
                    }}
                  >
                    ✅  Strong
                  </button>
                </div>
              </div>

              <div className="filter-section">
                <h3>Sort by</h3>
                <div className="sort-options">
                  <button 
                    className={`sort-option-btn ${sortBy === 'priority' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('priority');
                      setShowFilterModal(false);
                    }}
                  >
                    Priority
                  </button>
                  <button 
                    className={`sort-option-btn ${sortBy === 'recent' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('recent');
                      setShowFilterModal(false);
                    }}
                  >
                    Recent
                  </button>
                  <button 
                    className={`sort-option-btn ${sortBy === 'score' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('score');
                      setShowFilterModal(false);
                    }}
                  >
                    Score
                  </button>
                </div>
              </div>
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
    </AppLayout>
  );
};

export default Dashboard;
