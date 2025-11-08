# Quiz Navigation Button Issue - Code Reference Guide

## 📂 File Locations

### Dashboard Quiz Implementation
**File:** `/app/frontend/src/pages/Dashboard.js`
**Size:** 82KB (1,700+ lines)

### Knowledge Graph Quiz Implementation  
**File:** `/app/frontend/src/pages/KnowledgeGraphPage.js`
**Size:** ~420 lines

---

## 🔍 Dashboard Quiz Code Locations

### State Management (Line 172)
```javascript
const [quizAnswers, setQuizAnswers] = useState({});
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
```

### Answer Handler (Line 396)
```javascript
const handleQuizAnswer = (questionIndex, optionIndex) => {
  setQuizAnswers({ ...quizAnswers, [questionIndex]: optionIndex });
};
```

### Navigation Functions (Lines 435-446)
```javascript
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
```

### Quiz Navigation UI (Lines 1425-1450)
```javascript
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
      disabled={quizAnswers[currentQuestionIndex] === undefined}  // ⚠️ THIS LINE
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
```

### Quiz Options (Lines 1412-1421)
```javascript
{quiz[currentQuestionIndex].options.map((option, idx) => (
  <button
    key={idx}
    className={`quiz-option ${quizAnswers[currentQuestionIndex] === idx ? 'selected' : ''}`}
    onClick={() => handleQuizAnswer(currentQuestionIndex, idx)}  // ⚠️ CLICK HANDLER
  >
    <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
    <span className="option-text">{option}</span>
  </button>
))}
```

---

## 🔍 Knowledge Graph Quiz Code Locations

### State Management (Lines 16-19)
```javascript
const [quizAnswers, setQuizAnswers] = useState({});
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
```

### Answer Handler (Lines 84-86)
```javascript
const handleQuizAnswer = (questionIndex, answerIndex) => {
  setQuizAnswers(prev => ({
    ...prev,
    [questionIndex]: answerIndex
  }));
};
```

### Quiz Navigation UI (Lines 264-291)
```javascript
<div className="quiz-navigation">
  {currentQuestionIndex > 0 && (
    <button 
      className="btn-secondary"
      onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
    >
      Previous
    </button>
  )}
  <div style={{flex: 1}}></div>
  {currentQuestionIndex < quizData.questions.length - 1 ? (
    <button 
      className="btn-primary"
      onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
      disabled={quizAnswers[currentQuestionIndex] === undefined}  // ⚠️ THIS LINE
    >
      Next
    </button>
  ) : (
    <button 
      className="btn-primary"
      onClick={submitQuiz}
      disabled={Object.keys(quizAnswers).length !== quizData.questions.length}
    >
      Submit Quiz
    </button>
  )}
</div>
```

### Quiz Options (Lines 252-260)
```javascript
{quizData.questions[currentQuestionIndex].options.map((option, idx) => (
  <button
    key={idx}
    className={`quiz-option ${quizAnswers[currentQuestionIndex] === idx ? 'selected' : ''}`}
    onClick={() => handleQuizAnswer(currentQuestionIndex, idx)}  // ⚠️ CLICK HANDLER
  >
    {option}
  </button>
))}
```

---

## 🐛 Troubleshooting the Button Issue

### The Logic:
The Next button is disabled when:
```javascript
disabled={quizAnswers[currentQuestionIndex] === undefined}
```

This means the button stays disabled until an answer is selected for the current question.

### What Should Happen:
1. User clicks option C (index 2)
2. `handleQuizAnswer(0, 2)` is called
3. State updates: `quizAnswers = {0: 2}`
4. React re-renders
5. Button checks: `quizAnswers[0] === undefined` → FALSE
6. Button becomes enabled

### Possible Causes:

#### 1. **State Not Updating (Most Likely)**
Check browser console for errors:
```javascript
// Add this temporarily to handleQuizAnswer in Dashboard.js (line 396):
const handleQuizAnswer = (questionIndex, optionIndex) => {
  console.log('BEFORE:', quizAnswers);
  const newAnswers = { ...quizAnswers, [questionIndex]: optionIndex };
  console.log('AFTER:', newAnswers);
  setQuizAnswers(newAnswers);
};
```

#### 2. **Multiple Quiz Modals**
Dashboard has 3 different quiz modals:
- **Library Item Modal Quiz** (lines 1380-1520) ✅
- **Recall Quick Quiz Modal** (lines 1090-1190) 
- **Practice Quiz Modal** (lines 1550-1690)

Each uses the same `handleQuizAnswer` but different quiz data sources.

#### 3. **React State Closure Issue**
The disabled check might be using stale state. Try:
```javascript
// Change from:
disabled={quizAnswers[currentQuestionIndex] === undefined}

// To:
disabled={!quizAnswers.hasOwnProperty(currentQuestionIndex)}
```

#### 4. **CSS Disabling Pointer Events**
Check if CSS is blocking clicks:
```css
.quiz-option.selected {
  pointer-events: auto !important;
}
```

---

## ✅ Verified Working (from automated test):

The automated test confirmed:
- ✅ Click registered: Option C clicked
- ✅ Handler called: `handleQuizAnswer called: {questionIndex: 0, optionIndex: 2}`
- ✅ State updated: `Setting new answers: {0: 2}`
- ✅ Button enabled: `disabled attribute: None`
- ✅ Navigation worked: Successfully moved to next question

---

## 🔧 Quick Fix to Try:

### Option 1: Force Re-render
Add a key to the quiz navigation div:

```javascript
<div className="quiz-navigation" key={currentQuestionIndex}>
  {/* buttons */}
</div>
```

### Option 2: Use Functional State Update
```javascript
const handleQuizAnswer = (questionIndex, optionIndex) => {
  setQuizAnswers(prev => {
    const updated = { ...prev, [questionIndex]: optionIndex };
    console.log('Updated answers:', updated);
    return updated;
  });
};
```

### Option 3: Simplify Disabled Logic
```javascript
// Instead of checking undefined, check the opposite:
disabled={quizAnswers[currentQuestionIndex] === undefined}

// Try:
disabled={!(currentQuestionIndex in quizAnswers)}
```

---

## 🎯 Recommended Actions:

1. **Hard refresh browser** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Clear all browser cache**
3. **Add console.log** to handleQuizAnswer to see if it's being called
4. **Check browser console** for any React errors
5. **Try different quiz modal** (click different cards)
6. **Test in incognito/private window**

---

## 📞 If Still Not Working:

Share:
1. Browser console logs (F12 → Console tab)
2. Which modal you're clicking (which library card)
3. Screenshot showing option selected (should have teal border)
4. Network tab errors (F12 → Network tab)
