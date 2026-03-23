import { useEffect, useMemo } from 'react';
import { playWinSound } from '../../lib/buzzerSound';

interface GameOverBannerProps {
  winnerTeam: number | null;
  team1Color: string;
  team2Color: string;
  onDone?: () => void;
  onBack?: () => void;
  onNewRound?: () => void;
}

const CONFETTI_COUNT = 80;
const COLORS = ['#facc15', '#f97316', '#ec4899', '#38bdf8', '#4ade80', '#a78bfa', '#fb7185'];

function Confetti({ winnerColor }: { winnerColor: string }) {
  const pieces = useMemo(() => (
    Array.from({ length: CONFETTI_COUNT }, (_, i) => {
      const color = i % 5 === 0 ? winnerColor : COLORS[i % COLORS.length];
      const left = Math.random() * 100;
      const delay = Math.random() * 1.5;
      const duration = 2.5 + Math.random() * 2;
      const size = 6 + Math.random() * 8;
      const rotate = Math.random() * 360;
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
            height: p.size * 0.5,
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

export function GameOverBanner({ winnerTeam, team1Color, team2Color, onDone, onBack, onNewRound }: GameOverBannerProps) {
  const winnerColor = winnerTeam === 1 ? team1Color : winnerTeam === 2 ? team2Color : '#6b7280';
  const winnerLabel = winnerTeam === 1 ? 'فريق ١' : winnerTeam === 2 ? 'فريق ٢' : null;

  useEffect(() => {
    if (winnerLabel) playWinSound().catch(() => {});
  }, [winnerLabel]);

  useEffect(() => {
    if (!onDone) return;
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 gap-6">
      {winnerLabel && <Confetti winnerColor={winnerColor} />}

      <div style={{ animation: 'winner-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
        <div className="text-8xl text-center">🏆</div>
      </div>

      {winnerLabel ? (
        <>
          <div className="text-3xl text-white font-bold" style={{ animation: 'winner-pop 0.5s 0.15s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            الفائز
          </div>
          <div
            className="text-7xl font-black"
            style={{
              color: winnerColor,
              textShadow: `0 0 40px ${winnerColor}`,
              animation: 'winner-pop 0.5s 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            {winnerLabel}
          </div>
        </>
      ) : (
        <div className="text-4xl font-black text-slate-400">انتهت اللعبة</div>
      )}

      <div className="flex gap-3 mt-4" style={{ animation: 'winner-pop 0.5s 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        {onNewRound && (
          <button
            onClick={onNewRound}
            className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-lg transition-colors"
          >
            🔄 جولة جديدة
          </button>
        )}
        {onBack && (
          <button
            onClick={onBack}
            className="px-8 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg transition-colors"
          >
            العودة للرئيسية
          </button>
        )}
      </div>
    </div>
  );
}
