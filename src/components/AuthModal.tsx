import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialTab?: 'signup' | 'login';
}

export function AuthModal({ onClose, onSuccess, initialTab = 'signup' }: AuthModalProps) {
  const [tab, setTab] = useState<'signup' | 'login'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = useGameStore(s => s.signUp);
  const logIn = useGameStore(s => s.logIn);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('All fields are required.');
      return;
    }

    if (tab === 'signup') {
      if (!displayName) {
        setError('Display name is required.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      setLoading(true);
      const result = await signUp(email, password, displayName);
      setLoading(false);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Signup failed.');
      }
    } else {
      setLoading(true);
      const result = await logIn(email, password);
      setLoading(false);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Login failed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="dialogue-box w-full max-w-md animate-slide-in-up">
        {/* Tabs */}
        <div className="flex border-b-2 border-retro-gray mb-6">
          <button
            onClick={() => { setTab('signup'); setError(''); }}
            className={`flex-1 py-3 text-[10px] font-pixel transition-colors ${
              tab === 'signup' ? 'text-retro-pink border-b-2 border-retro-pink -mb-[2px]' : 'text-retro-gray hover:text-white'
            }`}
          >
            INSERT COIN
          </button>
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-3 text-[10px] font-pixel transition-colors ${
              tab === 'login' ? 'text-retro-pink border-b-2 border-retro-pink -mb-[2px]' : 'text-retro-gray hover:text-white'
            }`}
          >
            CONTINUE
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <div>
              <label className="block text-[8px] text-retro-gray mb-2">PLAYER NAME</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="retro-input"
                placeholder="Enter your name..."
                autoFocus
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="block text-[8px] text-retro-gray mb-2">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="retro-input"
              placeholder="player@email.com"
              autoFocus={tab === 'login'}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-[8px] text-retro-gray mb-2">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="retro-input"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-retro-yellow text-[8px] bg-retro-darker p-3 border-2 border-retro-yellow">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button type="submit" className="retro-btn retro-btn-primary flex-1" disabled={loading}>
              {loading ? 'LOADING...' : tab === 'signup' ? 'START GAME' : 'LOG IN'}
            </button>
            <button type="button" onClick={onClose} className="retro-btn flex-1" disabled={loading}>
              BACK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
