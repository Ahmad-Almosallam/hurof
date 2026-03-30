interface TeamScoreBadgeProps {
  label: string;
  score: number;
  color: string;
}

export function TeamScoreBadge({ label, score, color }: TeamScoreBadgeProps) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-full"
      style={{
        background: 'rgba(14, 21, 32, 0.85)',
        border: `1px solid ${color}44`,
        boxShadow: `0 0 12px ${color}22`,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
          flexShrink: 0,
        }}
      />
      <span className="text-sm font-bold font-arabic" style={{ color: 'var(--cream-2)' }}>{label}</span>
      <span className="text-lg font-black font-arabic" style={{ color }}>{score}</span>
    </div>
  );
}
