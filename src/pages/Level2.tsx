import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { QuestionScreen } from '../components/QuestionScreen';
import { Celebration } from '../components/Celebration';
import { level2Fields, level2Questions } from '../data/questions';
import { generateLevelPdf } from '../utils/pdfGenerator';

type Phase = 'select' | 'fields' | 'questions' | 'complete';

const INTRO_TEXT = `For this section, imagine your ideal client. The type that, if every client were exactly like this one, you'd be living in a million-dollar mansion on Easy Street.

This client is a mixture of:
\u2192 A perfect candidate for your service (where your work makes a major impact)
\u2192 Has a high demand for your service
\u2192 Is enjoyable to work with
\u2192 Won't flinch on price

If it helps, define this client with the following fields:`;

export function Level2() {
  const navigate = useNavigate();
  const completeLevel = useGameStore(s => s.completeLevel);
  const answers = useGameStore(s => s.answers);
  const user = useGameStore(s => s.user);
  const getLevelStatus = useGameStore(s => s.getLevelStatus);
  const resetLevel = useGameStore(s => s.resetLevel);

  const status = getLevelStatus('2');

  if (status === 'locked') {
    navigate('/hub');
    return null;
  }

  if (!user) {
    navigate('/');
    return null;
  }

  const isCompleted = status === 'completed';
  const [phase, setPhase] = useState<Phase>(isCompleted ? 'select' : 'fields');
  const [showReplayConfirm, setShowReplayConfirm] = useState(false);

  const handleReplay = () => {
    resetLevel('2');
    setShowReplayConfirm(false);
    setPhase('fields');
  };

  const handleDownload = () => {
    const levelAnswers = Object.values(answers).filter(a => a.level === '2');
    generateLevelPdf('2', levelAnswers, user.displayName);
  };

  if (phase === 'select' && isCompleted) {
    return (
      <div className="min-h-screen p-4 pt-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-retro-green text-sm font-pixel mb-4">LEVEL 2 - COMPLETED</h1>
          <p className="text-retro-gray text-[8px] font-pixel mb-8">
            You've completed the ICP Discovery. You can replay or download your guide.
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
        title="LEVEL 2 COMPLETE!"
        subtitle="ICP DISCOVERED"
        stats={[
          { label: 'QUESTIONS ANSWERED', value: '20' },
          { label: 'CLARITY GAINED', value: '+75' },
          { label: 'CLIENT PROFILE', value: 'DEFINED' },
          { label: 'STATUS', value: 'MASTERED' },
        ]}
      >
        <button onClick={handleDownload} className="retro-btn retro-btn-green w-full mb-4">
          DOWNLOAD YOUR ICP GUIDE
        </button>
        <button onClick={() => navigate('/level/3')} className="retro-btn retro-btn-primary w-full mb-4">
          CONTINUE TO LEVEL 3
        </button>
        <button onClick={() => navigate('/hub')} className="retro-btn w-full">
          BACK TO HUB
        </button>
      </Celebration>
    );
  }

  if (phase === 'fields') {
    return (
      <QuestionScreen
        questions={level2Fields}
        level="2"
        sublevel="fields"
        levelTitle="LEVEL 2: ICP DISCOVERY"
        sublevelTitle="DEFINE YOUR IDEAL CLIENT"
        onComplete={() => setPhase('questions')}
        onBack={() => navigate('/hub')}
        introText={INTRO_TEXT}
      />
    );
  }

  return (
    <QuestionScreen
      questions={level2Questions}
      level="2"
      sublevel={null}
      levelTitle="LEVEL 2: ICP DISCOVERY"
      sublevelTitle="DEEP ICP QUESTIONS"
      onComplete={() => {
        completeLevel('2');
        setPhase('complete');
      }}
      onBack={() => setPhase('fields')}
    />
  );
}
