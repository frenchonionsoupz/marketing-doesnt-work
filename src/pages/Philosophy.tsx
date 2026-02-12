import { useNavigate } from 'react-router-dom';
import { philosophyText } from '../data/philosophy';

export function Philosophy() {
  const navigate = useNavigate();

  // Simple markdown-like rendering
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <br key={i} />;

      // Bold text
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-retro-pink">{part.slice(2, -2)}</strong>;
        }
        // List items
        if (part.trim().startsWith('- ')) {
          return <span key={j} className="text-retro-green">{part}</span>;
        }
        return part;
      });

      if (line.trim().startsWith('- ')) {
        return <div key={i} className="ml-4 mb-2">{rendered}</div>;
      }

      return <p key={i} className="mb-4">{rendered}</p>;
    });
  };

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-retro-pink text-sm md:text-base font-pixel mb-8 text-center animate-fade-in">
          THE PHILOSOPHY
        </h1>

        <div className="dialogue-box animate-slide-in-up">
          <div className="text-[9px] md:text-[10px] text-retro-gray-light leading-[2.5] font-pixel">
            {renderText(philosophyText)}
          </div>
        </div>

        <div className="text-center mt-8">
          <button onClick={() => navigate('/')} className="retro-btn">
            BACK TO MENU
          </button>
        </div>
      </div>
    </div>
  );
}
