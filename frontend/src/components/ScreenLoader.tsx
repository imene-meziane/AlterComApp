import React from 'react';
import { motion } from 'framer-motion';
import { HandHeart, MessageSquareMore, Sparkles } from 'lucide-react';

import { Card } from './ui/Card';

export function ScreenLoader({
  message
}: {
  message: string;
}): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-lg overflow-hidden p-0" tone="soft">
        <div className="relative grid gap-8 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,244,239,0.92))] p-8">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-brand/10" />
          <div className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-mint/12" />

          <div className="relative flex items-center gap-3 text-brand">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-black uppercase tracking-[0.22em]">
              AlterCom
            </span>
          </div>

          <div className="relative flex items-center justify-center gap-4">
            {[MessageSquareMore, HandHeart, Sparkles].map((Icon, index) => (
              <motion.div
                animate={{ y: [0, -8, 0] }}
                className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-white text-brand shadow-soft"
                key={index}
                transition={{ duration: 1.6, delay: index * 0.14, repeat: Infinity }}
              >
                <Icon className="h-7 w-7" />
              </motion.div>
            ))}
          </div>

          <div className="relative space-y-3 text-center">
            <h2 className="text-2xl font-black text-ink">Patiente un instant</h2>
            <p className="text-base leading-7 text-muted">{message}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
