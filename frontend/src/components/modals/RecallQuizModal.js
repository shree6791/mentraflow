import React from 'react';
import { X } from 'lucide-react';

const RecallQuizModal = ({
  show,
  onClose,
  recallQuizData,
  currentRecallTask,
  currentQuestionIndex,
  quizAnswers,
  handleQuizAnswer,
  previousQuestion,
  nextQuestion,
  submitRecallQuiz
}) => {
  if (!show || !recallQuizData) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content recall-quiz-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Quick Recall: {currentRecallTask?.title}</h2>
          <button className="modal-close" onClick={onClose}>
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
  );
};

export default RecallQuizModal;