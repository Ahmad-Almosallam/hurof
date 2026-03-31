import { useEffect, useMemo } from 'react';
import { RotateCcw, Home } from 'lucide-react';

interface GameOverBannerProps {
  winnerTeam: number | null;
  team1Color: string;
  team2Color: string;
  onDone?: () => void;
  onBack?: () => void;
  onNewRound?: () => void;
}

const CONFETTI_COUNT = 110;
const CONFETTI_SHAPES = ['rect', 'circle', 'strip'] as const;

function Confetti({ winnerColor }: { winnerColor: string }) {
  const pieces = useMemo(() => (
    Array.from({ length: CONFETTI_COUNT }, (_, i) => {
      const goldPalette  = ['#C9A84C', '#E8C56A', '#FFD060', '#F0D080'];
      const accentPalette = ['#f97316', '#ec4899', '#38bdf8', '#4ade80', '#a78bfa'];
      const color    = i % 3 === 0 ? winnerColor : i % 3 === 1 ? goldPalette[i % 4] : accentPalette[i % 5];
      const left     = Math.random() * 100;
      const delay    = Math.random() * 2;
      const duration = 2.8 + Math.random() * 2.8;
      const size     = 4 + Math.random() * 10;
      const rotate   = Math.random() * 360;
      const shape    = CONFETTI_SHAPES[i % 3];
      return { color, left, delay, duration, size, rotate, shape, id: i };
    })
  ), [winnerColor]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-24px',
            width:  p.shape === 'strip'  ? p.size * 0.3 : p.size,
            height: p.shape === 'strip'  ? p.size * 2.2 : p.shape === 'circle' ? p.size : p.size * 0.4,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'strip' ? 2 : 2,
            transform: `rotate(${p.rotate}deg)`,
            opacity: 0.9,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

/** Eight-pointed star ornament */
function StarOrnament({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" width={72} height={72} fill="none" aria-hidden="true">
      <path
        d="M50 8 L54.5 37 L80 20 L63 45 L92 50 L63 55 L80 80 L54.5 63 L50 92 L45.5 63 L20 80 L37 55 L8 50 L37 45 L20 20 L45.5 37 Z"
        stroke={color} strokeWidth="1.8" strokeLinejoin="round" opacity="0.8"
        style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
      />
      <path
        d="M50 24 L53 42 L68 32 L58 48 L76 50 L58 52 L68 68 L53 58 L50 76 L47 58 L32 68 L42 52 L24 50 L42 48 L32 32 L47 42 Z"
        stroke={color} strokeWidth="1" strokeLinejoin="round" opacity="0.45"
      />
      <circle cx="50" cy="50" r="5" fill={color} opacity="0.6" />
    </svg>
  );
}

export function GameOverBanner({ winnerTeam, team1Color, team2Color, onDone, onBack, onNewRound }: GameOverBannerProps) {
  const winnerColor = winnerTeam === 1 ? team1Color : winnerTeam === 2 ? team2Color : '#6b7280';
  const winnerLabel = winnerTeam === 1 ? 'فريق ١' : winnerTeam === 2 ? 'فريق ٢' : null;

  useEffect(() => {
    if (!onDone) return;
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 gap-6 overflow-hidden"
      style={{
        background: `radial-gradient(ellipse 90% 80% at 50% 40%, rgba(${hexToRgb(winnerColor)},0.08) 0%, rgba(2,2,3,0.97) 60%)`,
        backdropFilter: 'blur(6px)',
      }}
    >
      {winnerLabel && <Confetti winnerColor={winnerColor} />}

      {/* Screen flash on entry */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle, ${winnerColor}33 0%, transparent 60%)`,
          animation: 'screen-flash 0.8s ease-out forwards',
          pointerEvents: 'none',
        }}
      />

      {/* Rotating light rays */}
      {winnerLabel && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 900, height: 900,
            borderRadius: '50%',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: [...Array(12)].map((_, i) =>
              `linear-gradient(${i * 30}deg, transparent 48%, ${winnerColor}0A 49%, ${winnerColor}0A 51%, transparent 52%)`
            ).join(', '),
            animation: 'winner-rays 20s linear infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Ambient glow behind winner name */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 500, height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${winnerColor}18 0%, transparent 65%)`,
          filter: 'blur(40px)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Concentric rings */}
      {[320, 480, 650].map((size, i) => (
        <div
          key={size}
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: size, height: size,
            borderRadius: '50%',
            border: `1px solid ${winnerColor}${i === 0 ? '28' : i === 1 ? '14' : '08'}`,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Star ornament */}
      <div style={{ animation: 'winner-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both', position: 'relative' }}>
        <StarOrnament color={winnerColor} />
      </div>

      {winnerLabel ? (
        <>
          <div
            className="text-xl font-arabic font-bold tracking-widest uppercase"
            style={{
              color: 'rgba(255,255,255,0.45)',
              animation: 'winner-pop 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both',
              letterSpacing: '0.2em',
              fontSize: '0.85rem',
            }}
          >
            الفائز
          </div>
          <div
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: 'clamp(4.5rem, 16vw, 8rem)',
              fontWeight: 700,
              color: winnerColor,
              textShadow: `0 0 60px ${winnerColor}88, 0 0 120px ${winnerColor}44, 0 0 200px ${winnerColor}22`,
              lineHeight: 1,
              animation: 'winner-pop 0.6s 0.24s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            {winnerLabel}
          </div>
        </>
      ) : (
        <div
          className="text-4xl font-black font-arabic"
          style={{ color: 'var(--cream-2)', animation: 'winner-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}
        >
          انتهت اللعبة
        </div>
      )}

      <div
        className="flex gap-3 mt-2"
        style={{ animation: 'winner-pop 0.5s 0.48s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {onNewRound && (
          <button
            onClick={onNewRound}
            className="flex items-center gap-2.5 px-8 py-3 rounded-2xl font-bold text-lg font-arabic transition-all hover:brightness-115 active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, var(--gold-dim), var(--gold), var(--gold-bright))',
              color: '#020208',
              boxShadow: '0 6px 36px rgba(201,168,76,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
          >
            <RotateCcw size={18} aria-hidden="true" />
            جولة جديدة
          </button>
        )}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-lg font-arabic transition-all hover:brightness-110 active:scale-[0.97]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--cream)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            }}
          >
            <Home size={16} aria-hidden="true" />
            الرئيسية
          </button>
        )}
      </div>
    </div>
  );
}

/** Converts #RRGGBB to "R,G,B" for use in rgba() */
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return isNaN(r) ? '201,168,76' : `${r},${g},${b}`;
}
