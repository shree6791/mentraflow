import React from 'react';
import { X, Clock, Eye, TrendingUp, Brain } from 'lucide-react';

const PriorityModal = ({
  show,
  onClose,
  itemsNeedingReview,
  estimatedReviewTime,
  priorityModalPage,
  setPriorityModalPage,
  priorityModalItemsPerPage,
  openLibraryItem,
  startReviewSession
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content priority-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>🎯 Your Priority Today</h2>
            <p className="modal-subtitle">
              {itemsNeedingReview.length} items • {estimatedReviewTime} min estimated
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
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
                          onClose();
                          openLibraryItem(item, 'summary');
                        }}>
                          <Eye size={12} /> Summary
                        </button>
                        {item.quizScore !== null && (
                          <button className="link-btn-compact" onClick={() => {
                            onClose();
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
                          onClose();
                          openLibraryItem(item, 'quiz');
                        }}>
                          <Brain size={18} /> Review Now
                        </button>
                      ) : item.retention === 'medium' ? (
                        <button className="action-btn action-primary action-warning" onClick={() => {
                          onClose();
                          openLibraryItem(item, 'quiz');
                        }}>
                          <Brain size={18} /> Review Soon
                        </button>
                      ) : (
                        <button className="action-btn action-success" onClick={() => {
                          onClose();
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
                  onClose();
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
  );
};

export default PriorityModal;
