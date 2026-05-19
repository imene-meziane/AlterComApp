import React from 'react';

import { cn } from '../../lib/cn';

export function Skeleton({
  className
}: {
  className?: string;
}): React.ReactElement {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-3xl bg-[linear-gradient(110deg,#f2ede5,45%,#fff,55%,#f2ede5)] bg-[length:200%_100%]',
        className
      )}
    />
  );
}
