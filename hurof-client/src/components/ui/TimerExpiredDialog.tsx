import type { QuestionResponse } from '../../types/api';

interface Props {
  question: QuestionResponse | null;
  onStartPhase2: () => void;
  onResetBuzzer: () => void;
}

export function TimerExpiredDialog({ question, onStartPhase2, onResetBuzzer }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4 shadow-2xl">
        <div className="text-center">
          <div className="text-3xl mb-1">⏰</div>
          <p className="text-amber-400 font-black text-lg">انتهى الوقت!</p>
        </div>

        {question && (
          <div className="flex flex-col gap-2">
            <p className="text-white text-sm font-semibold leading-relaxed text-center">
              {question.questionText}
            </p>
            <div className="bg-green-900/50 border border-green-600 rounded-xl p-3 text-green-300 font-bold text-center text-sm">
              {question.answer}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={onStartPhase2}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold transition-colors"
          >
            ابدأ وقت الفريق الآخر
          </button>
          <button
            onClick={onResetBuzzer}
            className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold transition-colors"
          >
            إعادة الطارئ
          </button>
        </div>
      </div>
    </div>
  );
}
