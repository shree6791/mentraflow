import React from 'react';
import { X, Eye, Brain, CheckCircle, XCircle } from 'lucide-react';

const GeneratedContentModal = ({
  show,
  onClose,
  summary,
  quiz,
  generatedContentTab,
  setGeneratedContentTab,
  showQuizResults,
  currentQuestionIndex,
  quizAnswers,
  quizResults,
  handleQuizAnswer,
  previousQuestion,
  nextQuestion,
  submitQuiz,
  onRetake,
  onCloseResults
}) => {
  if (!show || !summary || !quiz) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content library-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Generated Summary & Quiz</h2>
            <p className="modal-subtitle">Review your generated content</p>
          </div>
          <button className="modal-close" onClick={onClose}>
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
                  onClick={onClose}
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
                  {/* Score Header */}
                  <div className="results-header">
                    <div className="score-circle">
                      <div className="score-number">
                        {Object.values(quizResults).filter(Boolean).length}/{quiz.length}
                      </div>
                      <div className="score-label">Correct</div>
                    </div>
                    <div className="score-info">
                      <h3 className="results-title">
                        {Math.round((Object.values(quizResults).filter(Boolean).length / quiz.length) * 100) >= 80 
                          ? "🎉 Excellent Work!" 
                          : Math.round((Object.values(quizResults).filter(Boolean).length / quiz.length) * 100) >= 60
                          ? "👍 Good Job!"
                          : "💪 Keep Practicing!"}
                      </h3>
                      <p className="results-subtitle">
                        You scored {Math.round((Object.values(quizResults).filter(Boolean).length / quiz.length) * 100)}%
                        {Math.round((Object.values(quizResults).filter(Boolean).length / quiz.length) * 100) >= 80 
                          ? " — You're building strong retention!" 
                          : " — Each recall strengthens your memory."}
                      </p>
                    </div>
                  </div>

                  {/* Question Results */}
                  <div className="results-questions">
                    {quiz.map((q, idx) => (
                      <div key={idx} className={`result-card ${quizResults[idx] ? 'correct' : 'incorrect'}`}>
                        <div className="result-card-header">
                          <div className="question-badge">
                            {quizResults[idx] ? (
                              <CheckCircle size={18} className="badge-icon" />
                            ) : (
                              <XCircle size={18} className="badge-icon" />
                            )}
                            <span className="badge-text">Question {idx + 1}</span>
                          </div>
                        </div>
                        
                        <p className="result-question-text">{q.q}</p>
                        
                        <div className="result-answers">
                          <div className="answer-box answer-correct">
                            <div className="answer-label">
                              <CheckCircle size={16} />
                              <span>Correct Answer</span>
                            </div>
                            <p className="answer-text">{q.options[q.correctIndex]}</p>
                          </div>
                          
                          {!quizResults[idx] && (
                            <div className="answer-box answer-wrong">
                              <div className="answer-label">
                                <XCircle size={16} />
                                <span>Your Answer</span>
                              </div>
                              <p className="answer-text">{q.options[quizAnswers[idx]]}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="results-actions">
                    <button 
                      className="btn-secondary btn-retake"
                      onClick={onRetake}
                    >
                      <Brain size={18} /> Retake Quiz
                    </button>
                    <button 
                      className="btn-primary btn-close-results"
                      onClick={onCloseResults}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratedContentModal;
