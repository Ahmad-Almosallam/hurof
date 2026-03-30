import type { ConnectionState } from '../../hooks/useGameHub';

interface ConnectionStatusProps {
  state: ConnectionState;
}

export function ConnectionStatus({ state }: ConnectionStatusProps) {
  const config = {
    Connected:    { color: '#4ade80', label: 'متصل',         pulse: false },
    Reconnecting: { color: '#C9A84C', label: 'إعادة اتصال', pulse: true  },
    Disconnected: { color: '#f87171', label: 'غير متصل',    pulse: false },
  }[state];

  return (
    <div className="flex items-center gap-1.5">
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: config.color,
          boxShadow: `0 0 6px ${config.color}`,
          animation: config.pulse ? 'pulse-win 1s ease-in-out infinite' : undefined,
          flexShrink: 0,
        }}
      />
      <span style={{ color: config.color, fontSize: '0.68rem', fontWeight: 600, fontFamily: "'Cairo', sans-serif" }}>
        {config.label}
      </span>
    </div>
  );
}
