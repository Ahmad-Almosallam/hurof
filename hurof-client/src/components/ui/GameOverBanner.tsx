import { useEffect, useMemo } from 'react';

interface GameOverBannerProps {
  winnerTeam: number | null;
  team1Color: string;
  team2Color: string;
  onDone?: () => void;
  onBack?: () => void;
  onNewRound?: () => void;
}

const CONFETTI_COUNT = 90;
const CONFETTI_COLORS = ['#C9A84C', '#E8C56A', '#F0D080', '#facc15', '#f97316', '#ec4899', '#38bdf8', '#4ade80'];

function Confetti({ winnerColor }: { winnerColor: string }) {
  const pieces = useMemo(() => (
    Array.from({ length: CONFETTI_COUNT }, (_, i) => {
      const color    = i % 4 === 0 ? winnerColor : CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      const left     = Math.random() * 100;
      const delay    = Math.random() * 1.8;
      const duration = 2.5 + Math.random() * 2.5;
      const size     = 5 + Math.random() * 9;
      const rotate   = Math.random() * 360;
      return { color, left, delay, duration, size, rotate, id: i };
    })
  ), [winnerColor]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-20px',
            width: p.size,
            height: p.size * 0.45,
            backgroundColor: p.color,
            borderRadius: 2,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

/** Eight-pointed star ornament (khatam / star of Ishtar) */
function StarOrnament({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" width={80} height={80} fill="none">
      <path
        d="M50 8 L54.5 37 L80 20 L63 45 L92 50 L63 55 L80 80 L54.5 63 L50 92 L45.5 63 L20 80 L37 55 L8 50 L37 45 L20 20 L45.5 37 Z"
        stroke={color} strokeWidth="2" strokeLinejoin="round" opacity="0.7"
      />
      <path
        d="M50 24 L53 42 L68 32 L58 48 L76 50 L58 52 L68 68 L53 58 L50 76 L47 58 L32 68 L42 52 L24 50 L42 48 L32 32 L47 42 Z"
        stroke={color} strokeWidth="1.2" strokeLinejoin="round" opacity="0.4"
      />
      <circle cx="50" cy="50" r="6" fill={color} opacity="0.5" />
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
      className="fixed inset-0 flex flex-col items-center justify-center z-50 gap-6"
      style={{ background: 'rgba(7,9,15,0.95)', backdropFilter: 'blur(4px)' }}
    >
      {winnerLabel && <Confetti winnerColor={winnerColor} />}

      {/* Decorative rings */}
      <div style={{
        position: 'absolute',
        width: 380, height: 380,
        borderRadius: '50%',
        border: `1px solid ${winnerColor}22`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: 580, height: 580,
        borderRadius: '50%',
        border: `1px solid ${winnerColor}10`,
        pointerEvents: 'none',
      }} />

      {/* Star ornament */}
      <div style={{ animation: 'winner-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <StarOrnament color={winnerColor} />
      </div>

      {winnerLabel ? (
        <>
          <div
            className="text-2xl font-arabic font-bold"
            style={{ color: 'var(--cream-2)', animation: 'winner-pop 0.5s 0.12s cubic-bezier(0.34,1.56,0.64,1) both' }}
          >
            الفائز
          </div>
          <div
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: 'clamp(4rem, 14vw, 7rem)',
              fontWeight: 700,
              color: winnerColor,
              textShadow: `0 0 40px ${winnerColor}88, 0 0 80px ${winnerColor}44`,
              lineHeight: 1,
              animation: 'winner-pop 0.55s 0.28s cubic-bezier(0.34,1.56,0.64,1) both',
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
        style={{ animation: 'winner-pop 0.5s 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {onNewRound && (
          <button
            onClick={onNewRound}
            className="px-8 py-3 rounded-2xl font-bold text-lg font-arabic transition-all hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, var(--gold-dim), var(--gold), var(--gold-2))',
              color: '#07090F',
              boxShadow: '0 4px 20px var(--gold-glow)',
            }}
          >
            🔄 جولة جديدة
          </button>
        )}
        {onBack && (
          <button
            onClick={onBack}
            className="px-8 py-3 rounded-2xl font-bold text-lg font-arabic transition-all hover:brightness-110"
            style={{
              background: 'var(--elevated)',
              color: 'var(--cream)',
              border: '1px solid var(--border-gold)',
            }}
          >
            العودة للرئيسية
          </button>
        )}
      </div>
    </div>
  );
}
