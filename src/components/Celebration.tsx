import { useEffect, useState } from 'react';

interface CelebrationProps {
  title: string;
  subtitle?: string;
  stats?: { label: string; value: string }[];
  children?: React.ReactNode;
}

export function Celebration({ title, subtitle, stats, children }: CelebrationProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);

  useEffect(() => {
    const emojis = ['\u2B50', '\u2728', '\uD83C\uDF1F', '\uD83D\uDCA5', '\u26A1', '\uD83C\uDF89'];
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 100 + Math.random() * 20,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-12 relative overflow-hidden">
      {/* Particles */}
      {particles.map(p => (
        <span
          key={p.id}
          className="star-particle"
          style={{
            left: `${p.x}%`,
            bottom: `${p.y}%`,
            animationDelay: `${Math.random() * 1}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}

      <div className="text-center max-w-2xl mx-auto">
        {/* Main title */}
        <div className="mb-8 animate-slide-in-up">
          <h1 className="text-retro-green text-xl md:text-3xl font-pixel animate-glow mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-retro-yellow text-sm md:text-base font-pixel">
              {subtitle}
            </p>
          )}
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="dialogue-box mb-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="p-3">
                  <div className="text-retro-gray text-[8px] mb-2">{stat.label}</div>
                  <div className="text-retro-pink text-sm">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '1s' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
