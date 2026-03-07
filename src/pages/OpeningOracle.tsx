import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SceneBackground } from '../components/SceneBackground';
import { OracleSvg } from '../components/OracleSvg';

const ORACLE_LINES = [
  "Every business owner who comes to my mountain carries the same wound.",
  "An offer of value, forged with care. And still the masses walked past it like it wasn't there.",
  "The exceptional quality was always there. The only crime was sounding like everyone else.",
  "Your path is different. And it will only reveal itself if you dare to take the first step.",
  "This quest shall not give thee a map — that simply doesn't exist. It shall reveal the truth that's already there.",
];

export function OpeningOracle() {
  const navigate = useNavigate();
  const [oracleVisible, setOracleVisible] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTyping = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const showFullLine = (lineIdx: number) => {
    stopTyping();
    setDisplayText(ORACLE_LINES[lineIdx]);
    setIsTyping(false);
  };

  const startTyping = (lineIdx: number) => {
    stopTyping();
    const text = ORACLE_LINES[lineIdx];
    setDisplayText('');
    setIsTyping(true);
    let char = 0;
    intervalRef.current = setInterval(() => {
      char++;
      setDisplayText(text.slice(0, char));
      if (char >= text.length) {
        stopTyping();
        setIsTyping(false);
      }
    }, 40);
  };

  useEffect(() => {
    const t1 = setTimeout(() => {
      setOracleVisible(true);
      const t2 = setTimeout(() => startTyping(0), 600);
      return () => clearTimeout(t2);
    }, 800);
    return () => {
      clearTimeout(t1);
      stopTyping();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScreenClick = () => {
    if (isTyping) {
      showFullLine(currentLine);
      return;
    }
    const next = currentLine + 1;
    if (next >= ORACLE_LINES.length) {
      setShowFinal(true);
      return;
    }
    setCurrentLine(next);
    startTyping(next);
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentLine === 0) return;
    const prev = currentLine - 1;
    setCurrentLine(prev);
    showFullLine(prev);
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopTyping();
    setShowFinal(true);
  };

  if (showFinal) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <SceneBackground />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '0 24px' }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(18px, 5vw, 32px)',
            color: '#ffdd57',
            textAlign: 'center',
            lineHeight: '1.8',
            textShadow: '0 0 20px rgba(255,221,87,0.5), 3px 3px 0 #8b5e00',
            animation: 'pulse-gold 3s ease-in-out infinite',
          }}>
            DIFFERENTIATION<br/>QUEST
          </div>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '9px',
            color: '#57f7ff',
            letterSpacing: '3px',
            animation: 'blink-soft 2s ease-in-out infinite',
          }}>
            A QUEST FOR BUSINESS CLARITY
          </div>
          <button
            className="btn-gold"
            style={{ marginTop: '12px' }}
            onClick={() => navigate('/signup')}
          >
            ▶ BEGIN QUEST
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ minHeight: '100vh', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
      onClick={handleScreenClick}
    >
      <SceneBackground />

      {/* Skip button */}
      <button
        onClick={handleSkip}
        style={{
          position: 'fixed',
          top: '16px',
          right: '20px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '7px',
          color: '#4a4a7a',
          background: 'rgba(6,6,24,0.8)',
          border: '2px solid #2a2a5a',
          cursor: 'pointer',
          zIndex: 200,
          letterSpacing: '1px',
          padding: '8px 12px',
          transition: 'color 0.2s, border-color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#57f7ff'; e.currentTarget.style.borderColor = '#57f7ff'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#4a4a7a'; e.currentTarget.style.borderColor = '#2a2a5a'; }}
      >
        SKIP ▶▶
      </button>

      {/* Oracle figure */}
      <div style={{
        position: 'fixed',
        bottom: '200px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        opacity: oracleVisible ? 1 : 0,
        transition: 'opacity 0.8s ease',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#57f7ff', letterSpacing: '2px', animation: 'blink-soft 2s ease-in-out infinite' }}>
          ✦ THE ORACLE ✦
        </div>
        <div className="animate-oracle-float">
          <OracleSvg />
        </div>
      </div>

      {/* Dialogue box */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 20px 24px',
        zIndex: 100,
      }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div className="dialogue-box-ui" style={{ position: 'relative' }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
              color: '#ffdd57',
              marginBottom: '14px',
              letterSpacing: '1px',
            }}>
              [ THE ORACLE ]
            </div>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '9px',
              color: '#f0f0f0',
              lineHeight: '2.2',
              minHeight: '60px',
            }}>
              {displayText}
              {isTyping && <span className="dialogue-cursor" />}
            </div>

            {/* "Click anywhere" prompt — shown when line is complete */}
            {!isTyping && (
              <div style={{
                marginTop: '12px',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '7px',
                color: '#57f7ff',
                letterSpacing: '1px',
                animation: 'blink-soft 1.4s ease-in-out infinite',
              }}>
                CLICK ANYWHERE TO CONTINUE
              </div>
            )}
          </div>

          {/* Progress dots + Previous button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px', gap: '16px' }}>
            {/* Previous button */}
            <button
              onClick={handlePrevious}
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '7px',
                color: currentLine > 0 ? '#8888aa' : 'transparent',
                background: 'transparent',
                border: 'none',
                cursor: currentLine > 0 ? 'pointer' : 'default',
                padding: '4px 8px',
                letterSpacing: '1px',
                pointerEvents: currentLine > 0 ? 'all' : 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => { if (currentLine > 0) e.currentTarget.style.color = '#f0f0f0'; }}
              onMouseLeave={e => { if (currentLine > 0) e.currentTarget.style.color = '#8888aa'; }}
            >
              ◀ PREVIOUS
            </button>

            {/* Dots */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {ORACLE_LINES.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '8px',
                    height: '8px',
                    background: i < currentLine ? '#8888aa' : i === currentLine ? '#57f7ff' : '#2a2a5a',
                    transition: 'background 0.3s',
                  }}
                />
              ))}
            </div>

            {/* Spacer to balance the Previous button */}
            <div style={{ width: '88px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
