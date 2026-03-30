import { useState } from 'react';

interface Props {
  onClose: () => void;
  timerBuzzer: number;
  timerThink: number;
  setTimerBuzzer: (v: number) => void;
  setTimerThink: (v: number) => void;
  players: string[];
  onKickPlayer: (name: string) => void;
  copiedTv: boolean;
  copiedPlayer: boolean;
  onCopyTv: () => void;
  onCopyPlayer: () => void;
}

const inputStyle = {
  background: 'var(--elevated)',
  color: 'var(--cream)',
  border: '1px solid var(--border-gold)',
};

export function MobileSettingsSheet({
  onClose,
  timerBuzzer, timerThink, setTimerBuzzer, setTimerThink,
  players, onKickPlayer,
  copiedTv, copiedPlayer, onCopyTv, onCopyPlayer,
}: Props) {
  const [tab, setTab] = useState<'settings' | 'players'>('settings');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ background: 'rgba(7,9,15,0.75)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm mx-4 flex flex-col gap-4 rounded-2xl p-5 shadow-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-gold)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-black text-lg font-arabic" style={{ color: 'var(--cream)' }}>الإعدادات</span>
          <button
            onClick={onClose}
            className="text-xl w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:brightness-125"
            style={{ color: 'var(--cream-2)', background: 'var(--elevated)' }}
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-gold)' }}>
          <button
            onClick={() => setTab('settings')}
            className="flex-1 py-2 text-sm font-bold font-arabic transition-all"
            style={tab === 'settings'
              ? { background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))', color: '#07090F' }
              : { background: 'var(--elevated)', color: 'var(--cream-2)' }}
          >
            الإعدادات
          </button>
          <button
            onClick={() => setTab('players')}
            className="flex-1 py-2 text-sm font-bold font-arabic transition-all"
            style={tab === 'players'
              ? { background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))', color: '#07090F' }
              : { background: 'var(--elevated)', color: 'var(--cream-2)' }}
          >
            اللاعبون {players.length > 0 && `(${players.length})`}
          </button>
        </div>

        {tab === 'settings' ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-xs text-center font-arabic" style={{ color: 'var(--cream-2)' }}>وقت الطارئ (ث)</label>
                <input
                  type="number"
                  min={0}
                  value={timerBuzzer || ''}
                  onChange={e => setTimerBuzzer(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl text-center font-arabic outline-none transition-all"
                  style={inputStyle}
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-xs text-center font-arabic" style={{ color: 'var(--cream-2)' }}>وقت الفريق (ث)</label>
                <input
                  type="number"
                  min={0}
                  value={timerThink || ''}
                  onChange={e => setTimerThink(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl text-center font-arabic outline-none transition-all"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={onCopyTv}
                className="w-full px-4 py-3 rounded-xl text-sm font-bold font-arabic transition-all hover:brightness-110 flex items-center justify-between"
                style={{ background: 'var(--elevated)', border: '1px solid var(--border-gold)' }}
              >
                <span style={{ color: 'var(--cream-2)' }}>رابط الشاشة</span>
                <span style={{ color: copiedTv ? '#4ade80' : 'var(--gold)' }}>{copiedTv ? '✓ تم النسخ' : 'نسخ'}</span>
              </button>
              <button
                onClick={onCopyPlayer}
                className="w-full px-4 py-3 rounded-xl text-sm font-bold font-arabic transition-all hover:brightness-110 flex items-center justify-between"
                style={{ background: 'var(--elevated)', border: '1px solid var(--border-gold)' }}
              >
                <span style={{ color: 'var(--cream-2)' }}>رابط اللاعبين</span>
                <span style={{ color: copiedPlayer ? '#4ade80' : 'var(--gold)' }}>{copiedPlayer ? '✓ تم النسخ' : 'نسخ'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {players.length === 0 ? (
              <div
                className="rounded-2xl p-5 text-center text-sm font-arabic"
                style={{ background: 'rgba(201,168,76,0.05)', border: '1px dashed rgba(201,168,76,0.2)', color: 'var(--cream-2)' }}
              >
                لا يوجد لاعبون متصلون
              </div>
            ) : (
              players.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                  style={{ background: 'var(--elevated)', border: '1px solid rgba(201,168,76,0.1)' }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
                  <span className="font-bold text-sm font-arabic flex-1" style={{ color: 'var(--cream)' }}>{name}</span>
                  <button
                    onClick={() => onKickPlayer(name)}
                    className="text-base leading-none transition-all flex-shrink-0 hover:brightness-125"
                    style={{ color: 'var(--muted)' }}
                    aria-label="إزالة اللاعب"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
