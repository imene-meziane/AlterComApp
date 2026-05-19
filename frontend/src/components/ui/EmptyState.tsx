import React from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

import { Card } from './Card';

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}): React.ReactElement {
  return (
    <Card className="flex flex-col items-center gap-4 px-8 py-10 text-center" tone="soft">
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-sky text-brand"
      >
        <Inbox className="h-8 w-8" />
      </motion.div>
      <div className="space-y-2">
        <h3 className="text-xl font-extrabold text-ink">{title}</h3>
        <p className="max-w-lg text-base leading-7 text-muted">{description}</p>
      </div>
      {action}
    </Card>
  );
}
