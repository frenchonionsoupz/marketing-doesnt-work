import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Question } from '../types';

interface QuestionScreenProps {
  questions: Question[];
  level: string;
  sublevel: string | null;
  levelTitle: string;
  sublevelTitle?: string;
  onComplete: () => void;
  onBack?: () => void;
  introText?: string;
}

export function QuestionScreen({
  questions,
  level,
  sublevel,
  levelTitle,
  sublevelTitle,
  onComplete,
  onBack,
  introText,
}: QuestionScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [showIntro, setShowIntro] = useState(!!introText);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const saveAnswer = useGameStore(s => s.saveAnswer);
  const getAnswer = useGameStore(s => s.getAnswer);
  const setCurrentPosition = useGameStore(s => s.setCurrentPosition);

  const question = questions[currentIndex];
  const [text, setText] = useState(getAnswer(question.id));

  // Update text when question changes
  useEffect(() => {
    setText(getAnswer(questions[currentIndex].id));
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentIndex, getAnswer, questions]);

  // Update position in store
  useEffect(() => {
    setCurrentPosition(level, sublevel, currentIndex);
  }, [currentIndex, level, sublevel, setCurrentPosition]);

  // Auto-save
  const doSave = useCallback((value: string) => {
    saveAnswer(question.id, question.text, value, level, sublevel);
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 1500);
  }, [question, level, sublevel, saveAnswer]);

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

  const goNext = () => {
    saveNow();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const goPrev = () => {
    saveNow();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (showIntro && introText) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-12">
        <div className="max-w-2xl mx-auto">
          <div className="dialogue-box animate-slide-in-up">
            <h2 className="text-retro-pink text-sm mb-6 font-pixel">{levelTitle}</h2>
            <div className="text-[10px] text-retro-gray-light leading-[2.5] whitespace-pre-line mb-8">
              {introText}
            </div>
            <button onClick={() => setShowIntro(false)} className="retro-btn retro-btn-primary w-full">
              LET'S GO
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 pt-12">
      {/* Header */}
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-retro-pink text-[8px]">{levelTitle}</span>
          {sublevelTitle && <span className="text-retro-gray text-[8px]">{sublevelTitle}</span>}
        </div>

        {/* Sub progress */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-2 bg-retro-darker border border-retro-gray">
            <div
              className="h-full bg-retro-pink transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-retro-gray text-[8px] whitespace-nowrap">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
        <div className="dialogue-box mb-6 animate-fade-in" key={question.id}>
          <p className="text-[10px] md:text-xs text-retro-white leading-[2.5]">
            {question.text}
          </p>
        </div>

        {/* Answer area */}
        <div className="relative mb-6 flex-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onBlur={saveNow}
            className="retro-textarea w-full"
            style={{ minHeight: '180px' }}
            placeholder="Type your answer here..."
          />
          {/* Save indicator */}
          <div
            className={`absolute bottom-2 right-2 text-[7px] text-retro-green transition-opacity duration-300 ${
              saveIndicator ? 'opacity-100' : 'opacity-0'
            }`}
          >
            PROGRESS SAVED
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          {onBack && currentIndex === 0 ? (
            <button onClick={onBack} className="retro-btn flex-1">
              BACK TO HUB
            </button>
          ) : (
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="retro-btn flex-1"
            >
              PREV
            </button>
          )}
          <button onClick={goNext} className="retro-btn retro-btn-primary flex-1">
            {currentIndex < questions.length - 1 ? 'NEXT' : 'COMPLETE'}
          </button>
        </div>
      </div>
    </div>
  );
}
