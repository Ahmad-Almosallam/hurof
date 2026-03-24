interface Props {
  secondsLeft: number;
  totalSeconds: number;
  phase: 1 | 2;
}

export function TimerOverlay({ secondsLeft, totalSeconds, phase }: Props) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const dashOffset = circumference * (1 - progress);

  const isLow = secondsLeft <= 5;
  const color = isLow ? '#ef4444' : phase === 1 ? '#f59e0b' : '#60a5fa';
  const label = phase === 1 ? 'وقت الطارئ' : 'وقت الفريق';

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none">
      <div
        className="flex flex-col items-center justify-center rounded-full shadow-2xl"
        style={{
          width: 140,
          height: 140,
          background: 'rgba(15, 23, 42, 0.9)',
          border: `3px solid ${color}33`,
        }}
      >
        {/* SVG progress ring */}
        <svg
          width={140}
          height={140}
          className="absolute"
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            cx={70}
            cy={70}
            r={radius}
            fill="none"
            stroke={`${color}22`}
            strokeWidth={8}
          />
          <circle
            cx={70}
            cy={70}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
          />
        </svg>

        {/* Countdown number */}
        <span
          className="font-black text-5xl relative z-10"
          style={{ color, lineHeight: 1 }}
        >
          {secondsLeft}
        </span>
      </div>

      {/* Phase label */}
      <span
        className="text-sm font-bold px-3 py-1 rounded-full"
        style={{ color, background: `${color}22` }}
      >
        {label}
      </span>
    </div>
  );
}
