import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { QuestionScreen } from '../components/QuestionScreen';
import { Celebration } from '../components/Celebration';
import { level1aQuestions, level1bQuestions, level1cQuestions } from '../data/questions';
import { generateLevelPdf } from '../utils/pdfGenerator';

type Phase = 'select' | '1a' | '1b' | '1c' | 'complete';

export function Level1() {
  const navigate = useNavigate();
  const progress = useGameStore(s => s.progress);
  const completeLevel = useGameStore(s => s.completeLevel);
  const answers = useGameStore(s => s.answers);
  const user = useGameStore(s => s.user);
  const getLevelStatus = useGameStore(s => s.getLevelStatus);
  const resetLevel = useGameStore(s => s.resetLevel);

  const isCompleted = getLevelStatus('1') === 'completed';
  const [phase, setPhase] = useState<Phase>(isCompleted ? 'select' : '1a');
  const [showReplayConfirm, setShowReplayConfirm] = useState(false);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleReplay = () => {
    resetLevel('1');
    setShowReplayConfirm(false);
    setPhase('1a');
  };

  const handleDownload = () => {
    const levelAnswers = Object.values(answers).filter(a => a.level === '1');
    generateLevelPdf('1', levelAnswers, user.displayName);
  };

  if (phase === 'select' && isCompleted) {
    return (
      <div className="min-h-screen p-4 pt-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-retro-green text-sm font-pixel mb-4">LEVEL 1 - COMPLETED</h1>
          <p className="text-retro-gray text-[8px] font-pixel mb-8">
            You've completed the Differentiation Discovery. You can replay or download your guide.
          </p>

          <div className="space-y-4">
            <button onClick={handleDownload} className="retro-btn retro-btn-green w-full">
              DOWNLOAD GUIDE
            </button>

            {showReplayConfirm ? (
              <div className="dialogue-box">
                <p className="text-retro-yellow text-[8px] mb-4">
                  This will replace your previous answers. Continue?
                </p>
                <div className="flex gap-4">
                  <button onClick={handleReplay} className="retro-btn retro-btn-primary flex-1">YES</button>
                  <button onClick={() => setShowReplayConfirm(false)} className="retro-btn flex-1">NO</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowReplayConfirm(true)} className="retro-btn w-full">
                REPLAY LEVEL
              </button>
            )}

            <button onClick={() => navigate('/hub')} className="retro-btn w-full">
              BACK TO HUB
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <Celebration
        title="LEVEL 1 COMPLETE!"
        subtitle="DIFFERENTIATION DISCOVERED"
        stats={[
          { label: 'QUESTIONS ANSWERED', value: '31' },
          { label: 'CLARITY GAINED', value: '+50' },
          { label: 'SUB-LEVELS CLEARED', value: '3/3' },
          { label: 'STATUS', value: 'MASTERED' },
        ]}
      >
        <button onClick={handleDownload} className="retro-btn retro-btn-green w-full mb-4">
          DOWNLOAD YOUR GUIDE
        </button>
        <button onClick={() => navigate('/level/2')} className="retro-btn retro-btn-primary w-full mb-4">
          CONTINUE TO LEVEL 2
        </button>
        <button onClick={() => navigate('/hub')} className="retro-btn w-full">
          BACK TO HUB
        </button>
      </Celebration>
    );
  }

  if (phase === '1a') {
    return (
      <QuestionScreen
        questions={level1aQuestions}
        level="1"
        sublevel="1a"
        levelTitle="LEVEL 1: DIFFERENTIATION DISCOVERY"
        sublevelTitle="1A: KNOW THYSELF"
        onComplete={() => setPhase('1b')}
        onBack={() => navigate('/hub')}
      />
    );
  }

  if (phase === '1b') {
    return (
      <QuestionScreen
        questions={level1bQuestions}
        level="1"
        sublevel="1b"
        levelTitle="LEVEL 1: DIFFERENTIATION DISCOVERY"
        sublevelTitle="1B: KNOW THY WORK"
        onComplete={() => setPhase('1c')}
        onBack={() => setPhase('1a')}
      />
    );
  }

  return (
    <QuestionScreen
      questions={level1cQuestions}
      level="1"
      sublevel="1c"
      levelTitle="LEVEL 1: DIFFERENTIATION DISCOVERY"
      sublevelTitle="1C: KNOW THY MARKET"
      onComplete={() => {
        completeLevel('1');
        setPhase('complete');
      }}
      onBack={() => setPhase('1b')}
    />
  );
}
