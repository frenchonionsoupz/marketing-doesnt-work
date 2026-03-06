import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { SceneBackground } from '../components/SceneBackground';
import { getLevelQuestions, LEVEL_NAMES } from '../data/questions';

export function QuestScreen() {
  const { level: levelParam } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const { saveAnswer, getAnswer, setCurrentPosition, completeLevel, progress, getLevelStatus } = useGameStore();

  const level = parseInt(levelParam || '1', 10);
  const questions = getLevelQuestions(level);
  const levelName = LEVEL_NAMES[level] || '';
  const status = getLevelStatus(level);

  // Start from stored progress if on the same level
  const storedIndex = progress.currentLevel === level ? progress.currentQuestionIndex : 0;

  // currentIndex: which question is "active" (unfurled)
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    // Start at storedIndex, but don't go past how many are answered
    const answeredCount = questions.filter((q, i) => getAnswer(q.id).trim().length > 0).length;
    return Math.min(storedIndex, answeredCount);
  });

  const [draft, setDraft] = useState<string>(() => getAnswer(questions[currentIndex]?.id || '') || '');
  const [sealedFeedback, setSealedFeedback] = useState(false);

  // Sync draft when currentIndex changes
  useEffect(() => {
    if (questions[currentIndex]) {
      setDraft(getAnswer(questions[currentIndex].id) || '');
    }
  }, [currentIndex]);

  // Save position to DB
  useEffect(() => {
    setCurrentPosition(level, currentIndex);
  }, [currentIndex, level]);

  if (status === 'locked') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <SceneBackground />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '12px', color: '#ffdd57', marginBottom: '20px' }}>
            🔒 LEVEL LOCKED
          </div>
          <button className="btn-gold" onClick={() => navigate('/map')}>← BACK TO MAP</button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const isAnswered = (idx: number) => getAnswer(questions[idx]?.id || '').trim().length > 0;
  const canSeal = draft.trim().length > 10;

  const sealAnswer = () => {
    if (!canSeal || !q) return;
    saveAnswer(q.id, q.text, draft.trim(), level);
    setSealedFeedback(true);
    setTimeout(() => {
      setSealedFeedback(false);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // All questions done — complete level
        completeLevel(level);
        if (level === 4) {
          navigate('/quest-complete');
        } else {
          navigate(`/level-complete/${level}`);
        }
      }
    }, 500);
  };

  const goBack = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goNext = () => {
    if (!canSeal && !isAnswered(currentIndex)) return;
    if (canSeal && !isAnswered(currentIndex)) {
      sealAnswer();
      return;
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const completedPips = questions.filter((_, i) => isAnswered(i)).length;

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
      <SceneBackground />

      {/* Mountains at bottom (smaller for question screen) */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '120px', pointerEvents: 'none', zIndex: 3 }}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <polygon points="0,120 0,70 80,40 160,70 240,20 340,70 440,45 520,80 600,25 700,70 800,40 900,70 1000,20 1100,60 1200,45 1200,120" fill="#0d0d3b"/>
          <polygon points="0,120 0,85 100,60 200,85 280,52 380,85 480,65 560,95 640,58 740,85 840,62 940,85 1040,52 1140,80 1200,68 1200,120" fill="#12124a"/>
        </svg>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 20px 160px',
      }}>
        {/* HUD */}
        <div style={{
          width: '100%',
          maxWidth: '640px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          animation: 'fadeUp 0.6s ease forwards 0.2s',
          opacity: 0,
        }}>
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#ffdd57', letterSpacing: '1px' }}>
              LEVEL {['I','II','III','IV'][level-1]}
            </div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#8888aa', marginTop: '6px', letterSpacing: '1px' }}>
              {levelName}
            </div>
          </div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#8888aa', letterSpacing: '2px', textAlign: 'center' }}>
            DIFFERENTIATION QUEST
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#8888aa' }}>
              Q{currentIndex + 1} OF {questions.length}
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', justifyContent: 'flex-end' }}>
              {questions.map((_, i) => (
                <div key={i} style={{
                  width: '10px', height: '10px',
                  background: isAnswered(i) ? '#ffdd57' : i === currentIndex ? '#57f7ff' : '#1a1a3a',
                  border: `2px solid ${isAnswered(i) ? '#8b6914' : i === currentIndex ? '#57f7ff' : '#2a2a5a'}`,
                  transition: 'background 0.3s, border-color 0.3s',
                  animation: i === currentIndex && !isAnswered(i) ? 'blink-soft 1s ease-in-out infinite' : 'none',
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Scrolls list */}
        <div style={{
          width: '100%',
          maxWidth: '640px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          animation: 'fadeUp 0.7s ease forwards 0.5s',
          opacity: 0,
        }}>
          {questions.map((question, idx) => {
            const answer = getAnswer(question.id);
            const answered = answer.trim().length > 0;
            const isActive = idx === currentIndex;
            const isLocked = idx > currentIndex && !answered;

            if (answered && !isActive) {
              // Done state
              return (
                <div
                  key={question.id}
                  onClick={() => setCurrentIndex(idx)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '14px 16px',
                    background: 'rgba(139,105,20,0.08)',
                    border: '2px solid #8b6914',
                  }}>
                    <div style={{ fontSize: '14px', flexShrink: 0, marginTop: '2px', color: '#ffdd57' }}>✦</div>
                    <div>
                      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#8b6914', lineHeight: '2', marginBottom: '6px' }}>
                        Q{idx + 1} · {question.text}
                      </div>
                      <div style={{ fontFamily: "'VT323', monospace", fontSize: '16px', color: '#ffdd57', lineHeight: '1.5' }}>
                        {answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (isActive) {
              // Active unfurled scroll
              return (
                <div key={question.id} className="scroll-active-card">
                  <div className="scroll-curl" />
                  <div style={{ padding: '20px 28px', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: 'rgba(26,16,8,0.5)', letterSpacing: '2px', marginBottom: '10px' }}>
                      QUESTION {idx + 1} OF {questions.length}
                    </div>
                    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: '#1a1008', lineHeight: '2.2', marginBottom: '18px' }}>
                      {question.text}
                    </div>
                    <textarea
                      className="scroll-textarea"
                      placeholder="write your answer here... let it be messy."
                      rows={4}
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      autoFocus
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: 'rgba(26,16,8,0.35)' }}>
                        {draft.length} characters
                      </div>
                      <button
                        onClick={sealAnswer}
                        style={{
                          fontFamily: "'Press Start 2P', monospace",
                          fontSize: '7px',
                          padding: '8px 14px',
                          background: canSeal ? '#1a1008' : 'rgba(26,16,8,0.3)',
                          color: canSeal ? '#e8d9b0' : 'rgba(232,217,176,0.4)',
                          border: 'none',
                          cursor: canSeal ? 'pointer' : 'not-allowed',
                          opacity: canSeal ? 1 : 0.5,
                          boxShadow: canSeal ? '2px 2px 0 #000' : 'none',
                          transition: 'opacity 0.2s',
                        }}
                        disabled={!canSeal}
                      >
                        {sealedFeedback ? 'SEALED ✓' : 'SEAL ✓'}
                      </button>
                    </div>
                  </div>
                  <div className="scroll-curl bottom" />
                </div>
              );
            }

            // Locked/future
            return (
              <div key={question.id}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  background: 'rgba(6,6,20,0.6)',
                  border: '2px solid #1a1a3a',
                  opacity: 0.45,
                }}>
                  <div style={{ fontSize: '16px', flexShrink: 0 }}>📜</div>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#2a2a5a', lineHeight: '2' }}>
                    Q{idx + 1} · {question.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nav */}
        <div style={{
          width: '100%',
          maxWidth: '640px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '24px',
          animation: 'fadeUp 0.6s ease forwards 0.9s',
          opacity: 0,
        }}>
          <button
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '9px',
              padding: '14px 24px',
              background: 'transparent',
              border: '2px solid #2a2a5a',
              color: '#8888aa',
              cursor: currentIndex > 0 ? 'pointer' : 'not-allowed',
              transition: 'border-color 0.2s, color 0.2s',
              opacity: currentIndex > 0 ? 1 : 0.3,
            }}
            onClick={goBack}
            disabled={currentIndex === 0}
            onMouseEnter={e => { if (currentIndex > 0) { e.currentTarget.style.borderColor = '#57f7ff'; e.currentTarget.style.color = '#57f7ff'; }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a5a'; e.currentTarget.style.color = '#8888aa'; }}
          >
            ◀ BACK
          </button>

          <button
            onClick={() => navigate('/map')}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#2a2a5a',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#8888aa')}
            onMouseLeave={e => (e.currentTarget.style.color = '#2a2a5a')}
          >
            ↩ RETURN TO MAP
          </button>

          <button
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '9px',
              padding: '14px 24px',
              background: 'transparent',
              border: `2px solid ${isAnswered(currentIndex) || canSeal ? '#57f7ff' : '#2a2a5a'}`,
              color: isAnswered(currentIndex) || canSeal ? '#57f7ff' : '#8888aa',
              cursor: 'pointer',
              transition: 'border-color 0.2s, color 0.2s, background 0.2s',
            }}
            onClick={goNext}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#57f7ff';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = isAnswered(currentIndex) || canSeal ? '#57f7ff' : '#8888aa';
            }}
          >
            {currentIndex === questions.length - 1 ? 'FINISH ▶' : 'NEXT ▶'}
          </button>
        </div>
      </div>
    </div>
  );
}
