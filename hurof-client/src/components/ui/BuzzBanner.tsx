interface BuzzBannerProps {
  playerName: string;
  onReset?: () => void;
  showReset?: boolean;
  timerSecondsLeft?: number;
  timerPhase?: 1 | 2 | null;
}

export function BuzzBanner({ playerName, onReset, showReset, timerSecondsLeft, timerPhase }: BuzzBannerProps) {
  const hasTimer = timerPhase != null && (timerSecondsLeft ?? 0) > 0;
  const isLow    = (timerSecondsLeft ?? 0) <= 5;
  const timerColor = isLow ? '#f87171' : timerPhase === 1 ? '#C9A84C' : '#7DAFE8';

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 gap-8"
      style={{
        /* Dramatic radial spotlight */
        background: 'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(30,22,8,0.97) 0%, rgba(7,9,15,0.98) 100%)',
        backdropFilter: 'blur(2px)',
      }}
    >
      {/* Decorative gold ring behind player name */}
      <div
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          border: '1px solid rgba(201,168,76,0.15)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 480,
          height: 480,
          borderRadius: '50%',
          border: '1px solid rgba(201,168,76,0.07)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Bell icon */}
      <div
        className="text-6xl"
        style={{ animation: 'float-in-scale 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        🔔
      </div>

      {/* Player name */}
      <div style={{ textAlign: 'center', animation: 'banner-rise 0.45s 0.1s ease both' }}>
        <div
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--gold-dim) 0%, var(--gold-2) 50%, var(--gold) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
          }}
        >
          {playerName}
        </div>
        <div
          className="text-xl font-arabic font-bold mt-2"
          style={{ color: 'var(--cream-2)', animation: 'float-in 0.4s 0.25s ease both' }}
        >
          ضغط أول!
        </div>
      </div>

      {/* Timer */}
      {hasTimer && (
        <div
          className="flex flex-col items-center gap-1"
          style={{ animation: 'float-in 0.4s 0.3s ease both' }}
        >
          <span
            className="font-black font-arabic"
            style={{
              fontSize: 'clamp(4rem, 12vw, 7rem)',
              color: timerColor,
              lineHeight: 1,
              textShadow: `0 0 30px ${timerColor}66`,
              transition: 'color 0.3s, text-shadow 0.3s',
            }}
          >
            {timerSecondsLeft}
          </span>
          <span
            className="text-sm font-bold px-3 py-1 rounded-full font-arabic"
            style={{ color: timerColor, background: `${timerColor}18`, border: `1px solid ${timerColor}30` }}
          >
            {timerPhase === 1 ? 'وقت الطارئ' : 'وقت الفريق'}
          </span>
        </div>
      )}

      {/* Reset button */}
      {showReset && (
        <button
          onClick={onReset}
          className="mt-2 px-8 py-3 rounded-2xl font-bold text-lg font-arabic transition-all hover:brightness-110"
          style={{
            background: 'var(--elevated)',
            color: 'var(--cream)',
            border: '1px solid var(--border-gold)',
            animation: 'float-in 0.4s 0.4s ease both',
          }}
        >
          إعادة ضبط الجرس
        </button>
      )}
    </div>
  );
}
