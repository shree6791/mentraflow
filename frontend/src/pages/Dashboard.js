import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Upload, FileText, BarChart3, Brain, CheckCircle, XCircle, ChevronDown, ChevronUp, Menu, X, Search, Filter, Eye, PenTool, TrendingUp, TrendingDown, Clock, Settings, CreditCard, Video, Loader, Target, Info } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import Tooltip from '../components/Tooltip';
import { 
  CaptureModal, 
  GeneratedContentModal, 
  PriorityModal,
  FilterModal,
  QuizCustomizationModal,
  RecallQuizModal,
  QuizModal
} from '../components/modals';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { formatPercentage, formatRelativeTime } from '../utils/formatters';
import '../Dashboard.css';

// Set up PDF.js worker from npm package
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Library state
  const [libraryItems, setLibraryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Dashboard state
  const [masteryScore, setMasteryScore] = useState(68);
  const [weeklyChange, setWeeklyChange] = useState(6);
  const [topics, setTopics] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedContent, setUploadedContent] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [processingFile, setProcessingFile] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
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
  const [recallTasks, setRecallTasks] = useState([]);
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
  const [libraryQuizData, setLibraryQuizData] = useState(null); // Quiz data from API
  
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
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data including stats
        const [libraryResponse, nodesResponse, recallResponse, statsResponse] = await Promise.all([
          axios.get(`${API}/library`),
          axios.get(`${API}/nodes`),
          axios.get(`${API}/recall-tasks`),
          axios.get(`${API}/stats`)
        ]);

        // Set data from API responses
        setLibraryItems(libraryResponse.data?.items || []);
        setTopics(nodesResponse.data?.nodes || []);
        setRecallTasks(recallResponse.data?.tasks || []);
        
        // Set dashboard statistics
        const dashboardStats = statsResponse.data?.dashboard || {};
        setMasteryScore(dashboardStats.avgRetention || 68);
        setStreak(dashboardStats.streakDays || 4);
        
        // Calculate weekly change (positive trend for demo)
        setWeeklyChange(6);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [API]);

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    setProcessingFile(true);
    setUploadedFileName(file.name);
    
    try {
      let extractedText = '';
      
      if (fileExtension === 'txt') {
        // Read TXT files directly
        const reader = new FileReader();
        extractedText = await new Promise((resolve, reject) => {
          reader.onload = (event) => resolve(event.target.result);
          reader.onerror = (error) => reject(error);
          reader.readAsText(file);
        });
      } 
      else if (fileExtension === 'pdf') {
        // Extract text from PDF
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        let fullText = '';
        
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        
        extractedText = fullText.trim();
      }
      else if (fileExtension === 'docx') {
        // Extract text from DOCX
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      }
      else if (fileExtension === 'doc') {
        // DOC files are more complex, need server-side processing
        showToast('Old .doc format not supported. Please use .docx, .pdf, or .txt', 'error');
        setProcessingFile(false);
        setUploadedFileName('');
        return;
      }
      else {
        showToast('Unsupported file type. Please use .txt, .pdf, or .docx', 'error');
        setProcessingFile(false);
        setUploadedFileName('');
        return;
      }
      
      if (extractedText && extractedText.trim().length > 0) {
        setUploadedContent(extractedText);
        showToast(`✓ ${file.name} processed successfully!`);
      } else {
        showToast('No text content found in file', 'error');
        setUploadedFileName('');
      }
      
    } catch (error) {
      console.error('Error processing file:', error);
      showToast(`Failed to process ${file.name}. Please try again.`, 'error');
      setUploadedFileName('');
    } finally {
      setProcessingFile(false);
    }
  };

  const removeUploadedFile = () => {
    setUploadedContent('');
    setUploadedFileName('');
    // Reset the file input
    const fileInput = document.getElementById('fab-file-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const generateSummaryAndQuiz = async () => {
    // Validate input based on active tab
    if (activeTab === 'youtube') {
      if (!youtubeUrl) {
        showToast('Please enter a YouTube URL', 'error');
        return;
      }
      // Validate YouTube URL format
      if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
        showToast('Please enter a valid YouTube URL', 'error');
        return;
      }
    } else {
      if (!uploadedContent) {
        showToast('Please upload or paste content first', 'error');
        return;
      }
    }
    
    setGenerating(true);
    
    try {
      // Prepare request payload based on active tab
      const requestData = activeTab === 'youtube' 
        ? { 
            youtubeUrl,
            questionCount: quizConfig.questionCount,
            difficulty: quizConfig.difficulty,
            focusArea: quizConfig.focusArea
          }
        : { 
            content: uploadedContent,
            questionCount: quizConfig.questionCount,
            difficulty: quizConfig.difficulty,
            focusArea: quizConfig.focusArea
          };
      
      // Call API to generate summary and quiz
      const response = await axios.post(`${API}/generate`, requestData);
      
      const { summary, quiz } = response.data;
      
      setSummary(summary);
      setQuiz(quiz?.questions || []);
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
      
      // Reset input fields
      setUploadedContent('');
      setUploadedFileName('');
      setYoutubeUrl('');
      
      // Reset file input
      const fileInput = document.getElementById('fab-file-upload');
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Stop pulse animation after first use
      setFabAnimatePulse(false);
      
      showToast('Summary and quiz generated!');
    } catch (error) {
      console.error('Error generating content:', error);
      setGenerating(false);
      
      // Show specific error message from backend if available
      const errorMessage = error.response?.data?.detail || 'Failed to generate content. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const handleQuizAnswer = (questionIndex, optionIndex) => {
    setQuizAnswers(prev => {
      const updated = { ...prev, [questionIndex]: optionIndex };
      console.log('Quiz answer updated:', { questionIndex, optionIndex, updated });
      return updated;
    });
  };

  const submitQuiz = async () => {
    // Check all possible quiz data sources
    const activeQuiz = libraryQuizData?.questions || recallQuizData || quiz;
    
    if (!activeQuiz) {
      console.error('No quiz data available');
      return;
    }
    
    const results = {};
    const answers = [];
    
    activeQuiz.forEach((q, idx) => {
      const isCorrect = quizAnswers[idx] === q.correctIndex;
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
    const percentage = Math.round((score / activeQuiz.length) * 100);
    
    // Determine nodeId and quizId
    const nodeId = selectedLibraryItem?.nodeId || currentRecallTask?.nodeId || 't1';
    const quizId = selectedLibraryItem?.quizId || 'q1';
    
    // Submit quiz results to backend
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/quiz-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodeId: nodeId,
          quizId: quizId,
          answers: answers,
          score: score,
          percentage: percentage,
          totalQuestions: activeQuiz.length
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Quiz result submitted:', data);
        
        // Update mastery score
        const change = percentage > masteryScore ? 2 : -1;
        setMasteryScore(prev => Math.min(100, Math.max(0, prev + change)));
        setWeeklyChange(prev => prev + change);
        
        // Award XP from backend response
        setXp(prev => prev + data.xpGained);
        
        // Show message from backend
        showToast(data.message);
      } else {
        console.error('Failed to submit quiz result');
        // Still show local message as fallback
        showToast(`Quiz completed! ${percentage}% correct`);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Show local message as fallback
      showToast(`Quiz completed! ${percentage}% correct`);
    }
  };

  const nextQuestion = () => {
    // Check all possible quiz data sources
    const activeQuiz = libraryQuizData?.questions || recallQuizData || quiz;
    if (activeQuiz && currentQuestionIndex < activeQuiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const retakeQuiz = () => {
    setQuizAnswers({});
    setQuizResults({});
    setShowQuizResults(false);
    setCurrentQuestionIndex(0);
  };

  const calculateScore = () => {
    const correctAnswers = Object.values(quizResults).filter(Boolean).length;
    const totalQuestions = libraryQuizData?.questions?.length || quiz?.length || 0;
    return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  };

  const handleProfileSave = () => {
    showToast('Profile updated successfully!');
    setShowProfileModal(false);
  };

  // Phase 2: Recall Tasks Handlers
  const startRecallTask = async (task) => {
    setCurrentRecallTask(task);
    setQuizAnswers({});
    setQuizResults({});
    setCurrentQuestionIndex(0);
    
    try {
      // Fetch recall quiz data from API
      const response = await axios.get(`${API}/recall-quiz/${encodeURIComponent(task.title)}`);
      setRecallQuizData(response.data?.questions || []);
    } catch (error) {
      console.error('Error fetching recall quiz data:', error);
      // Fallback to empty array if API fails
      setRecallQuizData([]);
    }
    
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

  const generateCustomQuiz = async () => {
    setShowQuizCustomization(false);
    setGenerating(true);
    
    try {
      // Call API to generate custom quiz
      const response = await axios.post(`${API}/generate-custom-quiz`, {
        content: uploadedContent,
        config: quizConfig
      });
      
      const { summary, quiz } = response.data;
      
      setSummary(summary);
      setQuiz(quiz?.questions || []);
      setQuizAnswers({});
      setQuizResults({});
      setCurrentQuestionIndex(0);
      setShowQuizResults(false);
      setGenerating(false);
      showToast(`Custom quiz generated! (${quizConfig.questionCount} questions, ${quizConfig.difficulty})`);
    } catch (error) {
      console.error('Error generating custom quiz:', error);
      setGenerating(false);
      showToast('Failed to generate custom quiz. Please try again.', 'error');
    }
  };

  // Library Item Detail Modal Handlers
  const openLibraryItem = async (item, tab = 'summary') => {
    setSelectedLibraryItem(item);
    setLibraryModalTab(tab);
    
    // Fetch complete data from API (quiz + summary + all node fields)
    try {
      // Title now matches exactly - no mapping needed!
      const response = await axios.get(`${API}/node/${encodeURIComponent(item.title)}`);
      const data = response.data;
      
      // Set quiz data
      if (data.quiz && data.quiz.questions) {
        setLibraryQuizData(data.quiz);
      } else {
        setLibraryQuizData(null);
      }
      
      // Update selected item with ALL node data (summary, score, quizzesTaken, etc)
      setSelectedLibraryItem({
        ...item,
        ...data.node,  // ✅ Include all node fields (score, quizzesTaken, state, etc)
        summary: data.summary || null
      });
      
    } catch (error) {
      console.error('Error fetching node data:', error);
      // Keep the item but without additional data
      setLibraryQuizData(null);
    }
  };

  const closeLibraryItem = () => {
    setSelectedLibraryItem(null);
    setLibraryModalTab('summary');
    setLibraryQuizData(null);
    setQuizAnswers({});
    setQuizResults({});
    setCurrentQuestionIndex(0);
    setShowQuizResults(false);
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

  // MVP Demo: Badge calculations
  const totalQuizzes = libraryItems.filter(item => item.quizScore !== null).length;
  const avgScore = libraryItems.reduce((acc, item) => acc + (item.quizScore || 0), 0) / Math.max(libraryItems.length, 1);

  const badges = [
    {
      id: 'week-warrior',
      name: 'Week Warrior',
      description: '7-day streak',
      emoji: '🔥',
      current: streak,
      target: 7,
      unlocked: streak >= 7
    },
    {
      id: 'quiz-master',
      name: 'Quiz Master',
      description: '20 quizzes',
      emoji: '🎓',
      current: totalQuizzes,
      target: 20,
      unlocked: totalQuizzes >= 20
    },
    {
      id: 'expert',
      name: 'Expert',
      description: '80% average',
      emoji: '💯',
      current: Math.round(avgScore),
      target: 80,
      unlocked: avgScore >= 80
    }
  ];

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
                {formatPercentage(masteryScore)}
              </text>
            </svg>
          </div>
          <div className="stat-banner-content">
            <h3>Overall Mastery</h3>
            <div className="stat-compact-row">
              <span className={`trend-badge-inline ${weeklyChange >= 0 ? 'positive' : 'negative'}`}>
                {weeklyChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {weeklyChange >= 0 ? '+' : ''}{formatPercentage(weeklyChange)}
              </span>
              <span className="separator">•</span>
              <span className="target-label">{formatPercentage(80 - masteryScore)} to Expert</span>
            </div>
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

      {/* MVP Demo: Badges Showcase */}
      <div className="badges-showcase">
        <div className="section-title-with-tooltip">
          <h3>🏆 Achievements</h3>
          <div className="info-tooltip-wrapper">
            <Info size={16} className="info-icon" />
            <div className="info-tooltip">Track your learning milestones and unlock rewards</div>
          </div>
        </div>
        <div className="badges-grid">
          {badges.map(badge => (
            <div key={badge.id} className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="badge-icon">{badge.emoji}</div>
              <span className="badge-name">{badge.name}</span>
              <span className="badge-desc">{badge.description}</span>
              {badge.unlocked ? (
                <span className="badge-status unlocked">✓ Unlocked</span>
              ) : (
                <span className="badge-progress">{badge.current}/{badge.target}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Focus Area - Smart Priority Flow */}
      <div className="dashboard-main-focus">
        
        {/* My Knowledge Library - Main Content */}
        <section className="dashboard-section library-section-main">
          <div className="section-header">
            <div className="section-title-with-tooltip">
              <h2>My Knowledge Library</h2>
              <div className="info-tooltip-wrapper">
                <Info size={16} className="info-icon" />
                <div className="info-tooltip">All your captured knowledge organized by retention strength</div>
              </div>
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
          
          {/* Inline Filter Bar (Desktop Only) */}
          <div className="inline-filter-bar">
            <div className="filter-buttons-inline">
              <button 
                className={`filter-btn-inline ${quickFilter === 'all' ? 'active' : ''}`}
                onClick={() => setQuickFilter('all')}
              >
                All Items
              </button>
              <button 
                className={`filter-btn-inline warning ${quickFilter === 'due-soon' ? 'active' : ''}`}
                onClick={() => setQuickFilter('due-soon')}
              >
                ⏰ Due Soon
              </button>
              <button 
                className={`filter-btn-inline urgent ${quickFilter === 'fading' ? 'active' : ''}`}
                onClick={() => setQuickFilter('fading')}
              >
                🔴 Fading
              </button>
              <button 
                className={`filter-btn-inline success ${quickFilter === 'strong' ? 'active' : ''}`}
                onClick={() => setQuickFilter('strong')}
              >
                ✅ Strong
              </button>
            </div>
            
            <div className="sort-dropdown-inline">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="priority">Priority</option>
                <option value="recent">Recent</option>
                <option value="score">Score</option>
              </select>
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
                    
                    {/* Unified Meta Row: Chips (left) + Links (right) */}
                    <div className="library-item-unified-row">
                      {/* Left side: Status chips */}
                      <div className="chips-container">
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
                      
                      {/* Right side: Quick action links */}
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
                    
                    {/* MVP Demo: Visual Progress Bar */}
                    {item.quizScore !== null && (
                      <div className="item-retention-bar">
                        <div 
                          className={`retention-fill retention-${item.retention}`}
                          style={{width: `${item.quizScore}%`}}
                        />
                        <span className="retention-score">{item.quizScore}% mastered</span>
                      </div>
                    )}
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

      {/* Recall Quiz Modal */}
      <RecallQuizModal
        show={showRecallQuiz}
        onClose={() => setShowRecallQuiz(false)}
        recallQuizData={recallQuizData}
        currentRecallTask={currentRecallTask}
        currentQuestionIndex={currentQuestionIndex}
        quizAnswers={quizAnswers}
        handleQuizAnswer={handleQuizAnswer}
        previousQuestion={previousQuestion}
        nextQuestion={nextQuestion}
        submitRecallQuiz={submitRecallQuiz}
      />

      {/* Quiz Customization Modal */}
      <QuizCustomizationModal
        show={showQuizCustomization}
        onClose={() => setShowQuizCustomization(false)}
        quizConfig={quizConfig}
        setQuizConfig={setQuizConfig}
        topics={topics}
        showToast={showToast}
      />

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
      <GeneratedContentModal
        show={showGeneratedModal}
        onClose={() => setShowGeneratedModal(false)}
        summary={summary}
        quiz={quiz}
        generatedContentTab={generatedContentTab}
        setGeneratedContentTab={setGeneratedContentTab}
        showQuizResults={showQuizResults}
        currentQuestionIndex={currentQuestionIndex}
        quizAnswers={quizAnswers}
        quizResults={quizResults}
        handleQuizAnswer={handleQuizAnswer}
        previousQuestion={previousQuestion}
        nextQuestion={nextQuestion}
        submitQuiz={submitQuiz}
        onRetake={() => {
          setQuizAnswers({});
          setQuizResults({});
          setShowQuizResults(false);
          setCurrentQuestionIndex(0);
        }}
        onCloseResults={() => {
          setShowGeneratedModal(false);
          setQuizAnswers({});
          setQuizResults({});
          setShowQuizResults(false);
          setCurrentQuestionIndex(0);
        }}
      />

      {/* Library Item Detail Modal - Using Shared Component */}
      {selectedLibraryItem && (
        <QuizModal
          item={{
            ...selectedLibraryItem,
            summary: selectedLibraryItem.summary || null
          }}
          modalTab={libraryModalTab}
          onTabChange={setLibraryModalTab}
          onClose={closeLibraryItem}
          quizData={libraryQuizData}
          quizAnswers={quizAnswers}
          currentQuestionIndex={currentQuestionIndex}
          showQuizResults={showQuizResults}
          quizResults={quizResults}
          onAnswerSelect={handleQuizAnswer}
          onPreviousQuestion={previousQuestion}
          onNextQuestion={nextQuestion}
          onSubmitQuiz={submitQuiz}
          onRetakeQuiz={retakeQuiz}
          calculateScore={calculateScore}
        />
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
      <CaptureModal
        show={showFABCapture}
        onClose={() => setShowFABCapture(false)}
        onCustomizeQuiz={() => {
          setShowQuizCustomization(true);
          setShowFABCapture(false);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        processingFile={processingFile}
        uploadedFileName={uploadedFileName}
        uploadedContent={uploadedContent}
        setUploadedContent={setUploadedContent}
        youtubeUrl={youtubeUrl}
        setYoutubeUrl={setYoutubeUrl}
        handleFileUpload={handleFileUpload}
        removeUploadedFile={removeUploadedFile}
        generateSummaryAndQuiz={generateSummaryAndQuiz}
        generating={generating}
      />

      {/* Priority Modal */}
      <PriorityModal
        show={showPriorityModal}
        onClose={() => setShowPriorityModal(false)}
        itemsNeedingReview={itemsNeedingReview}
        estimatedReviewTime={estimatedReviewTime}
        priorityModalPage={priorityModalPage}
        setPriorityModalPage={setPriorityModalPage}
        priorityModalItemsPerPage={priorityModalItemsPerPage}
        openLibraryItem={openLibraryItem}
        startReviewSession={startReviewSession}
      />

      {/* Filter Modal */}
      <FilterModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        quickFilter={quickFilter}
        setQuickFilter={setQuickFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

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
