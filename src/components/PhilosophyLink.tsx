import { useNavigate } from 'react-router-dom';

export function PhilosophyLink() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/philosophy')}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'none',
        opacity: 1,
      }}
      className="philosophy-link-btn"
    >
      <svg width="16" height="20" viewBox="0 0 16 20" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
        <rect x="2" y="2" width="12" height="16" fill="none" stroke="#8888aa" strokeWidth="1.5"/>
        <rect x="0" y="1" width="16" height="4" rx="2" fill="#1a1a4a" stroke="#8888aa" strokeWidth="1.5"/>
        <rect x="0" y="15" width="16" height="4" rx="2" fill="#1a1a4a" stroke="#8888aa" strokeWidth="1.5"/>
        <rect x="4" y="7" width="8" height="1.5" fill="#8888aa" opacity="0.6"/>
        <rect x="4" y="10" width="6" height="1.5" fill="#8888aa" opacity="0.6"/>
        <rect x="4" y="13" width="7" height="1.5" fill="#8888aa" opacity="0.6"/>
      </svg>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#8888aa', letterSpacing: '1px' }}>
        THE PHILOSOPHY
      </span>
    </button>
  );
}
