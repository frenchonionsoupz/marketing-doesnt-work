import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import { OpeningCrawl } from './pages/OpeningCrawl';
import { OpeningOracle } from './pages/OpeningOracle';
import { Signup } from './pages/Signup';
import { QuestMap } from './pages/QuestMap';
import { QuestScreen } from './pages/QuestScreen';
import { LevelComplete } from './pages/LevelComplete';
import { QuestComplete } from './pages/QuestComplete';
import { Philosophy } from './pages/Philosophy';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useGameStore(s => s.isAuthenticated);
  const isLoading = useGameStore(s => s.isLoading);
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/signup" replace />;
  return <>{children}</>;
}

export default function App() {
  const { initSession, isLoading } = useGameStore();

  useEffect(() => {
    initSession();
  }, [initSession]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#060618',
      }}>
        <p style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '12px',
          color: '#57f7ff',
          animation: 'blink 1s step-end infinite',
        }}>LOADING...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Opening flow */}
        <Route path="/" element={<OpeningCrawl />} />
        <Route path="/oracle" element={<OpeningOracle />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/philosophy" element={<Philosophy />} />

        {/* Protected game routes */}
        <Route path="/map" element={
          <ProtectedRoute><QuestMap /></ProtectedRoute>
        } />
        <Route path="/quest/:level" element={
          <ProtectedRoute><QuestScreen /></ProtectedRoute>
        } />
        <Route path="/level-complete/:level" element={
          <ProtectedRoute><LevelComplete /></ProtectedRoute>
        } />
        <Route path="/quest-complete" element={
          <ProtectedRoute><QuestComplete /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
