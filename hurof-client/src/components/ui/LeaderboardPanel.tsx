import type { LeaderboardEntry } from '../../types/api';

interface Props {
  entries: LeaderboardEntry[];
}

/* ── Rank palette ── */
const RANK = [
  { color: '#C9A84C', glow: 'rgba(201,168,76,0.5)',  label: '١' },
  { color: '#A8A8B3', glow: 'rgba(168,168,179,0.4)', label: '٢' },
  { color: '#B87333', glow: 'rgba(184,115,51,0.4)',  label: '٣' },
] as const;

const toArabicNum = (n: number) =>
  n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

export function LeaderboardPanel({ entries }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        direction: 'rtl',
      }}
    >
      <style>{`
        @keyframes streak-pulse {
          0%, 100% { box-shadow: 0 0 6px 1px rgba(249,115,22,0.5); }
          50%       { box-shadow: 0 0 12px 3px rgba(249,115,22,0.8); }
        }
        @keyframes lb-row-in {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes rank1-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* ── Header ── */}
      <div
        style={{
          padding: '0.6rem 0.7rem 0.5rem',
          borderBottom: '1px solid rgba(201,168,76,0.15)',
          marginBottom: '0.4rem',
          position: 'relative',
        }}
      >
        {/* Top gold line */}
        <div
          style={{
            position: 'absolute',
            top: 0, right: '0.7rem', left: '0.7rem',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
          }}
        >
          <span style={{ fontSize: '0.75rem' }} aria-hidden="true">🏆</span>
          <span
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              background: 'linear-gradient(135deg, rgba(201,168,76,0.7), var(--gold-2), rgba(201,168,76,0.7))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            المتصدرون
          </span>
        </div>
      </div>

      {/* ── Rows ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3rem',
          padding: '0 0.35rem',
          overflowY: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {entries.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '1.5rem 0',
            }}
          >
            <div style={{ fontSize: '1.4rem', opacity: 0.25 }} aria-hidden="true">🏅</div>
            <span
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.18)',
                textAlign: 'center',
              }}
            >
              لا يوجد لاعبون بعد
            </span>
          </div>
        ) : (
          entries.map((entry, i) => (
            <PanelRow key={entry.playerName} entry={entry} index={i} />
          ))
        )}
      </div>
    </div>
  );
}

function PanelRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const isFirst  = entry.rank === 1;
  const rankMeta = entry.rank <= 3 ? RANK[entry.rank - 1] : null;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: isFirst ? '0.45rem 0.55rem 0.45rem 0.45rem' : '0.3rem 0.5rem 0.3rem 0.4rem',
        borderRadius: '0.55rem',
        background: isFirst
          ? 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.04))'
          : entry.rank === 2
          ? 'rgba(168,168,179,0.05)'
          : entry.rank === 3
          ? 'rgba(184,115,51,0.05)'
          : 'rgba(255,255,255,0.02)',
        border: isFirst
          ? '1px solid rgba(201,168,76,0.2)'
          : '1px solid rgba(255,255,255,0.04)',
        boxShadow: isFirst ? '0 2px 12px rgba(201,168,76,0.08)' : 'none',
        transition: 'all 0.45s cubic-bezier(0.16,1,0.3,1)',
        animation: `lb-row-in 0.4s ${index * 0.06}s both`,
        overflow: 'hidden',
      }}
    >
      {/* Rank-1 shimmer bar */}
      {isFirst && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '0.55rem',
            background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.06) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'rank1-shimmer 3s linear infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Left accent bar */}
      {rankMeta && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 0, top: '20%', bottom: '20%',
            width: '2px',
            borderRadius: '2px',
            background: rankMeta.color,
            boxShadow: `0 0 6px ${rankMeta.glow}`,
          }}
        />
      )}

      {/* Rank badge */}
      <div
        style={{
          flexShrink: 0,
          width: isFirst ? '1.5rem' : '1.2rem',
          height: isFirst ? '1.5rem' : '1.2rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: rankMeta
            ? `radial-gradient(circle, ${rankMeta.color}22 0%, transparent 70%)`
            : 'transparent',
          border: rankMeta
            ? `1px solid ${rankMeta.color}55`
            : '1px solid rgba(255,255,255,0.08)',
          fontSize: isFirst ? '0.65rem' : '0.55rem',
          fontWeight: 900,
          color: rankMeta ? rankMeta.color : 'rgba(255,255,255,0.25)',
          transition: 'all 0.3s ease',
        }}
      >
        {toArabicNum(entry.rank)}
      </div>

      {/* Player name */}
      <span
        style={{
          flex: 1,
          fontFamily: "'Amiri', serif",
          fontSize: isFirst ? '0.9rem' : '0.78rem',
          fontWeight: isFirst ? 700 : 500,
          color: isFirst ? 'var(--cream)' : 'var(--cream-2)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
          textShadow: isFirst ? '0 0 12px rgba(201,168,76,0.2)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {entry.playerName}
      </span>

      {/* Active streak badge */}
      {entry.activeStreak >= 1 && (
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.1rem',
            padding: '0.1rem 0.28rem',
            borderRadius: '0.3rem',
            background: 'rgba(249,115,22,0.15)',
            border: '1px solid rgba(249,115,22,0.4)',
            fontSize: '0.6rem',
            fontWeight: 800,
            color: '#fb923c',
            animation: 'streak-pulse 1.8s ease-in-out infinite',
          }}
          title={`سلسلة ${entry.activeStreak}`}
          aria-label={`سلسلة ${entry.activeStreak}`}
        >
          <span aria-hidden="true" style={{ fontSize: '0.65rem' }}>🔥</span>
          <span>{toArabicNum(entry.activeStreak)}</span>
        </div>
      )}

      {/* Score */}
      <div
        style={{
          flexShrink: 0,
          minWidth: '1.4rem',
          textAlign: 'center',
          fontSize: isFirst ? '1rem' : '0.8rem',
          fontWeight: 900,
          color: rankMeta ? rankMeta.color : 'rgba(255,255,255,0.35)',
          textShadow: isFirst ? `0 0 10px ${RANK[0].glow}` : 'none',
          fontVariantNumeric: 'tabular-nums',
          transition: 'all 0.3s ease',
        }}
      >
        {toArabicNum(entry.correctAnswersCount)}
      </div>
    </div>
  );
}
