import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { SceneBackground } from '../components/SceneBackground';
import { PhilosophyLink } from '../components/PhilosophyLink';
import { LEVEL_NAMES, QUESTIONS_PER_LEVEL } from '../data/questions';

const LEVEL_LABELS: Record<number, string> = LEVEL_NAMES;

// Waypoint card positions (left%, top%) over the mountain SVG
const WAYPOINT_POSITIONS: [string, string][] = [
  ['28%', '76%'],  // Level 1 - low left
  ['66%', '60%'],  // Level 2 - mid-low right
  ['30%', '44%'],  // Level 3 - mid-high left
  ['60%', '36%'],  // Level 4 - near peak right
];

export function QuestMap() {
  const navigate = useNavigate();
  const { progress, getLevelStatus, getLevelProgress, logOut, user } = useGameStore();

  useEffect(() => {
    const fill = document.getElementById('progressFill');
    if (fill) {
      const pct = Math.round((progress.levelsCompleted.filter(Boolean).length / 4) * 100);
      setTimeout(() => { fill.style.width = `${pct}%`; }, 1400);
    }
  }, [progress]);

  const handleLevelClick = (level: number) => {
    if (getLevelStatus(level) === 'locked') return;
    navigate(`/quest/${level}`);
  };

  const getNextLevel = (): number | null => {
    for (let i = 1; i <= 4; i++) {
      if (getLevelStatus(i) === 'available') return i;
    }
    return null;
  };

  const nextLevel = getNextLevel();
  const completedCount = progress.levelsCompleted.filter(Boolean).length;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <SceneBackground />

      {/* LOG OUT */}
      <button
        onClick={() => { logOut(); navigate('/'); }}
        style={{
          position: 'fixed',
          top: '14px',
          right: '20px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '6px',
          color: '#2a2a4a',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          zIndex: 200,
          letterSpacing: '1px',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#555577')}
        onMouseLeave={e => (e.currentTarget.style.color = '#2a2a4a')}
      >
        LOG OUT
      </button>

      {/* ── HEADER ── */}
      <div style={{
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        padding: '14px 20px 6px',
        animation: 'fadeUp 0.7s ease forwards 0.2s',
        opacity: 0,
      }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '6px', color: '#8888aa', letterSpacing: '3px', marginBottom: '4px' }}>
          MARKETINGDOESNTWORK.COM
        </div>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 'clamp(11px, 3vw, 18px)',
          color: '#ffdd57',
          textShadow: '0 0 20px rgba(255,221,87,0.4), 3px 3px 0 #000',
          lineHeight: '1.4',
          animation: 'pulse-gold 3s ease-in-out infinite 1s',
        }}>
          DIFFERENTIATION QUEST
        </div>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '6px',
          color: '#8888aa',
          marginTop: '4px',
          letterSpacing: '2px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
        }}>
          <span>THE MOUNTAIN OF CLARITY</span>
          {user && <span style={{ color: '#57f7ff' }}>· {(user.displayName || user.email.split('@')[0]).toUpperCase()}</span>}
        </div>
      </div>

      {/* ── MOUNTAIN (fills remaining space) ── */}
      <div style={{
        flex: '1 1 0',
        minHeight: 0,
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '0 16px',
        animation: 'fadeUp 0.8s ease forwards 0.5s',
        opacity: 0,
      }}>
        {/* Mountain wrapper: sized by height so it never overflows */}
        <div style={{
          position: 'relative',
          height: '100%',
          aspectRatio: '700 / 520',
          maxWidth: '100%',
        }}>
          <svg viewBox="0 0 700 520" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
            <radialGradient id="peakGlow" cx="50%" cy="15%" r="30%">
              <stop offset="0%" stopColor="#ffdd57" stopOpacity="0.12"/>
              <stop offset="100%" stopColor="#ffdd57" stopOpacity="0"/>
            </radialGradient>
            <rect width="700" height="520" fill="url(#peakGlow)"/>
            <rect x="580" y="30" width="40" height="40" fill="#f0e8d0" opacity="0.9"/>
            <rect x="584" y="34" width="32" height="32" fill="#f0e8d0"/>
            <rect x="592" y="42" width="6" height="6" fill="#d8d0b8" opacity="0.5"/>
            <rect x="602" y="52" width="4" height="4" fill="#d8d0b8" opacity="0.5"/>
            <polygon points="0,520 0,340 80,260 160,320 240,200 330,300 400,180 480,280 550,220 620,300 700,240 700,520" fill="#0a0a2e"/>
            <polygon points="100,520 200,380 260,320 310,260 350,160 390,260 440,320 500,380 600,520" fill="#12124a"/>
            <polygon points="200,380 260,320 310,260 350,160 310,300 260,360 210,420" fill="#0d0d3b" opacity="0.6"/>
            <polygon points="330,185 350,160 370,185 360,195 340,195" fill="#e8e8f0" opacity="0.7"/>

            {[0,1].map(i => (
              <polyline key={i} points={
                i === 0 ? "350,490 340,450 320,420 300,400" : "300,400 290,370 310,340 330,310"
              } stroke="#8b6914" strokeWidth="4" strokeDasharray="8,6" fill="none" opacity="0.8"/>
            ))}
            {[2,3].map(i => (
              <polyline key={i} points={
                i === 2 ? "330,310 345,280 355,255 360,230" : "360,230 358,210 354,190 350,172"
              } stroke={progress.levelsCompleted[i-1] ? '#8b6914' : '#1a1a4a'} strokeWidth="4" strokeDasharray="8,6" fill="none" opacity="0.8"/>
            ))}

            {/* Oracle at base */}
            <rect x="336" y="470" width="28" height="36" fill="#2a1a6e"/>
            <rect x="332" y="476" width="6" height="26" fill="#2a1a6e"/>
            <rect x="362" y="476" width="6" height="26" fill="#2a1a6e"/>
            <rect x="340" y="458" width="20" height="14" fill="#c4a882"/>
            <rect x="340" y="444" width="20" height="16" fill="#c4a882"/>
            <rect x="334" y="440" width="32" height="14" fill="#1a0a5e"/>
            <rect x="338" y="434" width="24" height="10" fill="#1a0a5e"/>
            <rect x="344" y="448" width="5" height="5" fill="#57f7ff"/>
            <rect x="351" y="448" width="5" height="5" fill="#57f7ff"/>
            <rect x="370" y="444" width="3" height="56" fill="#8b6914"/>
            <rect x="367" y="436" width="9" height="9" fill="#57f7ff" opacity="0.8"/>
            <rect x="369" y="438" width="5" height="5" fill="#fff" opacity="0.5"/>
            <rect x="310" y="500" width="80" height="16" fill="rgba(6,6,30,0.8)"/>
            <text x="350" y="512" textAnchor="middle" fontFamily="Press Start 2P" fontSize="7" fill="#8888aa">START HERE</text>
          </svg>

          {/* Waypoint cards */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {[1, 2, 3, 4].map(level => {
              const status = getLevelStatus(level);
              const answered = getLevelProgress(level);
              const [left, top] = WAYPOINT_POSITIONS[level - 1];
              return (
                <div
                  key={level}
                  style={{
                    position: 'absolute',
                    left,
                    top,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'all',
                    cursor: status === 'locked' ? 'default' : 'pointer',
                  }}
                  onClick={() => handleLevelClick(level)}
                >
                  <div style={{
                    background: 'rgba(6,6,30,0.92)',
                    border: `2px solid ${status === 'completed' ? '#8b6914' : status === 'available' ? '#57f7ff' : '#1a1a3a'}`,
                    padding: '7px 10px',
                    textAlign: 'center',
                    minWidth: '110px',
                    transition: 'transform 0.15s, box-shadow 0.2s',
                    position: 'relative',
                    opacity: status === 'locked' ? 0.5 : 1,
                    boxShadow: status === 'available' ? '0 0 16px rgba(87,247,255,0.25)' : status === 'completed' ? '0 0 12px rgba(255,221,87,0.15)' : 'none',
                    animation: status === 'available' ? 'pulse-cyan-border 2s ease-in-out infinite' : 'none',
                  }}>
                    {status === 'completed' && (
                      <div style={{
                        position: 'absolute', top: '-7px', right: '-7px',
                        width: '22px', height: '22px',
                        background: '#ffdd57',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', transform: 'rotate(12deg)',
                      }}>✓</div>
                    )}
                    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '6px', color: status === 'completed' ? '#ffdd57' : status === 'available' ? '#57f7ff' : '#333', marginBottom: '4px' }}>
                      LEVEL {['I','II','III','IV'][level-1]}
                    </div>
                    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: status === 'locked' ? '#333' : '#f0f0f0', lineHeight: '1.8', marginBottom: '5px' }}>
                      {LEVEL_LABELS[level].split(' ').slice(1).join('\n').replace('THY ', 'THY\n')}
                    </div>
                    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '6px', letterSpacing: '1px', color: status === 'completed' ? '#ffdd57' : status === 'available' ? '#57f7ff' : '#2a2a4a', animation: status === 'available' ? 'blink-soft 1.5s ease-in-out infinite' : 'none' }}>
                      {status === 'completed' ? '✦ COMPLETE ✦' : status === 'available' ? '▶ ENTER ◀' : '🔒 LOCKED'}
                    </div>
                    {status !== 'locked' && (
                      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '5px', color: '#2a2a5a', marginTop: '3px' }}>
                        {answered}/{QUESTIONS_PER_LEVEL}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FOOTER: progress + CTA ── */}
      <div style={{
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
        padding: '6px 20px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        animation: 'fadeUp 0.7s ease forwards 1.0s',
        opacity: 0,
      }}>
        {/* Progress bar */}
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Press Start 2P', monospace", fontSize: '6px', color: '#8888aa', marginBottom: '5px' }}>
            <span>QUEST PROGRESS</span>
            <span>{completedCount} / 4 LEVELS</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: '#1a1a3a', border: '2px solid #2a2a5a' }}>
            <div
              id="progressFill"
              style={{ height: '100%', background: 'linear-gradient(90deg, #8b6914, #ffdd57)', width: '0%', transition: 'width 1s ease', boxShadow: '0 0 8px rgba(255,221,87,0.4)' }}
            />
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          {progress.questCompleted ? (
            <button className="btn-gold" style={{ fontSize: '9px', padding: '12px 32px' }} onClick={() => navigate('/quest-complete')}>
              ▶ VIEW YOUR SCROLL
            </button>
          ) : nextLevel ? (
            <>
              <button className="btn-cyan" style={{ fontSize: '9px', padding: '12px 32px' }} onClick={() => navigate(`/quest/${nextLevel}`)}>
                ▶ CONTINUE QUEST
              </button>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '6px', color: '#2a2a5a', letterSpacing: '1px' }}>
                LEVEL {['I','II','III','IV'][nextLevel-1]} · {LEVEL_LABELS[nextLevel]} · {QUESTIONS_PER_LEVEL} QUESTIONS
              </div>
            </>
          ) : (
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#ffdd57' }}>
              ALL LEVELS COMPLETE ✦
            </div>
          )}
        </div>
      </div>

      <PhilosophyLink />
    </div>
  );
}
