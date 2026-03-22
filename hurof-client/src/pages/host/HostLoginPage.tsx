import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RtlWrapper } from '../../components/layout/RtlWrapper';
import { login } from '../../api/auth';

export function HostLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
          <div className="text-center mb-2">
            <h1 className="text-4xl font-black text-amber-400">دخول المقدم</h1>
          </div>

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:border-amber-400 focus:outline-none text-center"
            autoFocus
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'جارٍ الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </RtlWrapper>
  );
}
