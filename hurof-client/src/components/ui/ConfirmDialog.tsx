interface Props {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  onConfirm,
  onCancel,
  danger = false,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ background: 'rgba(7,9,15,0.75)' }}
    >
      <div
        className="w-full max-w-sm mx-4 flex flex-col gap-5 rounded-2xl p-6 shadow-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-gold)' }}
      >
        <p className="text-center text-lg font-bold leading-relaxed font-arabic" style={{ color: 'var(--cream)' }}>
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-bold font-arabic transition-all hover:brightness-110"
            style={{ background: 'var(--elevated)', color: 'var(--cream-2)', border: '1px solid var(--border-gold)' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-bold font-arabic transition-all hover:brightness-110"
            style={danger
              ? { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.35)' }
              : { background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))', color: '#07090F', boxShadow: '0 3px 14px var(--gold-glow)' }
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
