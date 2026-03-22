interface TeamScoreBadgeProps {
  label: string;
  score: number;
  color: string;
}

export function TeamScoreBadge({ label, score, color }: TeamScoreBadgeProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm font-bold text-white">{label}</span>
      <span className="text-lg font-black" style={{ color }}>{score}</span>
    </div>
  );
}
