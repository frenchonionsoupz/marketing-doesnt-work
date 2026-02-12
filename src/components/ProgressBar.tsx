import { useGameStore } from '../store/gameStore';

export function ProgressBar() {
  const percentage = useGameStore(s => s.getCompletionPercentage());
  const user = useGameStore(s => s.user);

  if (!user) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-retro-black border-b-2 border-retro-gray px-4 py-2">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <span className="text-retro-pink text-[8px] whitespace-nowrap">XP</span>
        <div className="flex-1 h-4 bg-retro-darker border-2 border-retro-gray relative">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{
              width: `${percentage}%`,
              background: percentage >= 100
                ? '#00ff88'
                : `linear-gradient(90deg, #ff6b9d, #ffff00 ${Math.min(percentage + 20, 100)}%)`,
            }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[7px] text-white font-pixel drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
            {percentage}%
          </span>
        </div>
        <span className="text-retro-green text-[8px] whitespace-nowrap">{percentage}%</span>
      </div>
    </div>
  );
}
