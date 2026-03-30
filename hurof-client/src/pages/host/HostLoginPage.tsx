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
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--void)' }}>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm flex flex-col gap-4"
          style={{ animation: 'float-in 0.5s ease both' }}
        >
          <div className="text-center mb-2">
            <h1
              className="font-bold font-arabic"
              style={{ fontFamily: "'Amiri', serif", fontSize: '2.5rem', color: 'var(--gold-2)' }}
            >
              دخول المقدم
            </h1>
          </div>

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="w-full px-4 py-3 rounded-xl font-arabic text-center outline-none transition-all"
            style={{
              background: 'var(--surface)',
              color: 'var(--cream)',
              border: '1px solid rgba(201,168,76,0.22)',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.55)')}
            onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.22)')}
            autoFocus
          />

          {error && (
            <p className="text-sm text-center font-arabic" style={{ color: '#f87171' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-2xl font-black text-lg font-arabic transition-all hover:brightness-110 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, var(--gold-dim), var(--gold), var(--gold-2))',
              color: '#07090F',
              boxShadow: '0 4px 22px var(--gold-glow)',
            }}
          >
            {loading ? 'جارٍ الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </RtlWrapper>
  );
}
