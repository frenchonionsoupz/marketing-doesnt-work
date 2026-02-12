import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore, tryAutoLogin } from './store/gameStore';
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
  useEffect(() => {
    tryAutoLogin();
  }, []);

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
