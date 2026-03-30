import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RtlWrapper } from '../components/layout/RtlWrapper';
import { InstallBanner } from '../components/ui/InstallBanner';

/** Decorative 8-pointed star ornament (khatam) */
function StarOrnament() {
  return (
    <svg viewBox="0 0 100 100" width={64} height={64} fill="none" aria-hidden="true">
      <path
        d="M50 8 L54.5 37 L80 20 L63 45 L92 50 L63 55 L80 80 L54.5 63 L50 92 L45.5 63 L20 80 L37 55 L8 50 L37 45 L20 20 L45.5 37 Z"
        stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round" opacity="0.65"
      />
      <path
        d="M50 24 L53 42 L68 32 L58 48 L76 50 L58 52 L68 68 L53 58 L50 76 L47 58 L32 68 L42 52 L24 50 L42 48 L32 32 L47 42 Z"
        stroke="#E8C56A" strokeWidth="1" strokeLinejoin="round" opacity="0.35"
      />
      <circle cx="50" cy="50" r="4" fill="#C9A84C" opacity="0.5" />
    </svg>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const [sessionId, setSessionId]       = useState('');
  const [savedHostRoom, setSavedHostRoom] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hurof_host_room');
    if (saved) setSavedHostRoom(saved);
  }, []);

  return (
    <RtlWrapper>
      <InstallBanner />
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'var(--void)' }}
      >
        <div
          className="w-full max-w-sm flex flex-col gap-6"
          style={{ animation: 'float-in 0.55s ease both' }}
        >

          {/* ── Logo ── */}
          <div className="text-center flex flex-col items-center gap-3">
            <div style={{ animation: 'glow-breathe 3s ease-in-out infinite' }}>
              <StarOrnament />
            </div>
            <h1
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: '5.5rem',
                fontWeight: 700,
                lineHeight: 1,
                background: 'linear-gradient(135deg, #8A7040 0%, #E8C56A 35%, #C9A84C 55%, #F0D070 78%, #8A7040 100%)',
                backgroundSize: '300% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gold-shimmer 6s linear infinite',
              }}
            >
              حروف
            </h1>
            <p className="text-sm font-arabic" style={{ color: 'var(--cream-2)' }}>
              لعبة الحروف العربية التفاعلية
            </p>
            {/* Decorative rule */}
            <div style={{
              width: 120,
              height: 1,
              background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
              marginTop: 4,
            }} />
          </div>

          {/* ── Saved host room ── */}
          {savedHostRoom && (
            <div
              className="flex flex-col gap-2 rounded-2xl p-4"
              style={{
                background: 'rgba(201,168,76,0.07)',
                border: '1px solid rgba(201,168,76,0.28)',
                animation: 'float-in 0.5s 0.05s ease both',
              }}
            >
              <p className="text-sm font-bold font-arabic text-center" style={{ color: 'var(--gold-2)' }}>
                لديك غرفة نشطة — {savedHostRoom}
              </p>
              <button
                onClick={() => navigate(`/host/dashboard?roomCode=${savedHostRoom}`)}
                className="w-full py-3 rounded-xl font-black text-base font-arabic transition-all hover:brightness-110 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, var(--gold-dim), var(--gold), var(--gold-2))',
                  color: '#07090F',
                  boxShadow: '0 4px 22px var(--gold-glow)',
                }}
              >
                استأنف كمضيف
              </button>
            </div>
          )}

          {/* ── Create game ── */}
          <button
            onClick={() => navigate('/host')}
            className="w-full py-4 rounded-2xl font-black text-lg font-arabic transition-all hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 45%, var(--gold-2) 100%)',
              color: '#07090F',
              boxShadow: '0 4px 28px var(--gold-glow)',
              animation: 'float-in 0.5s 0.12s ease both',
            }}
          >
            أنشئ لعبة
          </button>

          {/* ── Divider ── */}
          <div className="relative" style={{ animation: 'float-in 0.5s 0.18s ease both' }}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid rgba(201,168,76,0.18)' }} />
            </div>
            <div className="relative flex justify-center">
              <span
                className="px-3 text-sm font-arabic"
                style={{ background: 'var(--void)', color: 'var(--muted)' }}
              >
                أو
              </span>
            </div>
          </div>

          {/* ── Join section ── */}
          <div
            className="flex flex-col gap-3"
            style={{ animation: 'float-in 0.5s 0.24s ease both' }}
          >
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={sessionId}
              onChange={e => setSessionId(e.target.value.replace(/\D/g, ''))}
              placeholder="أدخل رمز الجلسة"
              className="w-full px-4 py-3 rounded-xl font-arabic text-center outline-none transition-all"
              style={{
                background: 'var(--surface)',
                color: 'var(--cream)',
                border: '1px solid rgba(201,168,76,0.2)',
                fontSize: '1.1rem',
              }}
              onFocus={e  => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.55)')}
              onBlur={e   => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)')}
            />

            <button
              onClick={() => sessionId.trim() && navigate(`/play/${sessionId.trim()}`)}
              disabled={!sessionId.trim()}
              className="w-full py-3 rounded-2xl font-bold text-lg font-arabic transition-all disabled:opacity-40 hover:brightness-110 active:scale-95"
              style={{
                background: 'var(--elevated)',
                color: 'var(--cream)',
                border: '1px solid rgba(201,168,76,0.26)',
              }}
            >
              انضم للعبة
            </button>

            <button
              onClick={() => sessionId.trim() && navigate(`/tv/${sessionId.trim()}`)}
              disabled={!sessionId.trim()}
              className="w-full py-3 rounded-2xl font-bold text-lg font-arabic transition-all disabled:opacity-40 hover:brightness-110 active:scale-95"
              style={{
                background: 'var(--surface)',
                color: 'var(--cream-2)',
                border: '1px solid rgba(201,168,76,0.14)',
              }}
            >
              شاشة العرض
            </button>

            <button
              onClick={() => sessionId.trim() && navigate(`/host/dashboard?roomCode=${sessionId.trim()}`)}
              disabled={!sessionId.trim()}
              className="w-full py-3 rounded-2xl font-bold text-base font-arabic transition-all disabled:opacity-40 hover:brightness-110"
              style={{
                background: 'transparent',
                color: 'var(--cream-2)',
                border: '1px solid rgba(201,168,76,0.08)',
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
