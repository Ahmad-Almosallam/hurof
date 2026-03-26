import { useState } from 'react';

interface Props {
  onClose: () => void;
  timerBuzzer: number;
  timerThink: number;
  setTimerBuzzer: (v: number) => void;
  setTimerThink: (v: number) => void;
  players: string[];
  copiedTv: boolean;
  copiedPlayer: boolean;
  onCopyTv: () => void;
  onCopyPlayer: () => void;
}

export function MobileSettingsSheet({
  onClose,
  timerBuzzer, timerThink, setTimerBuzzer, setTimerThink,
  players,
  copiedTv, copiedPlayer, onCopyTv, onCopyPlayer,
}: Props) {
  const [tab, setTab] = useState<'settings' | 'players'>('settings');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 w-full max-w-sm mx-4 flex flex-col gap-4 shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-white font-black text-lg">الإعدادات</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors">
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl overflow-hidden border border-slate-700">
          <button
            onClick={() => setTab('settings')}
            className={`flex-1 py-2 text-sm font-bold transition-colors ${tab === 'settings' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
          >
            الإعدادات
          </button>
          <button
            onClick={() => setTab('players')}
            className={`flex-1 py-2 text-sm font-bold transition-colors ${tab === 'players' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
          >
            اللاعبون {players.length > 0 && `(${players.length})`}
          </button>
        </div>

        {tab === 'settings' ? (
          <div className="flex flex-col gap-4">
            {/* Timer inputs */}
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-slate-500 text-xs text-center">وقت الطارئ (ث)</label>
                <input
                  type="number"
                  min={0}
                  value={timerBuzzer || ''}
                  onChange={e => setTimerBuzzer(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-700 text-white text-center border border-slate-600 focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-slate-500 text-xs text-center">وقت الفريق (ث)</label>
                <input
                  type="number"
                  min={0}
                  value={timerThink || ''}
                  onChange={e => setTimerThink(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-700 text-white text-center border border-slate-600 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Copy links */}
            <div className="flex flex-col gap-2">
              <button
                onClick={onCopyTv}
                className="w-full px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-sm font-bold transition-colors flex items-center justify-between"
              >
                <span className="text-slate-300">رابط الشاشة</span>
                <span style={{ color: copiedTv ? '#4ade80' : '#f59e0b' }}>{copiedTv ? '✓ تم النسخ' : 'نسخ'}</span>
              </button>
              <button
                onClick={onCopyPlayer}
                className="w-full px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-sm font-bold transition-colors flex items-center justify-between"
              >
                <span className="text-slate-300">رابط اللاعبين</span>
                <span style={{ color: copiedPlayer ? '#4ade80' : '#f59e0b' }}>{copiedPlayer ? '✓ تم النسخ' : 'نسخ'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {players.length === 0 ? (
              <div className="bg-slate-700/50 rounded-2xl p-5 text-slate-500 text-center text-sm">
                لا يوجد لاعبون متصلون
              </div>
            ) : (
              players.map((name, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-700/50 rounded-xl px-4 py-2.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                  <span className="text-white font-bold text-sm">{name}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
