import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Target, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const RecallSessionsWidget = ({ onStartQuiz }) => {
  const [recallSessions, setRecallSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ due: 0, upcoming: 0, completed: 0 });

  useEffect(() => {
    fetchRecallSessions();
  }, []);

  const fetchRecallSessions = async () => {
    try {
      setLoading(true);
      
      // Fetch recall sessions from MongoDB
      const response = await axios.get(`${BACKEND_URL}/api/recall-sessions?user_id=demo_user&status=pending&limit=5`);
      
      const sessions = response.data.sessions || [];
      setRecallSessions(sessions);
      
      // Calculate stats
      const now = new Date();
      const due = sessions.filter(s => new Date(s.due_date) <= now).length;
      const upcoming = sessions.filter(s => new Date(s.due_date) > now).length;
      
      setStats({
        due,
        upcoming,
        completed: response.data.completed_count || 0
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recall sessions:', error);
      setLoading(false);
    }
  };

  const isDue = (dueDate) => {
    return new Date(dueDate) <= new Date();
  };

  const formatDueDate = (dueDate) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const handleStartRecall = (session) => {
    if (onStartQuiz) {
      // Pass session info to parent to show quiz modal
      onStartQuiz(session);
    }
  };

  if (loading) {
    return (
      <div className="recall-widget loading">
        <div className="widget-header">
          <Target size={20} className="widget-icon" />
          <h3>Spaced Repetition</h3>
        </div>
        <p style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>Loading...</p>
      </div>
    );
  }

  if (recallSessions.length === 0) {
    return (
      <div className="recall-widget empty">
        <div className="widget-header">
          <Target size={20} className="widget-icon" />
          <h3>Spaced Repetition</h3>
        </div>
        <div className="empty-state">
          <CheckCircle2 size={48} style={{ color: '#10B981' }} />
          <p>All caught up!</p>
          <span className="empty-subtitle">No pending recall sessions</span>
        </div>
      </div>
    );
  }

  return (
    <div className="recall-widget">
      <div className="widget-header">
        <div className="widget-title-group">
          <Target size={20} className="widget-icon" />
          <h3>Spaced Repetition</h3>
          {stats.due > 0 && (
            <span className="due-badge">{stats.due} due</span>
          )}
        </div>
      </div>

      <div className="recall-stats-mini">
        <div className="recall-stat-mini due">
          <span className="stat-value">{stats.due}</span>
          <span className="stat-label">Due Now</span>
        </div>
        <div className="recall-stat-mini upcoming">
          <span className="stat-value">{stats.upcoming}</span>
          <span className="stat-label">Upcoming</span>
        </div>
        <div className="recall-stat-mini completed">
          <span className="stat-value">{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      <div className="recall-sessions-list">
        {recallSessions.map((session) => {
          const isOverdue = isDue(session.due_date);
          
          return (
            <div 
              key={session.id} 
              className={`recall-session-item ${isOverdue ? 'due' : 'upcoming'}`}
            >
              <div className="session-content">
                <div className="session-header">
                  <span className="session-concept">{session.concept_text}</span>
                  {isOverdue ? (
                    <AlertCircle size={16} className="status-icon due" />
                  ) : (
                    <Clock size={16} className="status-icon upcoming" />
                  )}
                </div>
                <div className="session-meta">
                  <Calendar size={14} />
                  <span className={`session-due-date ${isOverdue ? 'overdue' : ''}`}>
                    {formatDueDate(session.due_date)}
                  </span>
                  <span className="session-interval">
                    • Interval: {session.interval_days} day{session.interval_days !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <button 
                className={`session-start-btn ${isOverdue ? 'due' : 'upcoming'}`}
                onClick={() => handleStartRecall(session)}
              >
                Start
                <ChevronRight size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {recallSessions.length >= 5 && (
        <div className="recall-view-all">
          <button className="view-all-btn">
            View All Sessions
          </button>
        </div>
      )}
    </div>
  );
};

export default RecallSessionsWidget;
