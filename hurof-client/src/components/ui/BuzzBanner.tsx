import { Bell } from 'lucide-react';

interface BuzzBannerProps {
  playerName: string;
  onReset?: () => void;
  showReset?: boolean;
  timerSecondsLeft?: number;
  timerPhase?: 1 | 2 | null;
}

export function BuzzBanner({ playerName, onReset, showReset, timerSecondsLeft, timerPhase }: BuzzBannerProps) {
  const hasTimer  = timerPhase != null && (timerSecondsLeft ?? 0) > 0;
  const isLow     = (timerSecondsLeft ?? 0) <= 5;
  const timerColor = isLow ? '#f87171' : timerPhase === 1 ? '#C9A84C' : '#7DAFE8';

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="fixed inset-0 flex flex-col items-center justify-center z-50 gap-7"
      style={{
        background: 'radial-gradient(ellipse 80% 70% at 50% 35%, rgba(20,14,4,0.97) 0%, rgba(2,2,3,0.99) 100%)',
        backdropFilter: 'blur(4px)',
        overflow: 'hidden',
      }}
    >
      {/* Light rays (purely decorative, SVG-based) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              width: 2,
              height: '55%',
              background: 'linear-gradient(180deg, rgba(201,168,76,0.22) 0%, transparent 100%)',
              transformOrigin: 'top center',
              transform: `translateX(-50%) rotate(${i * 22.5}deg)`,
              animation: `light-ray-pulse ${3 + i * 0.4}s ease-in-out infinite ${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Ambient orb behind the center */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 65%)',
          filter: 'blur(40px)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle concentric rings */}
      {[260, 380].map(size => (
        <div
          key={size}
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: size, height: size,
            borderRadius: '50%',
            border: '1px solid rgba(201,168,76,0.1)',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Bell icon */}
      <div
        style={{
          animation: 'float-in-scale 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
          color: 'var(--gold)',
          filter: 'drop-shadow(0 0 16px rgba(201,168,76,0.7))',
        }}
        aria-hidden="true"
      >
        <Bell size={60} strokeWidth={1.5} />
      </div>

      {/* Player name */}
      <div style={{ textAlign: 'center', animation: 'banner-rise 0.5s 0.08s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: 'clamp(2.8rem, 9vw, 5.5rem)',
            fontWeight: 700,
            background: 'linear-gradient(160deg, var(--gold-dim) 0%, var(--gold-bright) 45%, var(--gold-2) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
            filter: 'drop-shadow(0 0 30px rgba(201,168,76,0.4))',
          }}
        >
          {playerName}
        </div>
        <div
          className="text-lg font-arabic font-bold mt-2"
          style={{
            color: 'var(--cream-2)',
            animation: 'float-in 0.4s 0.22s ease both',
            letterSpacing: '0.05em',
          }}
        >
          ضغط أول!
        </div>
      </div>

      {/* Timer */}
      {hasTimer && (
        <div
          className="flex flex-col items-center gap-1.5"
          style={{ animation: 'float-in 0.4s 0.28s ease both' }}
        >
          <span
            className="font-black font-arabic timer-num"
            style={{
              fontSize: 'clamp(4rem, 13vw, 7.5rem)',
              color: timerColor,
              lineHeight: 1,
              textShadow: `0 0 40px ${timerColor}88, 0 0 80px ${timerColor}33`,
              transition: 'color 0.3s, text-shadow 0.3s',
            }}
            aria-live="off"
          >
            {timerSecondsLeft}
          </span>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full font-arabic"
            style={{
              color: timerColor,
              background: `${timerColor}14`,
              border: `1px solid ${timerColor}28`,
              backdropFilter: 'blur(8px)',
              letterSpacing: '0.06em',
            }}
          >
            {timerPhase === 1 ? 'وقت الضغط' : 'وقت التفكير'}
          </span>
        </div>
      )}

      {/* Reset button */}
      {showReset && (
        <button
          onClick={onReset}
          className="mt-1 px-8 py-3 rounded-2xl font-bold text-lg font-arabic transition-all hover:brightness-115 active:scale-[0.97]"
          style={{
            background: 'rgba(255,255,255,0.04)',
            color: 'var(--cream)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            animation: 'float-in 0.4s 0.38s ease both',
          }}
        >
          إعادة ضبط الجرس
        </button>
      )}
    </div>
  );
}
