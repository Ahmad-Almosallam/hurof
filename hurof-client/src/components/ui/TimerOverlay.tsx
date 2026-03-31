interface Props {
  secondsLeft: number;
  totalSeconds: number;
  phase: 1 | 2;
}

export function TimerOverlay({ secondsLeft, totalSeconds, phase }: Props) {
  const radius       = 54;
  const circumference = 2 * Math.PI * radius;
  const progress     = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const dashOffset   = circumference * (1 - progress);

  const isLow  = secondsLeft <= 5;
  const color  = isLow ? '#f87171' : phase === 1 ? '#C9A84C' : '#7DAFE8';
  const label  = phase === 1 ? 'وقت الطارئ' : 'وقت الفريق';

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none">
      <div
        className="flex flex-col items-center justify-center rounded-full"
        style={{
          width: 140,
          height: 140,
          background: 'rgba(7, 9, 15, 0.92)',
          border: `1px solid ${color}33`,
          boxShadow: `0 0 30px rgba(7,9,15,0.8), 0 0 20px ${color}22`,
          backdropFilter: 'blur(8px)',
          position: 'relative',
        }}
      >
        {/* SVG progress ring */}
        <svg
          width={140}
          height={140}
          style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
        >
          <circle cx={70} cy={70} r={radius} fill="none" stroke={`${color}18`} strokeWidth={7} />
          <circle
            cx={70} cy={70} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={7}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
          />
        </svg>

        {/* Countdown */}
        <span
          className="font-black text-5xl relative z-10 timer-num"
          style={{ color, lineHeight: 1, fontFamily: "'Cairo', sans-serif" }}
          aria-live="off"
        >
          {secondsLeft}
        </span>
      </div>

      {/* Phase label */}
      <span
        className="text-sm font-bold px-3 py-1 rounded-full font-arabic"
        style={{
          color,
          background: `${color}18`,
          border: `1px solid ${color}30`,
          backdropFilter: 'blur(4px)',
        }}
      >
        {label}
      </span>
    </div>
  );
}
