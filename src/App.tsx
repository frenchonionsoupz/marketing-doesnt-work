import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import { ProgressBar } from './components/ProgressBar';
import { CrtOverlay } from './components/CrtOverlay';
import { Landing } from './pages/Landing';
import { Philosophy } from './pages/Philosophy';
import { Hub } from './pages/Hub';
import { Profile } from './pages/Profile';
import { Level1 } from './pages/Level1';
import { Level2 } from './pages/Level2';
import { Level3 } from './pages/Level3';
import { Boss } from './pages/Boss';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useGameStore(s => s.isAuthenticated);
  const isLoading = useGameStore(s => s.isLoading);
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function LevelRouter() {
  return (
    <Routes>
      <Route path="1" element={<Level1 />} />
      <Route path="2" element={<Level2 />} />
      <Route path="3" element={<Level3 />} />
      <Route path="boss" element={<Boss />} />
    </Routes>
  );
}

export default function App() {
  const initSession = useGameStore(s => s.initSession);
  const isLoading = useGameStore(s => s.isLoading);

  useEffect(() => {
    initSession();
  }, [initSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-retro-black text-retro-white font-pixel">
        <CrtOverlay />
        <div className="min-h-screen flex items-center justify-center bg-black">
          <p className="text-retro-pink text-sm font-pixel animate-blink">LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-retro-black text-retro-white font-pixel">
        <CrtOverlay />
        <ProgressBar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/philosophy" element={<Philosophy />} />
          <Route path="/hub" element={
            <ProtectedRoute><Hub /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/level/*" element={
            <ProtectedRoute><LevelRouter /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
