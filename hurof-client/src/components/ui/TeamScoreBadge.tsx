interface TeamScoreBadgeProps {
  label: string;
  score: number;
  color: string;
}

export function TeamScoreBadge({ label, score, color }: TeamScoreBadgeProps) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2 rounded-2xl"
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)`,
        border: `1px solid ${color}38`,
        backdropFilter: 'blur(12px)',
        boxShadow: `0 0 24px ${color}1A, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Color dot with glow */}
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}CC, 0 0 20px ${color}55`,
          flexShrink: 0,
        }}
      />
      <span
        className="text-sm font-bold font-arabic"
        style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}
      >
        {label}
      </span>
      <span
        className="text-xl font-black font-arabic timer-num"
        style={{
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
