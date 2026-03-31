interface Props {
  onCancel: () => void;
  onJoinAsPlayer: () => void;
  onEndGame: () => void;
  isEndingGame?: boolean;
}

export function EndGameDialog({ onCancel, onJoinAsPlayer, onEndGame, isEndingGame }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(2,2,3,0.82)', backdropFilter: 'blur(16px)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm mx-4 flex flex-col gap-4 rounded-3xl p-6"
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.025) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
          animation: 'float-in-scale 0.3s cubic-bezier(0.16,1,0.3,1) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        <p className="text-center text-lg font-bold leading-relaxed font-arabic" style={{ color: 'var(--cream)' }}>
          ماذا تريد أن تفعل؟
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onJoinAsPlayer}
            className="w-full py-3.5 rounded-2xl font-bold font-arabic transition-all hover:brightness-115 active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, var(--gold-dim), var(--gold), var(--gold-bright))',
              color: '#020208',
              boxShadow: '0 4px 28px rgba(201,168,76,0.4), inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
          >
            انضم كلاعب
          </button>
          <button
            onClick={onEndGame}
            disabled={isEndingGame}
            className="w-full py-3.5 rounded-2xl font-bold font-arabic transition-all hover:brightness-110 disabled:opacity-40 active:scale-[0.97]"
            style={{
              background: 'rgba(239,68,68,0.1)',
              color: '#f87171',
              border: '1px solid rgba(239,68,68,0.25)',
              boxShadow: '0 4px 20px rgba(239,68,68,0.12)',
            }}
          >
            {isEndingGame ? 'جارٍ الإنهاء...' : 'إنهاء اللعبة'}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-2xl font-bold font-arabic transition-all hover:opacity-70 active:scale-[0.97]"
            style={{
              background: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.4)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
