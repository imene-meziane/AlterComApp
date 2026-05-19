import React from 'react';

import { cn } from '../../lib/cn';
import { Badge } from './Badge';

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-3xl space-y-3">
        <Badge>{eyebrow}</Badge>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="text-base leading-7 text-muted sm:text-lg">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
