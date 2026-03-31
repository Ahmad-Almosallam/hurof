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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(2,2,3,0.82)', backdropFilter: 'blur(16px)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm mx-4 flex flex-col gap-5 rounded-3xl p-6"
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.025) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05) inset',
          animation: 'float-in-scale 0.3s cubic-bezier(0.16,1,0.3,1) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        <p
          className="text-center text-lg font-bold leading-relaxed font-arabic"
          style={{ color: 'var(--cream)' }}
        >
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl font-bold font-arabic transition-all hover:brightness-115 active:scale-[0.97]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl font-bold font-arabic transition-all hover:brightness-115 active:scale-[0.97]"
            style={danger
              ? {
                  background: 'rgba(239,68,68,0.12)',
                  color: '#f87171',
                  border: '1px solid rgba(239,68,68,0.3)',
                  boxShadow: '0 4px 20px rgba(239,68,68,0.15)',
                }
              : {
                  background: 'linear-gradient(135deg, var(--gold-dim), var(--gold), var(--gold-2))',
                  color: '#020208',
                  boxShadow: '0 4px 24px rgba(201,168,76,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                }
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
