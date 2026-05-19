import React from 'react';

import { cn } from '../../lib/cn';

export function AvatarBubble({
  initials,
  className
}: {
  initials: string;
  className?: string;
}): React.ReactElement {
  return (
    <div
      className={cn(
        'flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-brand via-blue-400 to-mint text-lg font-black text-white shadow-soft',
        className
      )}
    >
      {initials}
    </div>
  );
}
