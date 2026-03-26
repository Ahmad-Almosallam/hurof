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
  if (compact) {
    return (
      <div className="question-card bg-slate-800 rounded-xl p-2 flex flex-col gap-1.5 w-full">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs">
            سؤال {question.questionIndex + 1} / {question.totalQuestions}
          </span>
          <span className="text-base font-bold text-amber-400">{question.letter}</span>
        </div>

        <p className="text-xs font-semibold leading-snug line-clamp-2">{question.questionText}</p>

        <div className="bg-green-900/50 border border-green-600 rounded-lg px-2 py-1 text-green-300 font-bold text-center text-xs">
          {question.answer}
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={onAssignTeam1}
            className="flex-1 py-1 rounded-lg font-bold text-white text-xs"
            style={{ backgroundColor: team1Color }}
          >
            فريق ١
          </button>
          <button
            onClick={onAssignTeam2}
            className="flex-1 py-1 rounded-lg font-bold text-white text-xs"
            style={{ backgroundColor: team2Color }}
          >
            فريق ٢
          </button>
          <button
            onClick={onNextQuestion}
            disabled={isLoading}
            className="flex-1 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs transition-colors disabled:opacity-50"
          >
            سؤال آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="question-card bg-slate-800 rounded-2xl p-5 flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">
          سؤال {question.questionIndex + 1} / {question.totalQuestions}
        </span>
        <span className="text-2xl font-bold text-amber-400">{question.letter}</span>
      </div>

      <p className="text-lg font-semibold leading-relaxed">{question.questionText}</p>

      <div className="bg-green-900/50 border border-green-600 rounded-xl p-3 text-green-300 font-bold text-center">
        {question.answer}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onAssignTeam1}
          className="flex-1 py-2 rounded-xl font-bold text-white text-sm"
          style={{ backgroundColor: team1Color }}
        >
          فريق ١
        </button>
        <button
          onClick={onAssignTeam2}
          className="flex-1 py-2 rounded-xl font-bold text-white text-sm"
          style={{ backgroundColor: team2Color }}
        >
          فريق ٢
        </button>
      </div>

      <button
        onClick={onNextQuestion}
        disabled={isLoading}
        className="w-full py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors disabled:opacity-50"
      >
        سؤال آخر
      </button>
    </div>
  );
}
