import type { LeaderboardEntry } from '../../types/api';

interface Props {
  entries: LeaderboardEntry[];
  currentPlayerName?: string;
}

const toArabicNum = (n: number) =>
  n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

/* Heat-map color for streak count */
function streakColor(n: number): string {
  if (n === 0) return 'rgba(255,255,255,0.2)';
  if (n <= 2)  return '#f97316';
  if (n <= 4)  return '#ef4444';
  return '#dc2626';
}

function streakGlow(n: number): string {
  if (n === 0) return 'none';
  if (n <= 2)  return '0 0 8px rgba(249,115,22,0.6)';
  if (n <= 4)  return '0 0 10px rgba(239,68,68,0.7)';
  return '0 0 14px rgba(220,38,38,0.9)';
}

export function GameEndLeaderboardOverlay({ entries, currentPlayerName }: Props) {
  const winner = entries.find(e => e.rank === 1);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 55,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'rgba(2,2,3,0.97)',
        backdropFilter: 'blur(24px)',
        overflowY: 'auto',
        direction: 'rtl',
        padding:
          'calc(2rem + env(safe-area-inset-top,0px)) calc(1rem + env(safe-area-inset-right,0px)) calc(2rem + env(safe-area-inset-bottom,0px)) calc(1rem + env(safe-area-inset-left,0px))',
      }}
    >
      <style>{`
        @keyframes geo-end-in {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes winner-aura {
          0%, 100% { box-shadow: 0 0 0 1px rgba(201,168,76,0.3), 0 0 30px rgba(201,168,76,0.1); }
          50%       { box-shadow: 0 0 0 1px rgba(201,168,76,0.5), 0 0 50px rgba(201,168,76,0.2); }
        }
        @keyframes own-glow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(201,168,76,0.4), 0 0 20px rgba(201,168,76,0.12); }
          50%       { box-shadow: 0 0 0 1px rgba(201,168,76,0.7), 0 0 36px rgba(201,168,76,0.22); }
        }
        @keyframes crown-float {
          0%, 100% { transform: translateY(0);    }
          50%       { transform: translateY(-4px); }
        }
        @keyframes radial-bloom {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1);   }
        }
        @keyframes streak-heat {
          0%, 100% { filter: brightness(1); }
          50%       { filter: brightness(1.35); }
        }
      `}</style>

      {/* ── Ambient radial glow behind winner ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(600px, 90vw)',
          height: 260,
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
          animation: 'radial-bloom 1s 0.3s ease both',
        }}
      />

      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.3rem',
          marginBottom: '0.75rem',
          animation: 'geo-end-in 0.6s 0.05s ease both',
        }}
      >
        {/* Crown float */}
        <div
          aria-hidden="true"
          style={{
            fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
            animation: 'crown-float 2.5s ease-in-out infinite',
            filter: 'drop-shadow(0 0 12px rgba(201,168,76,0.6))',
          }}
        >
          👑
        </div>

        <h1
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: 'clamp(2.2rem, 7vw, 4rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            margin: 0,
            background:
              'linear-gradient(135deg, #8B6914 0%, var(--gold) 35%, var(--gold-2) 60%, var(--gold) 80%, #8B6914 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
          }}
        >
          انتهت اللعبة
        </h1>

        {winner && (
          <p
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)',
              color: 'rgba(201,168,76,0.55)',
              margin: 0,
              letterSpacing: '0.04em',
            }}
          >
            الفائز:&nbsp;
            <span style={{ color: 'var(--gold-2)', fontWeight: 700 }}>
              {winner.playerName}
            </span>
          </p>
        )}
      </div>

      {/* ── Decorative divider ── */}
      <div
        style={{
          width: 'min(480px, 88vw)',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)',
          marginBottom: '1rem',
          animation: 'geo-end-in 0.5s 0.25s ease both',
        }}
        aria-hidden="true"
      />

      {/* ── Table ── */}
      <div
        style={{
          width: '100%',
          maxWidth: 580,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {/* Column headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2.2rem 1fr 3.8rem 4.4rem',
            gap: '0.5rem',
            padding: '0 0.8rem 0.3rem',
            fontSize: 'clamp(0.55rem, 1.5vw, 0.65rem)',
            color: 'rgba(201,168,76,0.4)',
            letterSpacing: '0.06em',
            animation: 'geo-end-in 0.5s 0.3s ease both',
          }}
        >
          <span style={{ textAlign: 'center' }}>#</span>
          <span>اللاعب</span>
          <span style={{ textAlign: 'center' }}>إجابات</span>
          <span style={{ textAlign: 'center' }}>أفضل سلسلة</span>
        </div>

        {/* Rows */}
        {entries.map((entry, i) => {
          const isFirst = entry.rank === 1;
          const isOwn   = !!currentPlayerName && entry.playerName === currentPlayerName;

          return (
            <EndRow
              key={entry.playerName}
              entry={entry}
              index={i}
              isFirst={isFirst}
              isOwn={isOwn}
            />
          );
        })}
      </div>
    </div>
  );
}

interface RowProps {
  entry: LeaderboardEntry;
  index: number;
  isFirst: boolean;
  isOwn: boolean;
}

function EndRow({ entry, index, isFirst, isOwn }: RowProps) {
  const isTop3 = entry.rank <= 3;
  const MEDAL  = ['🥇', '🥈', '🥉'] as const;

  const rowBg = isFirst
    ? 'linear-gradient(135deg, rgba(201,168,76,0.13) 0%, rgba(201,168,76,0.05) 100%)'
    : isOwn
    ? 'rgba(201,168,76,0.07)'
    : isTop3
    ? 'rgba(255,255,255,0.03)'
    : 'rgba(255,255,255,0.015)';

  const rowAnimation = isFirst
    ? 'winner-aura 2.5s 1s ease-in-out infinite'
    : isOwn
    ? 'own-glow 2s 0.8s ease-in-out infinite'
    : 'none';

  const entryDelay = 0.35 + index * 0.08;

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '2.2rem 1fr 3.8rem 4.4rem',
        gap: '0.5rem',
        alignItems: 'center',
        padding: isFirst
          ? 'clamp(0.65rem, 2vw, 0.9rem) 0.8rem'
          : '0.5rem 0.8rem',
        borderRadius: isFirst ? '1rem' : '0.75rem',
        background: rowBg,
        border: isFirst
          ? '1px solid rgba(201,168,76,0.25)'
          : isOwn
          ? '1px solid rgba(201,168,76,0.35)'
          : '1px solid rgba(255,255,255,0.04)',
        animation: `geo-end-in 0.5s ${entryDelay}s ease both, ${rowAnimation}`,
        overflow: 'hidden',
      }}
    >
      {/* Winner shimmer overlay */}
      {isFirst && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(105deg, transparent 30%, rgba(201,168,76,0.06) 50%, transparent 70%)',
            backgroundSize: '200% 100%',
            animation: 'rank1-shimmer 3s 1.5s linear infinite',
            pointerEvents: 'none',
            borderRadius: '1rem',
          }}
        />
      )}

      {/* Bottom accent line for winner */}
      {isFirst && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0, right: '10%', left: '10%',
            height: '1px',
            background:
              'linear-gradient(90deg, transparent, rgba(201,168,76,0.35), transparent)',
          }}
        />
      )}

      {/* ── Rank ── */}
      <div style={{ textAlign: 'center' }}>
        {isTop3 ? (
          <span
            style={{
              fontSize: isFirst
                ? 'clamp(1.4rem, 4vw, 1.8rem)'
                : 'clamp(1rem, 3vw, 1.25rem)',
              lineHeight: 1,
              filter: isFirst
                ? 'drop-shadow(0 0 8px rgba(201,168,76,0.7))'
                : 'none',
            }}
            aria-label={`المركز ${entry.rank}`}
          >
            {MEDAL[entry.rank - 1]}
          </span>
        ) : (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'rgba(255,255,255,0.2)',
            }}
          >
            {toArabicNum(entry.rank)}
          </span>
        )}
      </div>

      {/* ── Name ── */}
      <div style={{ minWidth: 0 }}>
        <span
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: isFirst
              ? 'clamp(1rem, 3vw, 1.25rem)'
              : 'clamp(0.85rem, 2.5vw, 1rem)',
            fontWeight: isFirst || isOwn ? 700 : 500,
            color: isFirst
              ? 'var(--cream)'
              : isOwn
              ? 'var(--gold-2)'
              : 'var(--cream-2)',
            textShadow: isFirst ? '0 0 20px rgba(201,168,76,0.25)' : 'none',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {entry.playerName}
        </span>
        {isOwn && (
          <span
            style={{
              fontSize: '0.62rem',
              color: 'rgba(201,168,76,0.5)',
              display: 'block',
              lineHeight: 1.2,
            }}
          >
            أنت
          </span>
        )}
      </div>

      {/* ── Correct answers ── */}
      <div style={{ textAlign: 'center' }}>
        <span
          style={{
            fontSize: isFirst
              ? 'clamp(1.2rem, 3.5vw, 1.5rem)'
              : 'clamp(0.9rem, 2.5vw, 1.1rem)',
            fontWeight: 900,
            color: isFirst
              ? 'var(--gold-2)'
              : isTop3
              ? 'rgba(255,255,255,0.65)'
              : 'rgba(255,255,255,0.35)',
            textShadow: isFirst ? '0 0 12px rgba(201,168,76,0.5)' : 'none',
            fontVariantNumeric: 'tabular-nums',
            display: 'block',
          }}
        >
          {toArabicNum(entry.correctAnswersCount)}
        </span>
      </div>

      {/* ── Longest streak ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.2rem',
        }}
      >
        {entry.longestStreak >= 1 && (
          <span
            aria-hidden="true"
            style={{
              fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
              animation:
                entry.longestStreak >= 3 ? 'streak-heat 1.4s ease-in-out infinite' : 'none',
            }}
          >
            🔥
          </span>
        )}
        <span
          style={{
            fontSize: isFirst
              ? 'clamp(1rem, 3vw, 1.25rem)'
              : 'clamp(0.8rem, 2vw, 0.95rem)',
            fontWeight: entry.longestStreak >= 1 ? 800 : 500,
            color: streakColor(entry.longestStreak),
            textShadow: streakGlow(entry.longestStreak),
            fontVariantNumeric: 'tabular-nums',
          }}
          aria-label={`أفضل سلسلة: ${entry.longestStreak}`}
        >
          {toArabicNum(entry.longestStreak)}
        </span>
      </div>
    </div>
  );
}
