import type { QuestionResponse } from '../../types/api';

interface Props {
  question: QuestionResponse | null;
  onStartPhase2: () => void;
  onResetBuzzer: () => void;
  onAssignTeam1: () => void;
  onAssignTeam2: () => void;
  team1Color: string;
  team2Color: string;
}

export function TimerExpiredDialog({ question, onStartPhase2, onResetBuzzer, onAssignTeam1, onAssignTeam2, team1Color, team2Color }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ background: 'rgba(7,9,15,0.78)' }}
    >
      <div
        className="w-full max-w-sm mx-4 flex flex-col gap-4 rounded-2xl p-6 shadow-2xl"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-gold)',
          animation: 'float-in-scale 0.3s ease both',
        }}
      >
        <div className="text-center">
          <div className="text-3xl mb-1">⏰</div>
          <p className="font-black text-lg font-arabic" style={{ color: 'var(--gold-2)' }}>انتهى الوقت!</p>
        </div>

        {question && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold leading-relaxed text-center font-arabic" style={{ color: 'var(--cream)' }}>
              {question.questionText}
            </p>
            <div
              className="rounded-xl p-3 font-bold text-center text-sm font-arabic"
              style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.28)', color: '#86efac' }}
            >
              {question.answer}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onAssignTeam1}
            className="flex-1 py-3 rounded-xl font-black text-white font-arabic transition-all hover:brightness-110"
            style={{ backgroundColor: team1Color, boxShadow: `0 3px 12px ${team1Color}44` }}
          >
            فريق ١
          </button>
          <button
            onClick={onAssignTeam2}
            className="flex-1 py-3 rounded-xl font-black text-white font-arabic transition-all hover:brightness-110"
            style={{ backgroundColor: team2Color, boxShadow: `0 3px 12px ${team2Color}44` }}
          >
            فريق ٢
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onStartPhase2}
            className="w-full py-3 rounded-xl font-bold font-arabic transition-all hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, var(--gold-dim), var(--gold), var(--gold-2))',
              color: '#07090F',
              boxShadow: '0 3px 16px var(--gold-glow)',
            }}
          >
            ابدأ وقت الفريق الآخر
          </button>
          <button
            onClick={onResetBuzzer}
            className="w-full py-3 rounded-xl font-bold font-arabic transition-all hover:brightness-110"
            style={{ background: 'var(--elevated)', color: 'var(--cream-2)', border: '1px solid var(--border-gold)' }}
          >
            إعادة ضبط الجرس
          </button>
        </div>
      </div>
    </div>
  );
}
