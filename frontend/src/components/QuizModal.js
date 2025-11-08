import React from 'react';
import { Brain, Eye, BarChart3, X, CheckCircle, XCircle } from 'lucide-react';

/**
 * Reusable Quiz Modal Component
 * Used by: Dashboard, Knowledge Graph
 * 
 * @param {Object} props
 * @param {Object} props.item - The item/topic/node data
 * @param {string} props.modalTab - Current active tab ('summary' | 'quiz' | 'performance')
 * @param {Function} props.onTabChange - Callback when tab changes
 * @param {Function} props.onClose - Callback when modal closes
 * @param {Object} props.quizData - Quiz data with questions array
 * @param {Object} props.quizAnswers - User's answers {questionIndex: answerIndex}
 * @param {number} props.currentQuestionIndex - Current question being shown
 * @param {boolean} props.showQuizResults - Whether to show results or questions
 * @param {Object} props.quizResults - Quiz results {questionIndex: boolean}
 * @param {Function} props.onAnswerSelect - Callback when answer is selected (questionIndex, answerIndex)
 * @param {Function} props.onPreviousQuestion - Callback for previous button
 * @param {Function} props.onNextQuestion - Callback for next button
 * @param {Function} props.onSubmitQuiz - Callback for submit button
 * @param {Function} props.onRetakeQuiz - Callback for retake button
 * @param {Function} props.calculateScore - Function to calculate quiz score
 */
const QuizModal = ({
  item,
  modalTab,
  onTabChange,
  onClose,
  quizData,
  quizAnswers,
  currentQuestionIndex,
  showQuizResults,
  quizResults,
  onAnswerSelect,
  onPreviousQuestion,
  onNextQuestion,
  onSubmitQuiz,
  onRetakeQuiz,
  calculateScore
}) => {
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content library-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{item.title}</h2>
            <p className="modal-subtitle">
              Last Review: {item.lastReview || 'Never'}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="library-modal-tabs">
          <button
            className={`library-tab ${modalTab === 'summary' ? 'active' : ''}`}
            onClick={() => onTabChange('summary')}
          >
            <Eye size={16} /> Summary
          </button>
          <button
            className={`library-tab ${modalTab === 'quiz' ? 'active' : ''}`}
            onClick={() => onTabChange('quiz')}
          >
            <Brain size={16} /> Take Quiz
          </button>
          <button
            className={`library-tab ${modalTab === 'performance' ? 'active' : ''}`}
            onClick={() => onTabChange('performance')}
          >
            <BarChart3 size={16} /> Performance
          </button>
        </div>

        <div className="modal-body library-modal-body">
          {/* Summary Tab */}
          {modalTab === 'summary' && (
            <div className="library-tab-content">
              <div className="summary-content">
                {item.summary ? (
                  <>
                    <h3>Overview</h3>
                    <p>{item.summary.content}</p>

                    {item.summary.keyTakeaways && item.summary.keyTakeaways.length > 0 && (
                      <>
                        <h4>Key Takeaways</h4>
                        <ul className="summary-bullets">
                          {item.summary.keyTakeaways.map((bullet, idx) => (
                            <li key={idx}>{bullet}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {item.summary.keywords && item.summary.keywords.length > 0 && (
                      <div className="summary-keywords">
                        <h4>Key Concepts</h4>
                        {item.summary.keywords.map((keyword, idx) => (
                          <span key={idx} className="keyword-tag">{keyword}</span>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{textAlign: 'center', padding: '2rem'}}>
                    <div className="loading-spinner" style={{margin: '0 auto 1rem'}}></div>
                    <p>Loading summary...</p>
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
                            onClick={() => onAnswerSelect(currentQuestionIndex, idx)}
                          >
                            <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                            <span className="option-text">{option}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="quiz-navigation">
                      {currentQuestionIndex > 0 && (
                        <button 
                          className="btn-secondary"
                          onClick={onPreviousQuestion}
                        >
                          Previous
                        </button>
                      )}
                      <div style={{flex: 1}}></div>
                      {currentQuestionIndex < quizData.questions.length - 1 ? (
                        <button 
                          className="btn-primary"
                          onClick={onNextQuestion}
                          disabled={quizAnswers[currentQuestionIndex] === undefined}
                        >
                          Next Question
                        </button>
                      ) : (
                        <button 
                          className="btn-primary"
                          onClick={onSubmitQuiz}
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
                      onClick={onRetakeQuiz}
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
                  <div className="perf-score">{item.score || item.quizScore || 0}%</div>
                  <span className={`retention-badge retention-${item.state || item.retention}`}>
                    {(item.state === 'high' || item.retention === 'high') ? '🟢 Strong' : 
                     (item.state === 'medium' || item.retention === 'medium') ? '🟡 Medium' : 
                     '🔴 Fading'}
                  </span>
                </div>
                
                <div className="perf-info-card">
                  <h4>Learning Stats</h4>
                  <p>Quizzes taken: {item.quizzesTaken || 0}</p>
                  <p>Last review: {item.lastReview || 'Never'}</p>
                  {item.connections && (
                    <p>Connections: {item.connections.length || 0}</p>
                  )}
                  {item.nextReview && (
                    <p>Next review: {item.nextReview}</p>
                  )}
                </div>

                {(item.state === 'fading' || item.retention === 'fading') && (
                  <div className="perf-warning">
                    ⚠️ This topic needs reinforcement soon. Review the summary or retake the quiz to strengthen retention.
                  </div>
                )}

                <button 
                  className="btn-primary"
                  onClick={() => onTabChange('quiz')}
                >
                  <Brain size={18} /> Practice Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
