import React from 'react';

import { cn } from '../../lib/cn';

export function Badge({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500 ring-1 ring-slate-200/80',
        className
      )}
    >
      {children}
    </span>
  );
}
