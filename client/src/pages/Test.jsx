import { useState, useEffect, useRef } from "react";
import { getQuiz, saveQuizResult } from "../services/api";
import { FaBrain, FaCheckCircle, FaTimesCircle, FaArrowRight, FaRedo, FaGlobeAmericas, FaHistory, FaBalanceScale, FaChartLine, FaMicrochip, FaNewspaper, FaSearch, FaClock, FaTrophy, FaLightbulb, FaChevronRight } from "react-icons/fa";
import { showToast } from "../components/Toast";

const TOPICS = [
  { id: "geography", label: "Geography", icon: <FaGlobeAmericas />, value: "UPSC Geography" },
  { id: "history", label: "History", icon: <FaHistory />, value: "UPSC Indian History" },
  { id: "polity", label: "Polity", icon: <FaBalanceScale />, value: "UPSC Indian Polity" },
  { id: "economy", label: "Economy", icon: <FaChartLine />, value: "UPSC Indian Economy" },
  { id: "science", label: "Science & Tech", icon: <FaMicrochip />, value: "UPSC Science and Technology" },
  { id: "current", label: "Current Affairs", icon: <FaNewspaper />, value: "UPSC Current Affairs" },
];

function Test() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [resultSaved, setResultSaved] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (finished && !resultSaved && questions.length > 0) {
      const saveResults = async () => {
        try {
          const userJson = localStorage.getItem("geointelx_logged_in");
          const user = userJson ? JSON.parse(userJson) : null;
          const percentage = Math.round((score / (questions.length || 1)) * 100);

          await saveQuizResult({
            topic,
            score,
            totalQuestions: questions.length,
            percentage,
            userId: user?._id || user?.id,
          });
          setResultSaved(true);
          console.log("Quiz results stored in database.");
        } catch (err) {
          console.error("Failed to save quiz results:", err);
        }
      };
      saveResults();
    }
  }, [finished, resultSaved, score, questions, topic]);

  useEffect(() => {
    if (started && !finished && !loading && questions.length > 0) {
      if (timeLeft > 0) {
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
      } else if (timeLeft === 0 && !showExplanation) {
        // Auto-submit if time runs out and no answer selected
        handleAnswer(-1); 
      }
    }
    return () => clearInterval(timerRef.current);
  }, [started, finished, loading, questions, timeLeft, showExplanation]);

  async function startQuiz(selectedTopic) {
    const finalTopic = selectedTopic || customTopic;
    if (!finalTopic) return showToast("Please select or enter a topic", "info");

    setLoading(true);
    setStarted(true);
    setTopic(finalTopic);
    try {
      const { data } = await getQuiz({ topic: finalTopic });
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error("Invalid quiz data received from server");
      }
      setQuestions(data);
      setCurrent(0);
      setScore(0);
      setSelected(null);
      setShowExplanation(false);
      setFinished(false);
      setResultSaved(false);
      setTimeLeft(150); // 2 minutes 30 seconds total
      setUserAnswers([]);
      showToast("Quiz generated successfully!", "success");
    } catch (err) {
      console.error("Failed to load quiz:", err);
      const msg = err.response?.data?.message || err.message || "Failed to load quiz. Please try again.";
      showToast(msg, "error");
      setStarted(false);
    } finally {
      setLoading(false);
    }
  }

  function handleAnswer(index) {
    if (showExplanation || !questions[current]) return;
    
    setSelected(index);
    setShowExplanation(true);
    clearInterval(timerRef.current);

    const isCorrect = index === questions[current].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    setUserAnswers([...userAnswers, {
      question: questions[current].question,
      selected: index,
      correct: questions[current].correctAnswer,
      isCorrect,
      explanation: questions[current].explanation
    }]);
  }

  function nextQuestion() {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelected(null);
      setShowExplanation(false);
      // Don't reset total timer, just let it continue if we want a global timer
      // Or if we want per-question timer, reset here. 
      // Let's keep global timer for now.
    } else {
      setFinished(true);
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!started) {
    return (
      <div className="news-page">
        <div className="quiz-setup">
          <div className="setup-card full-width-card">
            <div className="setup-header">
              <div className="setup-icon-small">
                <FaBrain />
              </div>
              <h2>UPSC Mastery Hub</h2>
              <p>Sharpen your knowledge with our curated UPSC/MPSC question bank</p>
            </div>

            <div className="topic-grid-modern">
              {TOPICS.map((t) => (
                <div 
                  key={t.id} 
                  className="topic-card-modern"
                  onClick={() => startQuiz(t.label)}
                >
                  <div className="topic-icon">{t.icon}</div>
                  <div className="topic-info">
                    <h3>{t.label}</h3>
                  </div>
                  <FaChevronRight className="arrow-icon" />
                </div>
              ))}
            </div>

            <div className="setup-footer">
              <p>Or generate a mixed practice session</p>
              <button 
                className="start-quiz-btn-large" 
                onClick={() => startQuiz("General Practice")}
              >
                Mixed Quiz <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="news-page">
        <div className="quiz-loading-screen">
          <div className="brain-loader">
            <FaBrain className="brain-icon-animate" />
          </div>
          <h3>Preparing Your Challenge</h3>
          <p>Analyzing the question bank for the best {topic} material...</p>
          <div className="loading-progress-bar">
            <div className="loading-progress-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const percentage = Math.round((score / (questions.length || 1)) * 100);
    return (
      <div className="test-page">
        <div className="quiz-container">
          <div className="result-card">
            <div className="result-badge">
              {percentage >= 80 ? 'Expert' : percentage >= 60 ? 'Scholar' : 'Aspirant'}
            </div>
            <div className="result-header">
              <div className="trophy-icon"><FaTrophy /></div>
              <h2>Performance Analysis</h2>
              <p>Topic: <strong>{topic}</strong></p>
            </div>
            
            <div className="result-main-stats">
              <div className="score-ring">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="circle" strokeDasharray={`${percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <text x="18" y="20.35" className="percentage">{percentage}%</text>
                </svg>
              </div>

              <div className="stats-grid-modern">
                <div className="modern-stat">
                  <span className="stat-num">{score}</span>
                  <span className="stat-desc">Correct</span>
                </div>
                <div className="modern-stat">
                  <span className="stat-num">{questions.length - score}</span>
                  <span className="stat-desc">Incorrect</span>
                </div>
                <div className="modern-stat">
                  <span className="stat-num">{questions.length}</span>
                  <span className="stat-desc">Total</span>
                </div>
              </div>
            </div>

            <div className="review-section">
              <h3>Question Review</h3>
              <div className="review-list">
                {userAnswers.map((ans, idx) => (
                  <div key={idx} className={`review-item ${ans.isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="review-q-header">
                      <span className="q-num">Q{idx + 1}</span>
                      <p className="q-text">{ans.question}</p>
                    </div>
                    <div className="review-details">
                      <p>Your Answer: <span className="ans-text">{ans.selected === -1 ? 'Time Out' : questions[idx].options[ans.selected]}</span></p>
                      {!ans.isCorrect && (
                        <p>Correct Answer: <span className="ans-text correct">{questions[idx].options[ans.correct]}</span></p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="redo-btn-modern" onClick={() => setStarted(false)}>
              <FaRedo /> Take Another Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0 || !questions[current]) {
    return (
      <div className="news-page">
        <div className="status-box error-box">
          <FaTimesCircle className="error-icon" />
          <p>No quiz questions available for this topic. Please try another one.</p>
          <button className="redo-btn" onClick={() => setStarted(false)}>
            Return to Topics
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div className="news-page">
      <div className="quiz-container">
        <div className="quiz-header-modern">
          <div className="header-left">
            <div className="progress-container">
              <div className="progress-label">Question {current + 1} of {questions.length}</div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className={`timer-box ${timeLeft < 30 ? 'urgent' : ''}`}>
              <FaClock /> <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        <div className="quiz-card-modern">
          <div className="card-top-accent"></div>
          <div className="topic-tag">{topic}</div>
          <h2 className="quiz-question">{q.question}</h2>

          <div className="quiz-options-modern">
            {q.options && q.options.map((opt, idx) => {
              let className = "quiz-opt-modern";
              let isCorrect = idx === q.correctAnswer;
              let isSelected = idx === selected;

              if (showExplanation) {
                if (isCorrect) className += " correct";
                else if (isSelected) className += " incorrect";
                else className += " disabled";
              } else if (isSelected) {
                className += " selected";
              }

              return (
                <button
                  key={idx}
                  className={className}
                  onClick={() => handleAnswer(idx)}
                  disabled={showExplanation}
                >
                  <div className="opt-indicator">
                    <span className="opt-char">{String.fromCharCode(65 + idx)}</span>
                  </div>
                  <span className="opt-content">{opt}</span>
                  {showExplanation && isCorrect && (
                    <FaCheckCircle className="status-icon-correct" />
                  )}
                  {showExplanation && isSelected && !isCorrect && (
                    <FaTimesCircle className="status-icon-incorrect" />
                  )}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="explanation-area">
              <div className="exp-header">
                <FaLightbulb /> <span>Explanation</span>
              </div>
              <p className="exp-text">{q.explanation}</p>
              <button className="next-btn-modern" onClick={nextQuestion}>
                {current + 1 === questions.length ? "View Results" : "Next Question"} <FaArrowRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Test;
