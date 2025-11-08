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
    setSelectedTopic(topic);
    setModalTab(tab);
    
    // Fetch quiz data if opening quiz tab
    if (tab === 'quiz') {
      try {
        const response = await axios.get(`${API}/quiz/${encodeURIComponent(topic.title)}`);
        setQuizData(response.data);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setQuizData(null);
      }
    }
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
          onReinforce={(node) => {
            console.log(`Reinforce ${node.title}`);
          }}
          hideHeader={true}
        />
    </AppLayout>
  );
};

export default KnowledgeGraphPage;
