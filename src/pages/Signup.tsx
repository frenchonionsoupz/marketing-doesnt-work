import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { SceneBackground } from '../components/SceneBackground';
import { OracleSvg } from '../components/OracleSvg';
import { PhilosophyLink } from '../components/PhilosophyLink';

type Mode = 'signup' | 'login';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function Signup() {
  const navigate = useNavigate();
  const { signUp, logIn, isAuthenticated } = useGameStore();

  const [mode, setMode] = useState<Mode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [optedIn, setOptedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [oracleLine, setOracleLine] = useState<'prompt' | 'welcome'>('prompt');
  const [welcomeName, setWelcomeName] = useState('');

  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/map');
  }, [isAuthenticated, navigate]);

  const shake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  };

  const validate = (): string | null => {
    if (mode === 'signup' && !name.trim()) return 'Name is required.';
    if (!email.trim()) return 'Email is required.';
    if (!isValidEmail(email)) return 'Enter a valid email address.';
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      shake();
      return;
    }
    setError('');
    setLoading(true);

    const result = mode === 'signup'
      ? await signUp(email.trim(), password, name.trim())
      : await logIn(email.trim(), password);

    setLoading(false);
    if (!result.success) {
      const raw = result.error || 'Something went wrong.';
      const msg = raw.toLowerCase().includes('email not confirmed')
        ? 'Email not confirmed. Check your inbox — or ask the admin to disable email confirmation in Supabase.'
        : raw;
      setError(msg);
      shake();
      return;
    }

    if (mode === 'signup') {
      setWelcomeName(name.trim());
      setOracleLine('welcome');
      setTimeout(() => navigate('/map'), 2000);
    } else {
      navigate('/map');
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <SceneBackground />

      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px 180px',
      }}>
        {/* Oracle */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '24px',
          animation: 'fadeUp 0.7s ease forwards 0.3s',
          opacity: 0,
        }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#ffdd57', letterSpacing: '2px', animation: 'blink-soft 2s ease-in-out infinite' }}>
            ✦ THE ORACLE ✦
          </div>
          <div className="animate-oracle-float">
            <OracleSvg />
          </div>
        </div>

        {/* Form box */}
        <div
          ref={boxRef}
          className="dialogue-box-ui"
          style={{
            width: '100%',
            maxWidth: '560px',
            animation: `fadeUp 0.7s ease forwards 0.7s${shaking ? ', shake 0.3s ease' : ''}`,
            opacity: 0,
          }}
        >
          {/* Oracle line */}
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '9px',
            color: '#f0f0f0',
            lineHeight: '2.4',
            marginBottom: '28px',
          }}>
            {oracleLine === 'prompt'
              ? <>
                  {mode === 'signup'
                    ? <>"Before you begin, I need your{' '}<span style={{ color: '#57f7ff' }}>name</span>{' '}and your{' '}<span style={{ color: '#57f7ff' }}>word</span>."</>
                    : <>"Welcome back, traveller. Speak your <span style={{ color: '#57f7ff' }}>credentials</span>."</>
                  }
                </>
              : <>"Welcome, <span style={{ color: '#57f7ff' }}>{welcomeName}</span>.<br/>Your quest begins now."</>
            }
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #1a1a4a', marginBottom: '24px' }} />

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
            {mode === 'signup' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#8888aa', letterSpacing: '2px' }}>YOUR NAME</div>
                <input
                  className="pixel-input"
                  type="text"
                  placeholder="enter your name..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  disabled={loading}
                  autoFocus
                />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#8888aa', letterSpacing: '2px' }}>YOUR EMAIL</div>
              <input
                className="pixel-input"
                type="email"
                placeholder="enter your email..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                disabled={loading}
                autoFocus={mode === 'login'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#8888aa', letterSpacing: '2px' }}>YOUR WORD (PASSWORD)</div>
              <div style={{ position: 'relative' }}>
                <input
                  className="pixel-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="at least 6 characters..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  disabled={loading}
                  style={{ paddingRight: '80px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '6px',
                    color: '#2a2a5a',
                    letterSpacing: '1px',
                    transition: 'color 0.2s',
                    padding: '4px',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#57f7ff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#2a2a5a')}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>
          </div>

          {/* Opt-in (signup only) */}
          {mode === 'signup' && (
            <div
              onClick={() => setOptedIn(v => !v)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                marginBottom: '28px',
                cursor: 'pointer',
                padding: '14px',
                border: `2px solid ${optedIn ? '#8b6914' : '#1a1a4a'}`,
                background: optedIn ? 'rgba(139,105,20,0.08)' : '#08081a',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{
                width: '20px', height: '20px',
                border: `3px solid ${optedIn ? '#ffdd57' : '#2a2a5a'}`,
                background: optedIn ? '#ffdd57' : 'transparent',
                flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.2s, background 0.2s',
                marginTop: '2px',
              }}>
                {optedIn && <span style={{ fontSize: '10px', color: '#000', lineHeight: 1 }}>✓</span>}
              </div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#8888aa', lineHeight: '2.4' }}>
                I accept the{' '}
                <span style={{ color: '#ffdd57' }}>Oracle's very occasional correspondence</span>
                {' '}— no promos or spam.
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#ff6bbd',
              marginBottom: '16px',
              padding: '10px',
              border: '2px solid #ff6bbd',
              background: 'rgba(255,107,189,0.05)',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <button
            className="btn-gold"
            style={{ width: '100%', padding: '18px', fontSize: '11px' }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '...' : mode === 'signup' ? '▶ BEGIN MY QUEST' : '▶ CONTINUE QUEST'}
          </button>

          {/* Toggle */}
          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '7px',
            color: '#2a2a5a',
          }}>
            {mode === 'signup'
              ? <>already registered?{' '}
                  <button
                    onClick={() => { setMode('login'); setError(''); }}
                    style={{ color: '#8888aa', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#57f7ff')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#8888aa')}
                  >
                    continue your quest →
                  </button>
                </>
              : <>new here?{' '}
                  <button
                    onClick={() => { setMode('signup'); setError(''); }}
                    style={{ color: '#8888aa', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#57f7ff')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#8888aa')}
                  >
                    begin from the start →
                  </button>
                </>
            }
          </div>
        </div>
      </div>

      <PhilosophyLink />
    </div>
  );
}
