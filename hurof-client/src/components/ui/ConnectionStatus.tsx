import type { ConnectionState } from '../../hooks/useGameHub';

interface ConnectionStatusProps {
  state: ConnectionState;
}

export function ConnectionStatus({ state }: ConnectionStatusProps) {
  const config = {
    Connected:    { color: '#4ade80', label: 'متصل',         dot: false },
    Reconnecting: { color: '#f59e0b', label: 'إعادة اتصال', dot: true  },
    Disconnected: { color: '#f87171', label: 'غير متصل',    dot: false },
  }[state];

  return (
    <div className="flex items-center gap-1.5">
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: config.color,
          animation: config.dot ? 'pulse-win 1s ease-in-out infinite' : undefined,
          flexShrink: 0,
        }}
      />
      <span style={{ color: config.color, fontSize: '0.7rem', fontWeight: 600 }}>
        {config.label}
      </span>
    </div>
  );
}
