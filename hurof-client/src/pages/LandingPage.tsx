import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RtlWrapper } from '../components/layout/RtlWrapper';

export function LandingPage() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');

  return (
    <RtlWrapper>
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-5xl font-black text-amber-400 mb-2">حروف</h1>
            <p className="text-slate-400">لعبة الحروف العربية التفاعلية</p>
          </div>

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
              value={sessionId}
              onChange={e => setSessionId(e.target.value)}
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
          </div>
        </div>
      </div>
    </RtlWrapper>
  );
}
