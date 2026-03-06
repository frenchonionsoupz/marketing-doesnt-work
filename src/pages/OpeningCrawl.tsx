import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SceneBackground } from '../components/SceneBackground';

interface CrawlItem {
  id: string;
  type: 'line' | 'sep' | 'box' | 'button';
  text?: string;
  variant?: 'dim' | 'normal' | 'bold-white' | 'accent' | 'gold' | 'pink';
  delay: number;
}

const SEQUENCE: CrawlItem[] = [
  { id: 'l0', type: 'line', text: 'IN A LAND WHERE EVERY BUSINESS', variant: 'dim', delay: 400 },
  { id: 'l1', type: 'line', text: 'LOOKS THE SAME…', variant: 'bold-white', delay: 1200 },
  { id: 'l2', type: 'line', text: 'SOUNDS THE SAME…', variant: 'bold-white', delay: 2000 },
  { id: 'l3', type: 'line', text: 'AND GETS IGNORED THE SAME…', variant: 'bold-white', delay: 2800 },
  { id: 'sep1', type: 'sep', delay: 3600 },
  { id: 'l4', type: 'line', text: 'ONE FOUNDER DARES TO ASK', variant: 'normal', delay: 4200 },
  { id: 'l5', type: 'line', text: 'A DIFFERENT QUESTION.', variant: 'accent', delay: 5000 },
  { id: 'sep2', type: 'sep', delay: 5700 },
  { id: 'l6', type: 'line', text: 'NOT "WHAT IS THE PLAYBOOK?"', variant: 'dim', delay: 6400 },
  { id: 'box', type: 'box', delay: 7400 },
  { id: 'l7', type: 'line', text: 'YOUR QUEST BEGINS NOW.', variant: 'gold', delay: 9000 },
  { id: 'begin', type: 'button', delay: 10200 },
];

function lineStyle(variant?: string): React.CSSProperties {
  const base: React.CSSProperties = {
    fontSize: 'clamp(10px, 2.5vw, 14px)',
    lineHeight: '1',
    marginBottom: '28px',
    letterSpacing: '2px',
    fontFamily: "'Press Start 2P', monospace",
  };
  switch (variant) {
    case 'dim': return { ...base, color: '#8888aa', fontSize: 'clamp(9px, 2vw, 11px)' };
    case 'bold-white': return { ...base, color: '#fff', fontSize: 'clamp(11px, 2.8vw, 16px)' };
    case 'accent': return { ...base, color: '#57f7ff' };
    case 'gold': return { ...base, color: '#ffdd57', fontSize: 'clamp(12px, 3vw, 18px)', textShadow: '0 0 16px rgba(255,221,87,0.5)' };
    case 'pink': return { ...base, color: '#ff6bbd' };
    default: return { ...base, color: '#f0f0f0' };
  }
}

export function OpeningCrawl() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timersRef.current = SEQUENCE.map(({ id, delay }) =>
      setTimeout(() => {
        setVisible(prev => new Set([...prev, id]));
      }, delay)
    );
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const skipAll = () => {
    timersRef.current.forEach(clearTimeout);
    setVisible(new Set(SEQUENCE.map(s => s.id)));
  };

  const goNext = () => navigate('/oracle');

  const show = (id: string) => visible.has(id);

  const fadeStyle = (id: string): React.CSSProperties => ({
    opacity: show(id) ? 1 : 0,
    transform: show(id) ? 'translateY(0)' : 'translateY(12px)',
    transition: 'opacity 0.7s ease, transform 0.7s ease',
  });

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <SceneBackground />

      {/* Skip button */}
      <button
        onClick={skipAll}
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
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#555577')}
        onMouseLeave={e => (e.currentTarget.style.color = '#2a2a4a')}
      >
        SKIP INTRO ▶▶
      </button>

      {/* Crawl content */}
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        paddingBottom: '140px',
        justifyContent: 'center',
        zIndex: 10,
      }}>
        <div style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: '640px',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {SEQUENCE.map(item => {
            if (item.type === 'sep') {
              return (
                <div key={item.id} style={{
                  width: '6px', height: '6px',
                  background: '#333',
                  margin: '8px auto 28px',
                  opacity: show(item.id) ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                }} />
              );
            }
            if (item.type === 'box') {
              return (
                <div key={item.id} style={{
                  border: '3px solid #57f7ff',
                  padding: '20px 28px',
                  marginBottom: '28px',
                  boxShadow: '0 0 20px rgba(87,247,255,0.1)',
                  background: 'rgba(87,247,255,0.03)',
                  ...fadeStyle(item.id),
                }}>
                  <div style={{
                    fontSize: 'clamp(10px, 2.5vw, 13px)',
                    color: '#57f7ff',
                    lineHeight: '2',
                    letterSpacing: '1px',
                    fontFamily: "'Press Start 2P', monospace",
                  }}>
                    "WHAT MAKES ME DIFFERENT?<br/>AND HOW DO I CARVE<br/>MY OWN PATH?"
                  </div>
                </div>
              );
            }
            if (item.type === 'button') {
              return (
                <div key={item.id} style={fadeStyle(item.id)}>
                  <button
                    className="btn-gold"
                    onClick={goNext}
                    style={{ fontSize: '12px', padding: '18px 52px' }}
                  >
                    ▶ BEGIN QUEST
                  </button>
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '7px',
                    color: '#333',
                    marginTop: '16px',
                    animation: 'blink 1.5s step-end infinite',
                  }}>
                    [ CLICK TO CONTINUE ]
                  </div>
                </div>
              );
            }
            return (
              <div key={item.id} style={{ ...lineStyle(item.variant), ...fadeStyle(item.id) }}>
                {item.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
