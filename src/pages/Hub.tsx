import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export function Hub() {
  const navigate = useNavigate();
  const user = useGameStore(s => s.user);
  const progress = useGameStore(s => s.progress);
  const getLevelStatus = useGameStore(s => s.getLevelStatus);
  const logOut = useGameStore(s => s.logOut);

  if (!user) {
    navigate('/');
    return null;
  }

  const levels = [
    {
      id: '1',
      name: 'LEVEL 1',
      title: 'DIFFERENTIATION DISCOVERY',
      description: 'Know thyself, thy work, and thy market',
      questions: 31,
      sublevels: '3 sub-levels',
    },
    {
      id: '2',
      name: 'LEVEL 2',
      title: 'ICP DISCOVERY',
      description: 'Define and understand your ideal client',
      questions: 20,
      sublevels: 'Fields + Questions',
    },
    {
      id: '3',
      name: 'LEVEL 3',
      title: 'CONTENT STRATEGY',
      description: 'Discover your content pillars',
      questions: 14,
      sublevels: 'Content Reflections',
    },
    {
      id: 'boss',
      name: 'FINAL BOSS',
      title: 'THE CLARITY CHALLENGE',
      description: 'Synthesize everything you discovered',
      questions: 5,
      sublevels: 'Boss Battle',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '\u2705';
      case 'available': return '\uD83C\uDFAE';
      case 'locked': return '\uD83D\uDD12';
      default: return '\uD83D\uDD12';
    }
  };

  const handleLevelClick = (levelId: string) => {
    const status = getLevelStatus(levelId);
    if (status === 'locked') return;
    navigate(`/level/${levelId}`);
  };

  // Find the current incomplete level for the CONTINUE button
  const getCurrentLevel = () => {
    if (!progress.level1Completed) return '1';
    if (!progress.level2Completed) return '2';
    if (!progress.level3Completed) return '3';
    if (!progress.bossCompleted) return 'boss';
    return null;
  };

  const currentLevel = getCurrentLevel();

  return (
    <div className="min-h-screen p-4 pt-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-retro-pink text-sm font-pixel mb-2">QUEST HUB</h1>
            <p className="text-retro-gray text-[8px] font-pixel">
              Welcome back, {user.displayName}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/profile')} className="retro-btn text-[8px]">
              PROFILE
            </button>
            <button onClick={() => { logOut(); navigate('/'); }} className="retro-btn text-[8px]">
              LOG OUT
            </button>
          </div>
        </div>

        {/* Continue button */}
        {currentLevel && (
          <div className="mb-8 animate-slide-in-up">
            <button
              onClick={() => navigate(`/level/${currentLevel}`)}
              className="retro-btn retro-btn-primary w-full text-sm py-4 animate-glow"
            >
              {progress.currentLevel === '1' && progress.currentQuestionIndex === 0 && !progress.level1Completed
                ? 'BEGIN QUEST'
                : `CONTINUE \u25B6 LEVEL ${currentLevel === 'boss' ? 'BOSS' : currentLevel}`}
            </button>
          </div>
        )}

        {progress.bossCompleted && (
          <div className="mb-8 dialogue-box text-center">
            <p className="text-retro-green text-sm font-pixel animate-glow">QUEST COMPLETE!</p>
            <p className="text-retro-gray text-[8px] font-pixel mt-2">All levels mastered. You can replay any level below.</p>
          </div>
        )}

        {/* Level cards */}
        <div className="space-y-4">
          {levels.map((level) => {
            const status = getLevelStatus(level.id);
            return (
              <div
                key={level.id}
                onClick={() => handleLevelClick(level.id)}
                className={`level-card ${status}`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{getStatusIcon(status)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-pixel ${
                        status === 'completed' ? 'text-retro-green' :
                        status === 'available' ? 'text-retro-pink' : 'text-retro-gray'
                      }`}>
                        {level.name}
                      </span>
                      <span className={`text-[8px] font-pixel px-2 py-1 ${
                        status === 'completed' ? 'bg-retro-green/20 text-retro-green' :
                        status === 'available' ? 'bg-retro-pink/20 text-retro-pink' : 'bg-retro-gray/20 text-retro-gray'
                      }`}>
                        {status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className={`text-sm font-pixel mb-2 ${
                      status === 'locked' ? 'text-retro-gray' : 'text-white'
                    }`}>
                      {level.title}
                    </h3>
                    <p className="text-[8px] text-retro-gray font-pixel">{level.description}</p>
                    <div className="flex gap-4 mt-3 text-[7px] text-retro-gray font-pixel">
                      <span>{level.questions} questions</span>
                      <span>{level.sublevels}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
