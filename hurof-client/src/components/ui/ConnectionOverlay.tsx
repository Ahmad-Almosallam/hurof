import type { ConnectionState } from '../../hooks/useGameHub';

interface Props {
  state: ConnectionState;
  onRetry?: () => void;
  onGoHome?: () => void;
}

/**
 * Full-screen overlay shown when the SignalR connection is not Connected.
 * Displays a spinner + Arabic status message.
 * When Disconnected (not just Reconnecting): shows a Retry button and a Go-Home link.
 */
export function ConnectionOverlay({ state, onRetry, onGoHome }: Props) {
  if (state === 'Connected') return null;

  const isDisconnected = state === 'Disconnected';

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 50,
        gap: 'clamp(0.75rem, 2vh, 1.5rem)',
        background: isDisconnected ? 'rgba(2,2,3,0.90)' : 'rgba(2,2,3,0.72)',
        backdropFilter: 'blur(12px)',
        transition: 'background 0.4s ease',
      }}
    >
      <style>{`@keyframes co-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Spinner */}
      <div
        aria-hidden="true"
        style={{
          width: 'clamp(36px, 4vw, 56px)',
          height: 'clamp(36px, 4vw, 56px)',
          borderRadius: '50%',
          border: '4px solid rgba(201,168,76,0.25)',
          borderTopColor: 'var(--gold)',
          animation: 'co-spin 1s linear infinite',
        }}
      />

      {/* Status message */}
      <div
        style={{
          fontSize: 'clamp(1.2rem, 4vw, 2.5rem)',
          fontWeight: 700,
          fontFamily: "'Amiri', serif",
          color: 'var(--cream)',
          textAlign: 'center',
        }}
      >
        {isDisconnected ? 'انقطع الاتصال' : 'جارٍ إعادة الاتصال...'}
      </div>

      {/* Retry button — only when fully disconnected */}
      {isDisconnected && onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: 'clamp(0.45rem, 1vh, 0.7rem) clamp(1.2rem, 3vw, 2rem)',
            borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, var(--gold-dim), var(--gold), var(--gold-2))',
            color: '#020208',
            fontWeight: 800,
            fontFamily: "'Cairo', sans-serif",
            fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(201,168,76,0.35)',
            transition: 'filter 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.15)')}
          onMouseLeave={e => (e.currentTarget.style.filter = '')}
        >
          إعادة المحاولة
        </button>
      )}

      {/* Go-home link — always visible */}
      {onGoHome && (
        <button
          onClick={onGoHome}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Cairo', sans-serif",
            fontSize: 'clamp(0.75rem, 1.2vw, 0.9rem)',
            color: 'rgba(255,255,255,0.28)',
            padding: '0.25rem 0.5rem',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
        >
          العودة للرئيسية
        </button>
      )}
    </div>
  );
}
