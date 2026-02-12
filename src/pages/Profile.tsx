import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { generateLevelPdf, generateMasterPdf } from '../utils/pdfGenerator';

export function Profile() {
  const navigate = useNavigate();
  const user = useGameStore(s => s.user);
  const progress = useGameStore(s => s.progress);
  const answers = useGameStore(s => s.answers);
  const deleteAccount = useGameStore(s => s.deleteAccount);
  const logOut = useGameStore(s => s.logOut);
  const getTimeInvested = useGameStore(s => s.getTimeInvested);
  const getCompletionPercentage = useGameStore(s => s.getCompletionPercentage);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleDownloadPdf = (level: string) => {
    const levelAnswers = Object.values(answers).filter(a => a.level === level);
    generateLevelPdf(level, levelAnswers, user.displayName);
  };

  const handleDownloadMaster = () => {
    generateMasterPdf(Object.values(answers), user.displayName, getTimeInvested());
  };

  const handleDelete = () => {
    deleteAccount();
    navigate('/');
  };

  const completedLevels = [
    progress.level1Completed,
    progress.level2Completed,
    progress.level3Completed,
    progress.bossCompleted,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen p-4 pt-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-retro-pink text-sm font-pixel mb-8">PLAYER PROFILE</h1>

        {/* User info */}
        <div className="dialogue-box mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-[8px] text-retro-gray mb-1">PLAYER NAME</div>
              <div className="text-xs text-white">{user.displayName}</div>
            </div>
            <div>
              <div className="text-[8px] text-retro-gray mb-1">EMAIL</div>
              <div className="text-xs text-white break-all">{user.email}</div>
            </div>
            <div>
              <div className="text-[8px] text-retro-gray mb-1">JOINED</div>
              <div className="text-xs text-white">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-[8px] text-retro-gray mb-1">TIME INVESTED</div>
              <div className="text-xs text-white">{getTimeInvested()}</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="dialogue-box mb-6">
          <h2 className="text-retro-green text-[10px] font-pixel mb-4">QUEST STATS</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-retro-pink text-lg font-pixel">{getCompletionPercentage()}%</div>
              <div className="text-[7px] text-retro-gray mt-1">COMPLETE</div>
            </div>
            <div>
              <div className="text-retro-pink text-lg font-pixel">{completedLevels}/4</div>
              <div className="text-[7px] text-retro-gray mt-1">LEVELS</div>
            </div>
            <div>
              <div className="text-retro-pink text-lg font-pixel">
                {Object.values(answers).filter(a => a.answerText.trim()).length}
              </div>
              <div className="text-[7px] text-retro-gray mt-1">ANSWERED</div>
            </div>
          </div>
        </div>

        {/* Downloads */}
        <div className="dialogue-box mb-6">
          <h2 className="text-retro-green text-[10px] font-pixel mb-4">DOWNLOAD GUIDES</h2>
          <div className="space-y-3">
            {progress.level1Completed && (
              <button onClick={() => handleDownloadPdf('1')} className="retro-btn w-full text-[8px]">
                LEVEL 1 - DIFFERENTIATION GUIDE
              </button>
            )}
            {progress.level2Completed && (
              <button onClick={() => handleDownloadPdf('2')} className="retro-btn w-full text-[8px]">
                LEVEL 2 - ICP PROFILE
              </button>
            )}
            {progress.level3Completed && (
              <button onClick={() => handleDownloadPdf('3')} className="retro-btn w-full text-[8px]">
                LEVEL 3 - CONTENT STRATEGY
              </button>
            )}
            {progress.bossCompleted && (
              <button onClick={handleDownloadMaster} className="retro-btn retro-btn-green w-full text-[8px]">
                MASTER GUIDE - COMPLETE
              </button>
            )}
            {!progress.level1Completed && (
              <p className="text-[8px] text-retro-gray text-center">
                Complete levels to unlock downloadable guides.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button onClick={() => navigate('/hub')} className="retro-btn flex-1">
            BACK TO HUB
          </button>
          <button onClick={() => { logOut(); navigate('/'); }} className="retro-btn flex-1">
            LOG OUT
          </button>
        </div>

        {/* Danger zone */}
        <div className="border-2 border-red-900 p-4">
          <h3 className="text-red-500 text-[8px] font-pixel mb-3">DANGER ZONE</h3>
          {showDeleteConfirm ? (
            <div>
              <p className="text-retro-yellow text-[8px] mb-3">
                Are you sure? This will permanently delete your account and all progress. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={handleDelete} className="retro-btn text-[8px] border-red-500 text-red-500 hover:bg-red-500 hover:text-black flex-1">
                  YES, DELETE
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="retro-btn text-[8px] flex-1">
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="retro-btn text-[8px] border-red-900 text-red-500 hover:bg-red-500 hover:text-black"
            >
              DELETE ACCOUNT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
