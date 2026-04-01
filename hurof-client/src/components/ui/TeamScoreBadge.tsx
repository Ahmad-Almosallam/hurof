interface TeamScoreBadgeProps {
  label: string;
  score: number;
  color: string;
}

export function TeamScoreBadge({ label, score, color }: TeamScoreBadgeProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(0.35rem, 0.9vw, 0.8rem)',
        padding: 'clamp(0.3rem, 0.7vh, 0.6rem) clamp(0.6rem, 1.5vw, 1.2rem)',
        borderRadius: '1rem',
        background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)`,
        border: `1px solid ${color}38`,
        backdropFilter: 'blur(12px)',
        boxShadow: `0 0 24px ${color}1A, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Color dot with glow */}
      <div
        style={{
          width: 'clamp(7px, 1vw, 12px)',
          height: 'clamp(7px, 1vw, 12px)',
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}CC, 0 0 20px ${color}55`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "'Cairo', sans-serif",
          fontSize: 'clamp(0.65rem, 1.2vw, 1rem)',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </span>
      <span
        className="timer-num"
        style={{
          fontFamily: "'Cairo', sans-serif",
          fontSize: 'clamp(1rem, 2.4vw, 2rem)',
          fontWeight: 900,
          color,
          textShadow: `0 0 16px ${color}88`,
          minWidth: '1.4ch',
          textAlign: 'center',
        }}
      >
        {score}
      </span>
    </div>
  );
}
