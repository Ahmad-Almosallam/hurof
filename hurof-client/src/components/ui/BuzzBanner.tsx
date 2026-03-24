interface BuzzBannerProps {
  playerName: string;
  onReset?: () => void;
  showReset?: boolean;
  timerSecondsLeft?: number;
  timerPhase?: 1 | 2 | null;
}

export function BuzzBanner({ playerName, onReset, showReset, timerSecondsLeft, timerPhase }: BuzzBannerProps) {
  const hasTimer = timerPhase != null && (timerSecondsLeft ?? 0) > 0;
  const isLow = (timerSecondsLeft ?? 0) <= 5;
  const timerColor = isLow ? '#ef4444' : timerPhase === 1 ? '#f59e0b' : '#60a5fa';

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 gap-6">
      <div className="text-6xl animate-bounce">🔔</div>
      <div className="text-4xl font-black text-amber-400">{playerName}</div>
      <div className="text-xl text-white">ضغط أول!</div>

      {hasTimer && (
        <div className="flex flex-col items-center gap-1">
          <span
            className="font-black text-8xl"
            style={{ color: timerColor, lineHeight: 1 }}
          >
            {timerSecondsLeft}
          </span>
          <span className="text-sm font-bold" style={{ color: timerColor }}>
            {timerPhase === 1 ? 'وقت الطارئ' : 'وقت الفريق'}
          </span>
        </div>
      )}

      {showReset && (
        <button
          onClick={onReset}
          className="mt-4 px-8 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg transition-colors"
        >
          إعادة ضبط الجرس
        </button>
      )}
    </div>
  );
}
