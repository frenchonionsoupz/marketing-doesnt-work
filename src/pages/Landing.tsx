import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { AuthModal } from '../components/AuthModal';

type Phase = 'intro' | 'menu';

export function Landing() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [introLine, setIntroLine] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<'signup' | 'login'>('signup');
  const [cursorPos, setCursorPos] = useState(0);

  const isAuthenticated = useGameStore(s => s.isAuthenticated);
  const navigate = useNavigate();

  const introLines = [
    'In a world drowning in marketing tactics...',
    'Where every "expert" has THE solution...',
    'One truth remains:',
  ];

  // Auto-advance intro
  useEffect(() => {
    if (phase !== 'intro') return;

    if (introLine < introLines.length) {
      const timer = setTimeout(() => setIntroLine(introLine + 1), 2000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setPhase('menu'), 2500);
      return () => clearTimeout(timer);
    }
  }, [phase, introLine, introLines.length]);

  // Skip intro on any key/click
  useEffect(() => {
    if (phase !== 'intro') return;

    const handleSkip = () => setPhase('menu');
    window.addEventListener('keydown', handleSkip);
    window.addEventListener('click', handleSkip);
    return () => {
      window.removeEventListener('keydown', handleSkip);
      window.removeEventListener('click', handleSkip);
    };
  }, [phase]);

  const handleAuthSuccess = () => {
    setShowAuth(false);
    navigate('/hub');
  };

  const handleMenuSelect = (option: string) => {
    if (option === 'start') {
      if (isAuthenticated) {
        navigate('/hub');
      } else {
        setAuthTab('signup');
        setShowAuth(true);
      }
    } else if (option === 'login') {
      if (isAuthenticated) {
        navigate('/hub');
      } else {
        setAuthTab('login');
        setShowAuth(true);
      }
    } else if (option === 'philosophy') {
      navigate('/philosophy');
    }
  };

  const menuItems = [
    { id: 'start', label: 'START GAME' },
    { id: 'philosophy', label: 'PHILOSOPHY' },
    { id: 'login', label: isAuthenticated ? 'CONTINUE GAME' : 'LOG IN' },
  ];

  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="max-w-2xl mx-auto text-center">
          {introLines.slice(0, introLine).map((line, i) => (
            <p
              key={i}
              className="text-retro-gray-light text-xs md:text-sm font-pixel mb-6 animate-fade-in leading-[2.5]"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              {line}
            </p>
          ))}

          {introLine >= introLines.length && (
            <div className="mt-8 animate-fade-in">
              <h1 className="text-retro-pink text-lg md:text-2xl font-pixel animate-glow mb-4">
                MARKETING DOESN'T WORK
              </h1>
              <p className="text-retro-gray text-[8px] md:text-[10px] font-pixel">
                (At least not the way you've been told)
              </p>
            </div>
          )}

          <p className="text-retro-gray text-[8px] font-pixel mt-16 animate-blink">
            PRESS ANY KEY TO CONTINUE
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="max-w-lg mx-auto text-center w-full">
        {/* Title */}
        <div className="mb-16 animate-slide-in-up">
          <h1 className="text-retro-pink text-lg md:text-2xl font-pixel mb-4 animate-glow">
            MARKETING<br />DOESN'T WORK
          </h1>
          <div className="flex justify-center gap-2 my-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-retro-pink" />
            ))}
          </div>
          <p className="text-retro-gray text-[8px] font-pixel">
            A QUEST FOR BUSINESS CLARITY
          </p>
        </div>

        {/* Menu */}
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {menuItems.map((item, i) => (
            <button
              key={item.id}
              onClick={() => handleMenuSelect(item.id)}
              onMouseEnter={() => setCursorPos(i)}
              className={`w-full text-left py-3 px-6 text-xs font-pixel transition-colors flex items-center gap-4 ${
                cursorPos === i ? 'text-retro-white' : 'text-retro-gray'
              }`}
            >
              <span className={`inline-block transition-opacity ${cursorPos === i ? 'opacity-100 text-retro-pink' : 'opacity-0'}`}>
                {'\u25B6'}
              </span>
              {item.label}
            </button>
          ))}
        </div>

        <p className="text-retro-gray text-[7px] font-pixel mt-16">
          &copy; 2025 MARKETINGDOESNTWORK.COM
        </p>
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
          initialTab={authTab}
        />
      )}
    </div>
  );
}
