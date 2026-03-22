interface BuzzBannerProps {
  playerName: string;
  onReset?: () => void;
  showReset?: boolean;
}

export function BuzzBanner({ playerName, onReset, showReset }: BuzzBannerProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 gap-6">
      <div className="text-6xl animate-bounce">🔔</div>
      <div className="text-4xl font-black text-amber-400">{playerName}</div>
      <div className="text-xl text-white">ضغط أول!</div>
      {showReset && (
        <button
          onClick={onReset}
          className="mt-4 px-8 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg transition-colors"
        >
          إعادة الطارئ
        </button>
      )}
    </div>
  );
}
