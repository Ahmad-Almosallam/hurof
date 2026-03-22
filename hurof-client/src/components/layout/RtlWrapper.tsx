import type { ReactNode } from 'react';

export function RtlWrapper({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" lang="ar" className="font-arabic">
      {children}
    </div>
  );
}
