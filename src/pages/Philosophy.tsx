import { useNavigate } from 'react-router-dom';
import { SceneBackground } from '../components/SceneBackground';
import { philosophyText } from '../data/philosophy';

export function Philosophy() {
  const navigate = useNavigate();

  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <div key={i} style={{ height: '12px' }} />;

      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <span key={j} style={{ color: '#57f7ff' }}>{part.slice(2, -2)}</span>;
        }
        return part;
      });

      if (line.trim().startsWith('- ')) {
        return (
          <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '8px', paddingLeft: '8px' }}>
            <span style={{ color: '#ffdd57', flexShrink: 0 }}>▸</span>
            <span>{rendered}</span>
          </div>
        );
      }

      if (line.trim().startsWith('#')) {
        return (
          <div key={i} style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(9px, 2vw, 12px)',
            color: '#ffdd57',
            textShadow: '0 0 12px rgba(255,221,87,0.3)',
            margin: '24px 0 12px',
          }}>
            {line.replace(/^#+\s*/, '')}
          </div>
        );
      }

      return <p key={i} style={{ marginBottom: '16px', lineHeight: '2.4' }}>{rendered}</p>;
    });
  };

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
      <SceneBackground />

      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        padding: '32px 20px 200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
          animation: 'fadeUp 0.7s ease forwards',
        }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#8888aa', letterSpacing: '3px', marginBottom: '10px' }}>
            MARKETINGDOESNTWORK.COM
          </div>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(12px, 3vw, 18px)',
            color: '#ffdd57',
            textShadow: '0 0 20px rgba(255,221,87,0.4), 3px 3px 0 #000',
            animation: 'pulse-gold 3s ease-in-out infinite',
          }}>
            THE PHILOSOPHY
          </div>
        </div>

        {/* Content box */}
        <div
          className="dialogue-box-ui"
          style={{
            width: '100%',
            maxWidth: '680px',
            animation: 'fadeUp 0.7s ease forwards 0.3s',
            opacity: 0,
          }}
        >
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(7px, 1.8vw, 9px)',
            color: '#f0f0f0',
            lineHeight: '2.4',
          }}>
            {renderText(philosophyText)}
          </div>
        </div>

        {/* Back button */}
        <div style={{
          marginTop: '32px',
          display: 'flex',
          gap: '16px',
          animation: 'fadeUp 0.7s ease forwards 0.6s',
          opacity: 0,
        }}>
          <button
            className="btn-gold"
            style={{ fontSize: '9px', padding: '14px 28px' }}
            onClick={() => navigate(-1)}
          >
            ← GO BACK
          </button>
          <button
            className="btn-cyan"
            style={{ fontSize: '9px', padding: '14px 28px' }}
            onClick={() => navigate('/signup')}
          >
            BEGIN QUEST ▶
          </button>
        </div>
      </div>
    </div>
  );
}
