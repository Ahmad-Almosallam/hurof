import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RtlWrapper } from '../components/layout/RtlWrapper';
import { InstallBanner } from '../components/ui/InstallBanner';

/** Decorative 8-pointed star ornament (khatam) */
function StarOrnament() {
  return (
    <svg viewBox="0 0 100 100" width={56} height={56} fill="none" aria-hidden="true">
      <path
        d="M50 8 L54.5 37 L80 20 L63 45 L92 50 L63 55 L80 80 L54.5 63 L50 92 L45.5 63 L20 80 L37 55 L8 50 L37 45 L20 20 L45.5 37 Z"
        stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round" opacity="0.8"
      />
      <path
        d="M50 24 L53 42 L68 32 L58 48 L76 50 L58 52 L68 68 L53 58 L50 76 L47 58 L32 68 L42 52 L24 50 L42 48 L32 32 L47 42 Z"
        stroke="#E8C56A" strokeWidth="1" strokeLinejoin="round" opacity="0.4"
      />
      <circle cx="50" cy="50" r="4" fill="#C9A84C" opacity="0.6" />
    </svg>
  );
}

/** Ambient background orb */
function AmbientOrb({ style }: { style: React.CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        borderRadius: '50%',
        pointerEvents: 'none',
        filter: 'blur(80px)',
        ...style,
      }}
    />
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const [sessionId, setSessionId]       = useState('');
  const [savedHostRoom, setSavedHostRoom] = useState<string | null>(null);
  const validCode = sessionId.trim().length >= 4;

  useEffect(() => {
    const saved = localStorage.getItem('hurof_host_room');
    if (saved) setSavedHostRoom(saved);
  }, []);

  return (
    <RtlWrapper>
      <InstallBanner />

      {/* ── Cinematic background ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <AmbientOrb style={{
          width: 600, height: 600,
          top: '-15%', left: '50%', transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
          animation: 'orb-float 8s ease-in-out infinite',
        }} />
        <AmbientOrb style={{
          width: 350, height: 350,
          top: '20%', left: '10%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
          animation: 'orb-drift 12s ease-in-out infinite',
        }} />
        <AmbientOrb style={{
          width: 280, height: 280,
          top: '40%', right: '8%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)',
          animation: 'orb-drift 16s ease-in-out infinite reverse',
        }} />
      </div>

      <div
        className="relative min-h-dvh flex items-center justify-center p-5"
        style={{ background: 'var(--void)' }}
      >
        <div
          className="w-full max-w-sm flex flex-col gap-5 relative"
          style={{ animation: 'float-in 0.6s cubic-bezier(0.16,1,0.3,1) both' }}
        >

          {/* ── Hero logo ── */}
          <div className="text-center flex flex-col items-center gap-4 pb-2">
            {/* Star ornament with glow */}
            <div style={{
              animation: 'glow-breathe 4s ease-in-out infinite',
              filter: 'drop-shadow(0 0 12px rgba(201,168,76,0.4))',
            }}>
              <StarOrnament />
            </div>

            {/* Title */}
            <h1
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: 'clamp(5rem, 22vw, 7rem)',
                fontWeight: 700,
                lineHeight: 0.9,
                background: 'linear-gradient(160deg, #8A7040 0%, #FFD060 30%, #C9A84C 52%, #E8C56A 72%, #8A7040 100%)',
                backgroundSize: '280% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gold-shimmer 7s linear infinite',
                letterSpacing: '-0.02em',
              }}
            >
              حروف
            </h1>

            <p
              className="text-sm font-arabic tracking-wider"
              style={{ color: 'var(--cream-2)', letterSpacing: '0.08em' }}
            >
              لعبة الحروف العربية التفاعلية
            </p>

            {/* Decorative rule with center diamond */}
            <div className="relative flex items-center w-36" aria-hidden="true">
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5))' }} />
              <div style={{
                width: 5, height: 5, background: 'var(--gold)',
                transform: 'rotate(45deg)', margin: '0 6px', flexShrink: 0,
              }} />
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(201,168,76,0.5))' }} />
            </div>
          </div>

          {/* ── Saved host room ── */}
          {savedHostRoom && (
            <div
              className="flex flex-col gap-2.5 rounded-2xl p-4"
              style={{
                background: 'rgba(201,168,76,0.06)',
                border: '1px solid rgba(201,168,76,0.22)',
                backdropFilter: 'blur(12px)',
                animation: 'float-in 0.5s 0.06s cubic-bezier(0.16,1,0.3,1) both',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              <p className="text-sm font-bold font-arabic text-center" style={{ color: 'var(--gold-2)' }}>
                لديك غرفة نشطة — {savedHostRoom}
              </p>
              <button
                onClick={() => navigate(`/host/dashboard?roomCode=${savedHostRoom}`)}
                className="w-full py-3 rounded-xl font-black text-base font-arabic transition-all hover:brightness-115 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-2) 100%)',
                  color: '#02020A',
                  boxShadow: '0 4px 28px rgba(201,168,76,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
              >
                استأنف كمضيف
              </button>
            </div>
          )}

          {/* ── Create game CTA ── */}
          <button
            onClick={() => navigate('/host')}
            className="w-full py-4 rounded-2xl font-black text-xl font-arabic transition-all hover:brightness-115 active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 45%, var(--gold-bright) 78%, var(--gold-2) 100%)',
              color: '#02020A',
              boxShadow: '0 6px 40px rgba(201,168,76,0.45), 0 2px 0 rgba(255,255,255,0.12) inset, 0 -2px 0 rgba(0,0,0,0.3) inset',
              animation: 'float-in 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            أنشئ لعبة
          </button>

          {/* ── Divider ── */}
          <div
            className="relative"
            style={{ animation: 'float-in 0.5s 0.16s cubic-bezier(0.16,1,0.3,1) both' }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
            </div>
            <div className="relative flex justify-center">
              <span
                className="px-3 text-xs font-arabic uppercase tracking-widest"
                style={{ background: 'var(--void)', color: 'var(--cream-2)', opacity: 0.6 }}
              >
                أو انضم
              </span>
            </div>
          </div>

          {/* ── Join section ── */}
          <div
            className="flex flex-col gap-3"
            style={{ animation: 'float-in 0.5s 0.22s cubic-bezier(0.16,1,0.3,1) both' }}
          >
            {/* Glass input */}
            <div style={{
              position: 'relative',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={sessionId}
                onChange={e => setSessionId(e.target.value.replace(/\D/g, ''))}
                placeholder="رمز الجلسة"
                className="w-full px-5 py-3.5 font-arabic text-center bg-transparent outline-none"
                style={{
                  color: 'var(--cream)',
                  fontSize: '1.15rem',
                  border: 'none',
                  letterSpacing: '0.1em',
                }}
              />
            </div>

            <button
              onClick={() => validCode && navigate(`/play/${sessionId.trim()}`)}
              disabled={!validCode}
              className="w-full py-3.5 rounded-xl font-bold text-lg font-arabic transition-all disabled:opacity-35 hover:brightness-110 active:scale-[0.97]"
              style={{
                background: validCode
                  ? 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.08))'
                  : 'rgba(255,255,255,0.03)',
                color: validCode ? 'var(--gold-2)' : 'var(--cream-2)',
                border: `1px solid ${validCode ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.06)'}`,
                backdropFilter: 'blur(8px)',
                transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              انضم للعبة
            </button>

            <button
              onClick={() => validCode && navigate(`/tv/${sessionId.trim()}`)}
              disabled={!validCode}
              className="w-full py-3 rounded-xl font-bold text-base font-arabic transition-all disabled:opacity-35 hover:brightness-110 active:scale-[0.97]"
              style={{
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--cream-2)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              شاشة العرض
            </button>

            <button
              onClick={() => validCode && navigate(`/host/dashboard?roomCode=${sessionId.trim()}`)}
              disabled={!sessionId.trim()}
              className="w-full py-2.5 rounded-xl font-bold text-sm font-arabic transition-all disabled:opacity-40 hover:opacity-80 active:scale-[0.97]"
              style={{
                background: 'transparent',
                color: 'var(--cream-2)',
                opacity: 0.7,
              }}
            >
              انضم كمضيف
            </button>
          </div>

        </div>
      </div>
    </RtlWrapper>
  );
}
