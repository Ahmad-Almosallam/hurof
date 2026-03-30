interface Props {
  onCancel: () => void;
  onJoinAsPlayer: () => void;
  onEndGame: () => void;
  isEndingGame?: boolean;
}

export function EndGameDialog({ onCancel, onJoinAsPlayer, onEndGame, isEndingGame }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ background: 'rgba(7,9,15,0.75)' }}
    >
      <div
        className="w-full max-w-sm mx-4 flex flex-col gap-4 rounded-2xl p-6 shadow-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-gold)', animation: 'float-in-scale 0.3s ease both' }}
      >
        <p className="text-center text-lg font-bold leading-relaxed font-arabic" style={{ color: 'var(--cream)' }}>
          ماذا تريد أن تفعل؟
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onJoinAsPlayer}
            className="w-full py-3 rounded-xl font-bold font-arabic transition-all hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, var(--gold-dim), var(--gold), var(--gold-2))',
              color: '#07090F',
              boxShadow: '0 3px 16px var(--gold-glow)',
            }}
          >
            انضم كلاعب
          </button>
          <button
            onClick={onEndGame}
            disabled={isEndingGame}
            className="w-full py-3 rounded-xl font-bold font-arabic transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            {isEndingGame ? 'جارٍ الإنهاء...' : 'إنهاء اللعبة'}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl font-bold font-arabic transition-all hover:brightness-110"
            style={{ background: 'var(--elevated)', color: 'var(--cream-2)', border: '1px solid var(--border-gold)' }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
