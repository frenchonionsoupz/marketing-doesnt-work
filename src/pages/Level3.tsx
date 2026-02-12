import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { QuestionScreen } from '../components/QuestionScreen';
import { Celebration } from '../components/Celebration';
import { level3Questions } from '../data/questions';
import { generateLevelPdf } from '../utils/pdfGenerator';

type Phase = 'select' | 'questions' | 'complete';

export function Level3() {
  const navigate = useNavigate();
  const completeLevel = useGameStore(s => s.completeLevel);
  const answers = useGameStore(s => s.answers);
  const user = useGameStore(s => s.user);
  const getLevelStatus = useGameStore(s => s.getLevelStatus);
  const resetLevel = useGameStore(s => s.resetLevel);

  const status = getLevelStatus('3');

  if (status === 'locked') {
    navigate('/hub');
    return null;
  }

  if (!user) {
    navigate('/');
    return null;
  }

  const isCompleted = status === 'completed';
  const [phase, setPhase] = useState<Phase>(isCompleted ? 'select' : 'questions');
  const [showReplayConfirm, setShowReplayConfirm] = useState(false);

  const handleReplay = () => {
    resetLevel('3');
    setShowReplayConfirm(false);
    setPhase('questions');
  };

  const handleDownload = () => {
    const levelAnswers = Object.values(answers).filter(a => a.level === '3');
    generateLevelPdf('3', levelAnswers, user.displayName);
  };

  if (phase === 'select' && isCompleted) {
    return (
      <div className="min-h-screen p-4 pt-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-retro-green text-sm font-pixel mb-4">LEVEL 3 - COMPLETED</h1>
          <p className="text-retro-gray text-[8px] font-pixel mb-8">
            You've completed the Content Strategy Discovery. You can replay or download your guide.
          </p>
          <div className="space-y-4">
            <button onClick={handleDownload} className="retro-btn retro-btn-green w-full">DOWNLOAD GUIDE</button>
            {showReplayConfirm ? (
              <div className="dialogue-box">
                <p className="text-retro-yellow text-[8px] mb-4">This will replace your previous answers. Continue?</p>
                <div className="flex gap-4">
                  <button onClick={handleReplay} className="retro-btn retro-btn-primary flex-1">YES</button>
                  <button onClick={() => setShowReplayConfirm(false)} className="retro-btn flex-1">NO</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowReplayConfirm(true)} className="retro-btn w-full">REPLAY LEVEL</button>
            )}
            <button onClick={() => navigate('/hub')} className="retro-btn w-full">BACK TO HUB</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <Celebration
        title="LEVEL 3 COMPLETE!"
        subtitle="CONTENT PILLARS DISCOVERED"
        stats={[
          { label: 'QUESTIONS ANSWERED', value: '14' },
          { label: 'CLARITY GAINED', value: '+90' },
          { label: 'CONTENT PILLARS', value: 'DEFINED' },
          { label: 'STATUS', value: 'MASTERED' },
        ]}
      >
        <button onClick={handleDownload} className="retro-btn retro-btn-green w-full mb-4">
          DOWNLOAD YOUR CONTENT STRATEGY
        </button>
        <button onClick={() => navigate('/level/boss')} className="retro-btn retro-btn-primary w-full mb-4">
          FACE THE FINAL BOSS
        </button>
        <button onClick={() => navigate('/hub')} className="retro-btn w-full">
          BACK TO HUB
        </button>
      </Celebration>
    );
  }

  return (
    <QuestionScreen
      questions={level3Questions}
      level="3"
      sublevel={null}
      levelTitle="LEVEL 3: CONTENT STRATEGY DISCOVERY"
      sublevelTitle="CONTENT PILLAR REFLECTIONS"
      onComplete={() => {
        completeLevel('3');
        setPhase('complete');
      }}
      onBack={() => navigate('/hub')}
    />
  );
}
