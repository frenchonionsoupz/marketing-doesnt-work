import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Celebration } from '../components/Celebration';
import { bossQuestions } from '../data/questions';
import { generateMasterPdf } from '../utils/pdfGenerator';
import { TOTAL_QUESTIONS } from '../data/questions';

type Phase = 'intro' | 'battle' | 'victory';

export function Boss() {
  const navigate = useNavigate();
  const completeLevel = useGameStore(s => s.completeLevel);
  const answers = useGameStore(s => s.answers);
  const user = useGameStore(s => s.user);
  const getLevelStatus = useGameStore(s => s.getLevelStatus);
  const resetLevel = useGameStore(s => s.resetLevel);
  const saveAnswer = useGameStore(s => s.saveAnswer);
  const getAnswer = useGameStore(s => s.getAnswer);
  const getTimeInvested = useGameStore(s => s.getTimeInvested);

  const status = getLevelStatus('boss');

  if (status === 'locked') {
    navigate('/hub');
    return null;
  }

  if (!user) {
    navigate('/');
    return null;
  }

  const isCompleted = status === 'completed';
  const [phase, setPhase] = useState<Phase>(isCompleted ? 'victory' : 'intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bossHP, setBossHP] = useState(100);
  const [showDamage, setShowDamage] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [text, setText] = useState('');
  const [saveIndicator, setSaveIndicator] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const question = bossQuestions[currentIndex];

  useEffect(() => {
    if (phase === 'battle' && question) {
      setText(getAnswer(question.id));
      textareaRef.current?.focus();
    }
  }, [currentIndex, phase, question, getAnswer]);

  const doSave = useCallback((value: string) => {
    if (!question) return;
    saveAnswer(question.id, question.text, value, 'boss', null);
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 1500);
  }, [question, saveAnswer]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(value), 1500);
  };

  const saveNow = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    doSave(text);
  };

  const handleAttack = () => {
    saveNow();

    // Deal damage
    const damage = 100 / bossQuestions.length;
    setBossHP(prev => Math.max(0, prev - damage));
    setShowDamage(true);
    setShaking(true);

    setTimeout(() => setShowDamage(false), 1000);
    setTimeout(() => setShaking(false), 300);

    if (currentIndex < bossQuestions.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 800);
    } else {
      setTimeout(() => {
        completeLevel('boss');
        setPhase('victory');
      }, 1200);
    }
  };

  const handleDownload = () => {
    generateMasterPdf(Object.values(answers), user.displayName, getTimeInvested());
  };

  const handleReplay = () => {
    resetLevel('boss');
    setBossHP(100);
    setCurrentIndex(0);
    setPhase('intro');
  };

  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Boss sprite (ASCII art) */}
          <div className="mb-8 animate-slide-in-up">
            <pre className="text-retro-pink text-[8px] md:text-[10px] font-pixel leading-tight inline-block text-left">
{`    ╔══════════════╗
    ║  ╔══╗  ╔══╗  ║
    ║  ║XX║  ║XX║  ║
    ║  ╚══╝  ╚══╝  ║
    ║    ╔════╗    ║
    ║    ║~~~~║    ║
    ║    ╚════╝    ║
    ╚══════════════╝
     ╔══╗    ╔══╗
     ║  ║    ║  ║
     ╚══╝    ╚══╝`}
            </pre>
          </div>

          <h1 className="text-retro-yellow text-lg md:text-xl font-pixel mb-2 animate-glow">
            FINAL BOSS
          </h1>
          <h2 className="text-retro-pink text-sm md:text-base font-pixel mb-8">
            THE CONFUSION
          </h2>

          <div className="dialogue-box mb-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <p className="text-[10px] text-retro-gray-light leading-[2.5]">
              "You've discovered your differentiation, your people, and your message.
              But can you bring it all together?"
            </p>
          </div>

          <p className="text-retro-yellow text-[8px] font-pixel mb-8 animate-blink">
            PREPARE FOR THE FINAL CHALLENGE!
          </p>

          <button
            onClick={() => setPhase('battle')}
            className="retro-btn retro-btn-primary text-sm animate-fade-in"
            style={{ animationDelay: '1s' }}
          >
            FIGHT!
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'battle') {
    return (
      <div className="min-h-screen flex flex-col p-4 pt-12">
        <div className="max-w-3xl mx-auto w-full">
          {/* Boss HP bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-retro-yellow text-[8px]">THE CONFUSION</span>
              <span className="text-retro-pink text-[8px]">HP</span>
            </div>
            <div className="h-6 bg-retro-darker border-2 border-retro-gray relative overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${shaking ? 'animate-shake' : ''}`}
                style={{
                  width: `${bossHP}%`,
                  background: bossHP > 60 ? '#ff0000' : bossHP > 30 ? '#ffff00' : '#00ff88',
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-pixel drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                {Math.round(bossHP)}%
              </span>
            </div>
          </div>

          {/* Damage indicator */}
          {showDamage && (
            <div className="text-center mb-4">
              <span className="text-retro-green text-lg font-pixel animate-slide-in-up inline-block">
                CLARITY +{Math.round(100 / bossQuestions.length)}!
              </span>
            </div>
          )}

          {/* Question progress */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-retro-pink text-[8px]">ATTACK {currentIndex + 1}/{bossQuestions.length}</span>
            <div className="flex-1 h-2 bg-retro-darker border border-retro-gray">
              <div
                className="h-full bg-retro-green transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / bossQuestions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col" key={question?.id}>
          <div className="dialogue-box mb-6 animate-fade-in">
            <p className="text-[10px] md:text-xs text-retro-white leading-[2.5]">
              {question?.text}
            </p>
          </div>

          <div className="relative mb-6 flex-1">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onBlur={saveNow}
              className="retro-textarea w-full"
              style={{ minHeight: '180px' }}
              placeholder="Write your answer to deal damage..."
            />
            <div
              className={`absolute bottom-2 right-2 text-[7px] text-retro-green transition-opacity duration-300 ${
                saveIndicator ? 'opacity-100' : 'opacity-0'
              }`}
            >
              PROGRESS SAVED
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <button
              onClick={() => {
                saveNow();
                if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
              }}
              disabled={currentIndex === 0}
              className="retro-btn flex-1"
            >
              PREV
            </button>
            <button
              onClick={handleAttack}
              className="retro-btn retro-btn-primary flex-1"
            >
              {currentIndex < bossQuestions.length - 1 ? 'ATTACK!' : 'FINAL BLOW!'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Victory
  const totalAnswered = Object.values(answers).filter(a => a.answerText.trim()).length;

  return (
    <Celebration
      title="YOU DEFEATED THE CONFUSION!"
      subtitle="CLARITY ACHIEVED!"
      stats={[
        { label: 'TOTAL ANSWERED', value: String(totalAnswered) },
        { label: 'LEVELS COMPLETED', value: '3 + BOSS' },
        { label: 'CLARITY LEVEL', value: 'MAXIMUM' },
        { label: 'TIME INVESTED', value: getTimeInvested() },
      ]}
    >
      <div className="dialogue-box mb-6 text-left">
        <h3 className="text-retro-green text-[10px] font-pixel mb-3">QUEST COMPLETE!</h3>
        <p className="text-[8px] text-retro-gray-light leading-[2.5]">
          You've completed the entire quest for business clarity. Your Master Guide contains
          all your answers and insights from every level. Download it and use it to guide
          your marketing and business strategy going forward.
        </p>
      </div>

      <button onClick={handleDownload} className="retro-btn retro-btn-green w-full mb-4">
        DOWNLOAD MASTER GUIDE
      </button>
      <button onClick={handleReplay} className="retro-btn w-full mb-4">
        REPLAY BOSS
      </button>
      <button onClick={() => navigate('/hub')} className="retro-btn w-full">
        RETURN TO HUB
      </button>
    </Celebration>
  );
}
