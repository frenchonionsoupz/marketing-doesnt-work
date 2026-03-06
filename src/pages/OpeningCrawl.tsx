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
  { id: 'l0', type: 'line', text: 'IN A LAND WHERE EVERY BUSINESS', variant: 'dim', delay: 150 },
  { id: 'l1', type: 'line', text: 'LOOKS THE SAME…', variant: 'bold-white', delay: 500 },
  { id: 'l2', type: 'line', text: 'SOUNDS THE SAME…', variant: 'bold-white', delay: 850 },
  { id: 'l3', type: 'line', text: 'AND GETS IGNORED THE SAME…', variant: 'bold-white', delay: 1200 },
  { id: 'sep1', type: 'sep', delay: 1500 },
  { id: 'l4', type: 'line', text: 'ONE FOUNDER DARES TO ASK', variant: 'normal', delay: 1750 },
  { id: 'l5', type: 'line', text: 'A DIFFERENT QUESTION.', variant: 'accent', delay: 2100 },
  { id: 'sep2', type: 'sep', delay: 2400 },
  { id: 'l6', type: 'line', text: 'NOT "WHAT IS THE PLAYBOOK?"', variant: 'dim', delay: 2700 },
  { id: 'box', type: 'box', delay: 3200 },
  { id: 'l7', type: 'line', text: 'YOUR QUEST BEGINS NOW.', variant: 'gold', delay: 4200 },
  { id: 'begin', type: 'button', delay: 5000 },
];

function lineStyle(variant?: string): React.CSSProperties {
  const base: React.CSSProperties = {
    fontSize: 'clamp(7px, 1.6vw, 10px)',
    lineHeight: '1',
    marginBottom: '10px',
    letterSpacing: '2px',
    fontFamily: "'Press Start 2P', monospace",
  };
  switch (variant) {
    case 'dim': return { ...base, color: '#8888aa', fontSize: 'clamp(6px, 1.3vw, 9px)' };
    case 'bold-white': return { ...base, color: '#fff', fontSize: 'clamp(8px, 1.8vw, 12px)' };
    case 'accent': return { ...base, color: '#57f7ff' };
    case 'gold': return { ...base, color: '#ffdd57', fontSize: 'clamp(9px, 2vw, 13px)', textShadow: '0 0 16px rgba(255,221,87,0.5)' };
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

  const fadeStyle = (id: string): React.CSSProperties => show(id)
    ? { animation: 'crawl-slam 0.28s ease-out forwards' }
    : { opacity: 0 };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <SceneBackground />

      {/* Skip button — prominent */}
      <button
        onClick={skipAll}
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

      {/* Crawl content — no scroll, everything fits */}
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        overflow: 'hidden',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
          width: '100%',
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
                  margin: '4px auto 12px',
                  opacity: show(item.id) ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                }} />
              );
            }
            if (item.type === 'box') {
              return (
                <div key={item.id} style={{
                  border: '2px solid #57f7ff',
                  padding: '12px 20px',
                  marginBottom: '14px',
                  boxShadow: '0 0 16px rgba(87,247,255,0.1)',
                  background: 'rgba(87,247,255,0.03)',
                  ...fadeStyle(item.id),
                }}>
                  <div style={{
                    fontSize: 'clamp(7px, 1.6vw, 10px)',
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
                    style={{ fontSize: '10px', padding: '14px 40px' }}
                  >
                    ▶ BEGIN QUEST
                  </button>
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '6px',
                    color: '#333',
                    marginTop: '10px',
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
