import { useState } from 'react';
import { usePwaInstall } from '../../hooks/usePwaInstall';

const DISMISSED_KEY = 'hurof_pwa_dismissed';

export function InstallBanner() {
  const { canInstall, showIosHint, isStandalone, install } = usePwaInstall();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISSED_KEY) === '1'
  );

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  // Already installed / running standalone — hide
  if (isStandalone || dismissed) return null;

  // Android / Chrome — native install prompt available
  if (canInstall) {
    return (
      <div className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-between gap-3 px-4 py-3 bg-amber-500 shadow-2xl">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">📲</span>
          <span className="text-slate-900 font-bold text-sm leading-tight">
            حمّل تطبيق حروف على جهازك
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={install}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-amber-400 font-black text-sm hover:bg-slate-800 transition-colors"
          >
            تحميل
          </button>
          <button
            onClick={dismiss}
            className="text-slate-900/60 hover:text-slate-900 text-xl leading-none"
            aria-label="إغلاق"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  // iOS Safari — no native prompt, show manual instructions
  if (showIosHint) {
    return (
      <div className="fixed bottom-0 inset-x-0 z-40 flex items-start justify-between gap-3 px-4 py-3 bg-slate-800 border-t border-slate-700 shadow-2xl">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0 mt-0.5">📲</span>
          <p className="text-slate-200 text-xs leading-relaxed">
            لتثبيت التطبيق: اضغط على{' '}
            <span className="font-bold text-amber-400">زر المشاركة</span>{' '}
            <span className="text-base">⬆</span> ثم اختر{' '}
            <span className="font-bold text-amber-400">«إضافة إلى الشاشة الرئيسية»</span>
          </p>
        </div>
        <button
          onClick={dismiss}
          className="text-slate-500 hover:text-slate-300 text-xl leading-none flex-shrink-0 mt-0.5"
          aria-label="إغلاق"
        >
          ×
        </button>
      </div>
    );
  }

  return null;
}
