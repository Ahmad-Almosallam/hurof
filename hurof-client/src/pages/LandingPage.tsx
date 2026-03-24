import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RtlWrapper } from '../components/layout/RtlWrapper';

export function LandingPage() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');
  const [savedHostRoom, setSavedHostRoom] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hurof_host_room');
    if (saved) setSavedHostRoom(saved);
  }, []);

  return (
    <RtlWrapper>
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-5xl font-black text-amber-400 mb-2">حروف</h1>
            <p className="text-slate-400">لعبة الحروف العربية التفاعلية</p>
          </div>

          {savedHostRoom && (
            <div className="flex flex-col gap-2 bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4">
              <p className="text-amber-400 text-sm font-bold text-center">لديك غرفة نشطة — {savedHostRoom}</p>
              <button
                onClick={() => navigate(`/host/dashboard?roomCode=${savedHostRoom}`)}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-base transition-colors"
              >
                استأنف كمضيف
              </button>
            </div>
          )}

          <button
            onClick={() => navigate('/host')}
            className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-lg transition-colors"
          >
            أنشئ لعبة
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-900 px-3 text-slate-500 text-sm">أو</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={sessionId}
              onChange={e => setSessionId(e.target.value.replace(/\D/g, ''))}
              placeholder="أدخل رمز الجلسة"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:border-amber-400 focus:outline-none text-center"
            />
            <button
              onClick={() => sessionId.trim() && navigate(`/play/${sessionId.trim()}`)}
              disabled={!sessionId.trim()}
              className="w-full py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg transition-colors disabled:opacity-40"
            >
              انضم للعبة
            </button>
            <button
              onClick={() => sessionId.trim() && navigate(`/tv/${sessionId.trim()}`)}
              disabled={!sessionId.trim()}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-lg transition-colors disabled:opacity-40 border border-slate-600"
            >
              شاشة العرض
            </button>
            <button
              onClick={() => sessionId.trim() && navigate(`/host/dashboard?roomCode=${sessionId.trim()}`)}
              disabled={!sessionId.trim()}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-base transition-colors disabled:opacity-40 border border-slate-600"
            >
              انضم كمضيف
            </button>
          </div>
        </div>
      </div>
    </RtlWrapper>
  );
}
