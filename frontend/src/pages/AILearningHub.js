import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Target, Brain } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import MCPImportsSection from '../components/MCPImportsSection';
import RecallSessionsWidget from '../components/RecallSessionsWidget';
import '../AILearningHub.css';

const AILearningHub = () => {
  const navigate = useNavigate();

  return (
    <AppLayout title="AI Learning Hub">
      <div className="ai-learning-hub">
        {/* Page Header */}
        <div className="hub-header">
          <div className="hub-title-section">
            <Brain size={32} className="hub-icon" />
            <div>
              <h1>AI Learning Hub</h1>
              <p className="hub-subtitle">
                Your AI conversation imports and spaced repetition sessions in one place
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="hub-content-grid">
          {/* Left Column: MCP Imports */}
          <div className="hub-column">
            <MCPImportsSection />
          </div>

          {/* Right Column: Recall Sessions */}
          <div className="hub-column">
            <RecallSessionsWidget 
              onStartQuiz={(session) => {
                // TODO: Show quiz modal for this session
                console.log('Start quiz for session:', session);
              }} 
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="hub-quick-links">
          <button 
            className="quick-link-btn"
            onClick={() => navigate('/knowledge-graph')}
          >
            <Brain size={20} />
            View Knowledge Graph
          </button>
          <button 
            className="quick-link-btn"
            onClick={() => navigate('/mcp-connect')}
          >
            <Zap size={20} />
            Configure MCP
          </button>
          <button 
            className="quick-link-btn"
            onClick={() => navigate('/')}
          >
            <Target size={20} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default AILearningHub;
