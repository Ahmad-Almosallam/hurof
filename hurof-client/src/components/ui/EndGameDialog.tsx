interface Props {
  onCancel: () => void;
  onJoinAsPlayer: () => void;
  onEndGame: () => void;
  isEndingGame?: boolean;
}

export function EndGameDialog({ onCancel, onJoinAsPlayer, onEndGame, isEndingGame }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4 shadow-2xl">
        <p className="text-white text-center text-lg font-bold leading-relaxed">
          ماذا تريد أن تفعل؟
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onJoinAsPlayer}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold transition-colors"
          >
            انضم كلاعب
          </button>
          <button
            onClick={onEndGame}
            disabled={isEndingGame}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors disabled:opacity-50"
          >
            {isEndingGame ? 'جارٍ الإنهاء...' : 'إنهاء اللعبة'}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
