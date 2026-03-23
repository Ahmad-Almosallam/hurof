import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:5178';

export function PhpSessionPage() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    fetch(`${API}/api/php-session`)
      .then(r => r.json())
      .then(d => setValue(d.phpSessionId ?? ''))
      .catch(() => {});
  }, []);

  async function handleSave() {
    setStatus('saving');
    try {
      const res = await fetch(`${API}/api/php-session`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phpSessionId: value }),
      });
      setStatus(res.ok ? 'saved' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6" dir="rtl">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-slate-100 transition-colors text-sm"
          >
            ← رجوع
          </button>
          <h1 className="text-xl font-bold text-slate-100">إعدادات PHPSESSID</h1>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-400">قيمة PHPSESSID</label>
          <input
            type="text"
            value={value}
            onChange={e => { setValue(e.target.value); setStatus('idle'); }}
            className="bg-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            placeholder="أدخل قيمة PHPSESSID"
            dir="ltr"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={status === 'saving'}
          className="py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm transition-colors disabled:opacity-50"
        >
          {status === 'saving' ? 'جاري الحفظ...' : 'حفظ'}
        </button>
        {status === 'saved' && <p className="text-green-400 text-sm text-center">تم الحفظ بنجاح</p>}
        {status === 'error' && <p className="text-red-400 text-sm text-center">حدث خطأ، يرجى المحاولة مجدداً</p>}
      </div>
    </div>
  );
}
