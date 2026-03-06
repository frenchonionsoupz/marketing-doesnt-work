import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { SceneBackground } from '../components/SceneBackground';
import { OracleSvg } from '../components/OracleSvg';

const ORACLE_LINES = [
  "You came to me with a business that sounded like everyone else's.",
  "You leave with something no one can copy.",
  "There's no strategy or playbook. This is a path that's entirely your own.",
  "All you need to do is keep walking forward with regular reflection.",
  "The world does not need another version of what every other business is doing.",
  "It needs you.",
];

type Phase = 'walk' | 'win' | 'oracle' | 'generating' | 'done';

export function QuestComplete() {
  const navigate = useNavigate();
  const { user, getAllAnswersFormatted, completeQuest } = useGameStore();

  const [phase, setPhase] = useState<Phase>('walk');
  const [heroPos, setHeroPos] = useState({ x: 430, y: 530 });
  const [flagVisible, setFlagVisible] = useState(false);
  const [oracleLine, setOracleLine] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [typing, setTyping] = useState(false);
  const [lineComplete, setLineComplete] = useState(false);
  const [profile, setProfile] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [generating, setGenerating] = useState(false);

  const rafRef = useRef<number>(0);
  const typeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fireworksRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    completeQuest();
    startWalk();
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(typeRef.current!);
      clearInterval(fireworksRef.current!);
    };
  }, []);

  const startWalk = () => {
    const start = performance.now();
    const duration = 2600;
    const walk = (ts: number) => {
      const t = Math.min((ts - start) / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setHeroPos({ x: 430 + (432 - 430) * ease, y: 530 + (215 - 530) * ease });
      if (t < 1) { rafRef.current = requestAnimationFrame(walk); }
      else { onSummit(); }
    };
    rafRef.current = requestAnimationFrame(walk);
  };

  const onSummit = () => {
    setTimeout(() => {
      setFlagVisible(true);
      spawnFireworks();
      setTimeout(() => setPhase('win'), 1300);
    }, 500);
  };

  const spawnFireworks = () => {
    let count = 0;
    const colors = ['#ffdd57', '#57f7ff', '#ff6bbd', '#ffffff', '#e6a817'];
    fireworksRef.current = setInterval(() => {
      count++;
      if (count > 20) { clearInterval(fireworksRef.current!); return; }
      const fw = document.createElement('div');
      fw.style.cssText = `position:fixed;left:${Math.random()*80+10}%;top:${Math.random()*50+10}%;z-index:50;pointer-events:none;`;
      document.body.appendChild(fw);
      for (let i = 0; i < 10; i++) {
        const p = document.createElement('div');
        const angle = (i / 10) * Math.PI * 2;
        const dist = 40 + Math.random() * 50;
        p.style.cssText = `position:absolute;width:4px;height:4px;background:${colors[Math.floor(Math.random() * colors.length)]};animation:explode ${0.6 + Math.random() * 0.4}s ease-out forwards;--tx:${Math.cos(angle) * dist}px;--ty:${Math.sin(angle) * dist}px;`;
        fw.appendChild(p);
      }
      setTimeout(() => fw.remove(), 1200);
    }, 120);
  };

  const startOracle = () => {
    setPhase('oracle');
    setTimeout(() => typeNextLine(0), 600);
  };

  const typeNextLine = (idx: number) => {
    const text = ORACLE_LINES[idx];
    setOracleLine(idx);
    setDisplayText('');
    setTyping(true);
    setLineComplete(false);
    let i = 0;
    typeRef.current = setInterval(() => {
      i++;
      setDisplayText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(typeRef.current!);
        setTyping(false);
        setLineComplete(true);
      }
    }, 36);
  };

  const advance = () => {
    if (typing) {
      clearInterval(typeRef.current!);
      setDisplayText(ORACLE_LINES[oracleLine]);
      setTyping(false);
      setLineComplete(true);
      return;
    }
    const next = oracleLine + 1;
    if (next < ORACLE_LINES.length) {
      typeNextLine(next);
    } else {
      setPhase('generating');
    }
  };

  const generateProfile = async () => {
    setGenerating(true);
    try {
      const answers = getAllAnswersFormatted();
      const res = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProfile(data.profile);

      // Send email
      if (user?.email) {
        const emailRes = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, name: user.displayName || user.email.split('@')[0], profile: data.profile }),
        });
        const emailData = await emailRes.json();
        if (emailData.error) {
          setEmailError('Profile generated but email failed to send. You can copy it below.');
        } else {
          setEmailSent(true);
        }
      }
      setPhase('done');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setEmailError(`Generation failed: ${msg}`);
      setPhase('done');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
      <SceneBackground />

      {/* Firework CSS keyframe */}
      <style>{`
        @keyframes explode {
          0% { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx,0), var(--ty,0)) scale(0); opacity: 0; }
        }
      `}</style>

      {/* Mountain scene */}
      {phase === 'walk' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet" style={{ width: '100%', maxWidth: '900px', height: '100vh' }}>
            <polygon points="0,600 0,380 100,300 200,360 300,240 420,340 500,220 580,320 650,260 750,340 850,280 900,320 900,600" fill="#0a0a2e"/>
            <polygon points="120,600 240,440 310,360 380,280 450,160 520,280 590,360 660,440 780,600" fill="#12124a"/>
            <polygon points="428,182 450,160 472,182 462,194 438,194" fill="#e8e8f0" opacity="0.75"/>
            <rect x="760" y="40" width="48" height="48" fill="#f0e8d0" opacity="0.85"/>
            <rect x="764" y="44" width="40" height="40" fill="#f0e8d0"/>
            {/* All 4 flags */}
            {[[393,448],[413,373],[430,300],[447,226]].map(([x,y], i) => (
              <g key={i}>
                <rect x={x} y={y} width="3" height="20" fill="#8b6914" opacity={i < 3 || flagVisible ? 1 : 0}/>
                <polygon points={`${x+3},${y} ${x+19},${y+5} ${x+3},${y+11}`} fill="#ffdd57" opacity={i < 3 || flagVisible ? 1 : 0}/>
                <rect x={x-3} y={y+19} width="9" height="4" fill="#8b6914" opacity={i < 3 || flagVisible ? 1 : 0}/>
              </g>
            ))}
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
      )}

      {/* WIN LAYER */}
      {phase === 'win' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 20,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '16px',
          animation: 'fadeUp 0.7s ease forwards',
        }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 'clamp(8px,1.5vw,10px)', color: '#57f7ff', letterSpacing: '6px' }}>
            ✦ QUEST COMPLETE ✦
          </div>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(22px,6vw,48px)',
            color: '#ffdd57',
            textAlign: 'center',
            lineHeight: '1.5',
            textShadow: '0 0 40px rgba(255,221,87,0.7), 4px 4px 0 #000',
            animation: 'gold-shimmer 2.5s ease-in-out infinite',
          }}>
            DIFFERENTIATION<br/>QUEST
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', marginTop: '4px' }}>
            {['THYSELF','THY WORK','THY MARKET','THY PEOPLE'].map((label, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                fontFamily: "'Press Start 2P', monospace", fontSize: '6px', color: '#8b6914', letterSpacing: '1px',
                animation: `fadeUp 0.5s ease forwards ${i * 0.15}s`,
                opacity: 0,
              }}>
                <div style={{ fontSize: '18px' }}>🚩</div>
                <div>{label}</div>
              </div>
            ))}
          </div>
          <button
            className="btn-cyan"
            style={{ marginTop: '8px', fontSize: '10px', padding: '16px 36px' }}
            onClick={startOracle}
          >
            ▶ HEAR THE ORACLE'S FINAL WORD
          </button>
        </div>
      )}

      {/* ORACLE DIALOGUE */}
      {phase === 'oracle' && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 30,
            background: 'rgba(6,6,24,0.75)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'flex-end',
            cursor: 'pointer',
          }}
          onClick={advance}
        >
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            marginBottom: '-2px',
            animation: 'fadeUp 0.7s ease forwards',
          }}>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#ffdd57', letterSpacing: '2px', animation: 'blink-soft 2s ease-in-out infinite' }}>
              ✦ THE ORACLE ✦
            </div>
            <div className="animate-oracle-float">
              <OracleSvg width={72} height={90} />
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: '640px', padding: '0 20px 0' }}>
            <div
              className="dialogue-box-ui"
              style={{ borderBottom: 'none', borderRadius: '0' }}
              onClick={e => { e.stopPropagation(); advance(); }}
            >
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: '#f0f0f0', lineHeight: '2.6', minHeight: '72px', marginBottom: '20px' }}>
                {displayText}
                {typing && <span className="dialogue-cursor" />}
              </div>
              {lineComplete && (
                <div style={{ position: 'absolute', bottom: '12px', right: '16px', fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: '#57f7ff', animation: 'bounce 0.8s ease-in-out infinite' }}>▼</div>
              )}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {ORACLE_LINES.map((_, i) => (
                  <div key={i} style={{
                    width: '8px', height: '8px',
                    background: i < oracleLine ? '#8b6914' : i === oracleLine ? '#57f7ff' : '#1a1a3a',
                    border: '1px solid #2a2a5a',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GENERATING / DONE */}
      {(phase === 'generating' || phase === 'done') && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 30,
          background: 'rgba(6,6,24,0.92)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 20px 40px',
        }}>
          {phase === 'generating' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '640px' }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: '#57f7ff', animation: 'blink-soft 1.5s step-end infinite' }}>
                THE ORACLE IS WRITING YOUR SCROLL...
              </div>
              <button
                className="btn-gold"
                style={{ fontSize: '12px', padding: '20px 52px' }}
                onClick={generateProfile}
                disabled={generating}
              >
                {generating ? '⌛ GENERATING...' : '📜 CLAIM YOUR SCROLL'}
              </button>
              {!generating && (
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#8888aa', letterSpacing: '1px' }}>
                  YOUR DIFFERENTIATION PROFILE WILL BE SENT TO YOUR EMAIL
                </div>
              )}
            </div>
          )}

          {phase === 'done' && (
            <div style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {emailSent && (
                <div style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '8px',
                  color: '#57f7ff',
                  textAlign: 'center',
                  padding: '10px',
                  border: '2px solid #57f7ff',
                  background: 'rgba(87,247,255,0.05)',
                }}>
                  ✦ YOUR SCROLL HAS BEEN SENT TO {user?.email?.toUpperCase()} ✦
                </div>
              )}
              {emailError && (
                <div style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '7px',
                  color: '#ff6bbd',
                  padding: '10px',
                  border: '2px solid #ff6bbd',
                }}>
                  ⚠ {emailError}
                </div>
              )}
              {profile && (
                <div style={{
                  background: '#0a0a1e',
                  border: '3px solid #8b6914',
                  padding: '24px',
                  maxHeight: '60vh',
                  overflowY: 'auto',
                }}>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#ffdd57', letterSpacing: '3px', marginBottom: '16px' }}>
                    YOUR DIFFERENTIATION PROFILE
                  </div>
                  <div style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: '18px',
                    color: '#f0f0f0',
                    lineHeight: '1.7',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {profile}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {profile && (
                  <button
                    className="btn-gold"
                    style={{ fontSize: '9px', padding: '14px 28px' }}
                    onClick={() => {
                      const blob = new Blob([profile], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'differentiation-profile.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    ↓ DOWNLOAD SCROLL
                  </button>
                )}
                <button
                  className="btn-cyan"
                  style={{ fontSize: '9px', padding: '14px 28px' }}
                  onClick={() => navigate('/map')}
                >
                  ← BACK TO MAP
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Claim scroll button when oracle phase ends → generating */}
      {phase === 'generating' && !generating && !profile && (
        <></>
      )}
    </div>
  );
}
