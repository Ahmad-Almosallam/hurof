import { useState } from 'react';
import type { QuestionResponse } from '../../types/api';

interface QuestionCardProps {
  question: QuestionResponse;
  onNextQuestion: () => void;
  onAssignTeam1: () => void;
  onAssignTeam2: () => void;
  team1Color: string;
  team2Color: string;
  isLoading?: boolean;
  compact?: boolean;
}

const cardStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border-gold)',
  borderRadius: '0.75rem',
};

export function QuestionCard({
  question,
  onNextQuestion,
  onAssignTeam1,
  onAssignTeam2,
  team1Color,
  team2Color,
  isLoading,
  compact,
}: QuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  if (compact) {
    return (
      <div className="question-card flex flex-col gap-1.5 w-full" style={{ ...cardStyle, padding: '0.5rem' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-arabic" style={{ color: 'var(--cream-2)' }}>
            سؤال {question.questionIndex + 1} / {question.totalQuestions}
          </span>
          <span
            className="text-base font-bold"
            style={{ fontFamily: "'Amiri', serif", color: 'var(--gold-2)' }}
          >
            {question.letter}
          </span>
        </div>

        <p className="text-xs font-semibold leading-snug line-clamp-2 font-arabic" style={{ color: 'var(--cream)' }}>
          {question.questionText}
        </p>

        {showAnswer ? (
          <div
            className="rounded-lg px-2 py-1 font-bold text-center text-xs font-arabic cursor-pointer"
            style={{
              background: 'rgba(74,222,128,0.1)',
              border: '1px solid rgba(74,222,128,0.3)',
              color: '#86efac',
            }}
            onClick={() => setShowAnswer(false)}
          >
            {question.answer}
          </div>
        ) : (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full rounded-lg px-2 py-1 font-bold text-center text-xs font-arabic transition-all hover:brightness-110"
            style={{
              background: 'rgba(74,222,128,0.04)',
              border: '1px dashed rgba(74,222,128,0.25)',
              color: 'rgba(134,239,172,0.5)',
            }}
          >
            اكشف الجواب
          </button>
        )}

        <div className="flex gap-1.5">
          <button
            onClick={onAssignTeam1}
            className="flex-1 py-1 rounded-lg font-bold text-white text-xs font-arabic transition-all hover:brightness-110"
            style={{ backgroundColor: team1Color, boxShadow: `0 2px 8px ${team1Color}44` }}
          >
            فريق ١
          </button>
          <button
            onClick={onAssignTeam2}
            className="flex-1 py-1 rounded-lg font-bold text-white text-xs font-arabic transition-all hover:brightness-110"
            style={{ backgroundColor: team2Color, boxShadow: `0 2px 8px ${team2Color}44` }}
          >
            فريق ٢
          </button>
          <button
            onClick={onNextQuestion}
            disabled={isLoading}
            className="flex-1 py-1 rounded-lg text-xs font-arabic transition-all disabled:opacity-50"
            style={{
              background: 'var(--elevated)',
              color: 'var(--cream-2)',
              border: '1px solid var(--border-gold)',
            }}
          >
            سؤال آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="question-card flex flex-col gap-4 w-full" style={{ ...cardStyle, padding: '1.25rem' }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-arabic" style={{ color: 'var(--cream-2)' }}>
          سؤال {question.questionIndex + 1} / {question.totalQuestions}
        </span>
        <span
          className="text-2xl font-bold"
          style={{ fontFamily: "'Amiri', serif", color: 'var(--gold-2)' }}
        >
          {question.letter}
        </span>
      </div>

      <p className="text-lg font-semibold leading-relaxed font-arabic" style={{ color: 'var(--cream)' }}>
        {question.questionText}
      </p>

      {showAnswer ? (
        <div
          className="rounded-xl p-3 font-bold text-center font-arabic cursor-pointer"
          style={{
            background: 'rgba(74,222,128,0.08)',
            border: '1px solid rgba(74,222,128,0.28)',
            color: '#86efac',
          }}
          onClick={() => setShowAnswer(false)}
        >
          {question.answer}
        </div>
      ) : (
        <button
          onClick={() => setShowAnswer(true)}
          className="w-full rounded-xl p-3 font-bold text-center font-arabic transition-all hover:brightness-110"
          style={{
            background: 'rgba(74,222,128,0.04)',
            border: '1px dashed rgba(74,222,128,0.2)',
            color: 'rgba(134,239,172,0.45)',
          }}
        >
          اكشف الجواب
        </button>
      )}

      <div className="flex gap-2">
        <button
          onClick={onAssignTeam1}
          className="flex-1 py-2 rounded-xl font-bold text-white text-sm font-arabic transition-all hover:brightness-110"
          style={{ backgroundColor: team1Color, boxShadow: `0 3px 12px ${team1Color}44` }}
        >
          فريق ١
        </button>
        <button
          onClick={onAssignTeam2}
          className="flex-1 py-2 rounded-xl font-bold text-white text-sm font-arabic transition-all hover:brightness-110"
          style={{ backgroundColor: team2Color, boxShadow: `0 3px 12px ${team2Color}44` }}
        >
          فريق ٢
        </button>
      </div>

      <button
        onClick={onNextQuestion}
        disabled={isLoading}
        className="w-full py-2 rounded-xl text-sm font-arabic transition-all disabled:opacity-50"
        style={{
          background: 'var(--elevated)',
          color: 'var(--cream-2)',
          border: '1px solid var(--border-gold)',
        }}
      >
        سؤال آخر
      </button>
    </div>
  );
}
