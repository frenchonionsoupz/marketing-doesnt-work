import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SceneBackground } from '../components/SceneBackground';
import { LEVEL_COMPLETE_MESSAGES } from '../data/questions';

export function LevelComplete() {
  const { level: levelParam } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const level = parseInt(levelParam || '1', 10);
  const oracleMessage = LEVEL_COMPLETE_MESSAGES[level] || '"Well done."';
  const levelRoman = ['I', 'II', 'III', 'IV'][level - 1];

  const [phase, setPhase] = useState<'walk' | 'flag' | 'text'>('walk');
  const [showWaypoint, setShowWaypoint] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showOracle, setShowOracle] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [oracleText, setOracleText] = useState('');
  const [heroPos, setHeroPos] = useState({ x: 430, y: 530 });

  const rafRef = useRef<number>(0);
  const typeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Skip button
  const skip = () => {
    cancelAnimationFrame(rafRef.current);
    clearInterval(typeRef.current!);
    setPhase('text');
    setShowWaypoint(true);
    setShowComplete(true);
    setShowOracle(true);
    setOracleText(oracleMessage);
    setShowButton(true);
  };

  useEffect(() => {
    // Walk hero to waypoint
    const startTime = performance.now();
    const duration = 2200;
    const fromX = 430, fromY = 530;
    const toX = 393, toY = 430;

    const walk = (ts: number) => {
      const t = Math.min((ts - startTime) / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setHeroPos({ x: fromX + (toX - fromX) * ease, y: fromY + (toY - fromY) * ease });
      if (t < 1) { rafRef.current = requestAnimationFrame(walk); }
      else { onArrival(); }
    };

    rafRef.current = requestAnimationFrame(walk);
    return () => { cancelAnimationFrame(rafRef.current); clearInterval(typeRef.current!); };
  }, []);

  const onArrival = () => {
    setPhase('flag');
    setTimeout(() => {
      setShowWaypoint(true);
      setTimeout(() => {
        setPhase('text');
        setShowComplete(true);
        setTimeout(() => {
          setShowOracle(true);
          let i = 0;
          const text = oracleMessage;
          typeRef.current = setInterval(() => {
            i++;
            setOracleText(text.slice(0, i));
            if (i >= text.length) {
              clearInterval(typeRef.current!);
              setTimeout(() => setShowButton(true), 400);
            }
          }, 38);
        }, 1100);
      }, 400);
    }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
      <SceneBackground />

      {/* Skip */}
      {!showButton && (
        <button
          onClick={skip}
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '7px',
            color: '#2a2a4a',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            zIndex: 200,
            letterSpacing: '1px',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#555577')}
          onMouseLeave={e => (e.currentTarget.style.color = '#2a2a4a')}
        >
          SKIP ▶▶
        </button>
      )}

      {/* Mountain SVG scene */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 3, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet" style={{ width: '100%', maxWidth: '900px', height: '100vh' }}>
          <radialGradient id="pgGrad" cx="50%" cy="30%" r="25%">
            <stop offset="0%" stopColor="#ffdd57" stopOpacity={showComplete ? 0.35 : 0}/>
            <stop offset="100%" stopColor="#ffdd57" stopOpacity="0"/>
          </radialGradient>
          <rect width="900" height="600" fill="url(#pgGrad)" style={{ transition: 'opacity 0.5s' }}/>
          <polygon points="0,600 0,380 100,300 200,360 300,240 420,340 500,220 580,320 650,260 750,340 850,280 900,320 900,600" fill="#0a0a2e"/>
          <polygon points="120,600 240,440 310,360 380,280 450,160 520,280 590,360 660,440 780,600" fill="#12124a"/>
          <polygon points="240,440 310,360 380,280 450,160 400,300 340,380 280,460" fill="#0d0d3b" opacity="0.55"/>
          <polygon points="428,182 450,160 472,182 462,194 438,194" fill="#e8e8f0" opacity="0.75"/>
          <rect x="760" y="40" width="48" height="48" fill="#f0e8d0" opacity="0.85"/>
          <rect x="764" y="44" width="40" height="40" fill="#f0e8d0"/>
          {/* Path */}
          <polyline points="450,560 440,520 420,490 400,465" stroke="#8b6914" strokeWidth="4" strokeDasharray="8,6" fill="none" opacity="0.7"/>
          <polyline points="400,465 390,440 405,415 420,390" stroke="#8b6914" strokeWidth="4" strokeDasharray="8,6" fill="none" opacity="0.7"/>
          {/* Waypoint flag */}
          {showWaypoint && (
            <>
              <rect x="393" y="448" width="3" height="20" fill="#8b6914"/>
              <polygon points="396,448 412,453 396,459" fill="#ffdd57"/>
              <rect x="390" y="467" width="9" height="4" fill="#8b6914"/>
              <circle cx="395" cy="458" r="18" fill="#ffdd57" opacity="0.08"/>
            </>
          )}
          {/* Hero */}
          <g transform={`translate(${heroPos.x}, ${heroPos.y})`}>
            <ellipse cx="6" cy="24" rx="8" ry="3" fill="#000" opacity="0.3"/>
            <rect x="0" y="10" width="12" height="14" fill="#3a7a3a"/>
            <rect x="1" y="2" width="10" height="10" fill="#c4a882"/>
            <rect x="0" y="0" width="12" height="4" fill="#8b4000"/>
            <rect x="3" y="4" width="2" height="2" fill="#1a0808"/>
            <rect x="7" y="4" width="2" height="2" fill="#1a0808"/>
            <rect x="1" y="24" width="4" height="6" fill="#2a5a2a"/>
            <rect x="7" y="24" width="4" height="6" fill="#2a5a2a"/>
          </g>
        </svg>
      </div>

      {/* Text overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        gap: '20px',
      }}>
        {/* WAYPOINT SECURED */}
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 'clamp(10px, 2.5vw, 14px)',
          color: '#57f7ff',
          letterSpacing: '6px',
          opacity: showWaypoint ? 1 : 0,
          transform: showWaypoint ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
          WAYPOINT SECURED
        </div>

        {/* LEVEL X COMPLETE */}
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 'clamp(18px, 5vw, 36px)',
          color: '#ffdd57',
          textShadow: '0 0 30px rgba(255,221,87,0.6), 4px 4px 0 #000',
          opacity: showComplete ? 1 : 0,
          transform: showComplete ? 'scale(1)' : 'scale(1.4)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          textAlign: 'center',
          lineHeight: '1.6',
          animation: showComplete ? 'gold-shimmer 2s ease-in-out infinite 0.4s' : 'none',
        }}>
          LEVEL {levelRoman}<br/>COMPLETE
        </div>

        {/* Oracle box */}
        {showOracle && (
          <div style={{
            background: 'rgba(6,6,30,0.95)',
            border: '3px solid #57f7ff',
            padding: '18px 28px',
            maxWidth: '480px',
            width: '90%',
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 0 24px rgba(87,247,255,0.15)',
            opacity: showOracle ? 1 : 0,
            transform: showOracle ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}>
            <div style={{
              position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
              fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#ffdd57',
              background: '#060618', padding: '0 8px', whiteSpace: 'nowrap',
            }}>✦ THE ORACLE ✦</div>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '9px',
              color: '#f0f0f0',
              lineHeight: '2.4',
            }}>
              {oracleText}
              {oracleText.length < oracleMessage.length && <span className="dialogue-cursor" />}
            </div>
          </div>
        )}

        {/* Continue button */}
        {showButton && (
          <div style={{ pointerEvents: 'all' }}>
            <button
              className="btn-gold"
              style={{ fontSize: '11px', padding: '18px 48px' }}
              onClick={() => navigate('/map')}
            >
              CONTINUE THE CLIMB ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
