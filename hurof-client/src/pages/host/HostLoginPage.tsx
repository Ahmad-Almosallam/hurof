import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RtlWrapper } from '../../components/layout/RtlWrapper';
import { login } from '../../api/auth';

export function HostLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await login(password);
      sessionStorage.setItem('hurof_token', token);
      navigate('/host/dashboard', { replace: true });
    } catch {
      setError('كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RtlWrapper>
      {/* Ambient orb */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'orb-float 8s ease-in-out infinite',
        }} />
      </div>

      <div className="relative min-h-dvh flex items-center justify-center p-4" style={{ background: 'var(--void)' }}>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xs flex flex-col gap-4"
          style={{ animation: 'float-in-scale 0.5s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          <div className="text-center mb-3">
            <h1
              className="font-bold font-arabic"
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: '2.8rem',
                background: 'linear-gradient(135deg, var(--gold-dim), var(--gold-2))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              دخول المقدم
            </h1>
          </div>

          {/* Glass input */}
          <div style={{
            borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${error ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.08)'}`,
            backdropFilter: 'blur(12px)',
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04)${error ? ', 0 0 0 2px rgba(248,113,113,0.1)' : ''}`,
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              className="w-full px-5 py-3.5 bg-transparent font-arabic text-center outline-none"
              style={{
                color: 'var(--cream)',
                fontSize: '1.1rem',
                border: 'none',
                letterSpacing: '0.15em',
              }}
              autoFocus
            />
          </div>

          {error && (
            <p
              className="text-sm text-center font-arabic"
              style={{ color: '#f87171', animation: 'float-in 0.3s ease both' }}
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3.5 rounded-2xl font-black text-lg font-arabic transition-all hover:brightness-115 disabled:opacity-40 active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, var(--gold-dim), var(--gold), var(--gold-bright))',
              color: '#020208',
              boxShadow: '0 6px 36px rgba(201,168,76,0.4), inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
          >
            {loading ? 'جارٍ الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </RtlWrapper>
  );
}
