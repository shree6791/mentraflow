import React from 'react';
import { X, Filter } from 'lucide-react';

const QuizCustomizationModal = ({
  show,
  onClose,
  quizConfig,
  setQuizConfig,
  topics,
  showToast
}) => {
  if (!show) return null;

  const handleSave = () => {
    onClose();
    showToast('Quiz settings saved! Use "Generate Summary & Quiz" to create content.');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quiz-custom-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Customize Your Quiz</h2>
          <button className="modal-close" onClick={onClose}>
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
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleSave}
              >
                <Filter size={18} /> Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizCustomizationModal;