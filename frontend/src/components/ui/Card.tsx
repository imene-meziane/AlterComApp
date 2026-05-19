import React from 'react';
import { HTMLMotionProps, motion } from 'framer-motion';

import { cn } from '../../lib/cn';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  tone?: 'default' | 'soft' | 'tinted' | 'glass';
  hoverable?: boolean;
  children?: React.ReactNode;
}

const toneClasses = {
  default: 'bg-white/90 ring-1 ring-slate-200/80 shadow-soft backdrop-blur',
  soft: 'bg-white/70 ring-1 ring-white/70 shadow-soft backdrop-blur',
  tinted:
    'bg-gradient-to-br from-white via-white to-slate-50 ring-1 ring-slate-200/70 shadow-soft',
  glass:
    'bg-white/55 ring-1 ring-white/80 shadow-panel backdrop-blur-2xl'
};

export function Card({
  className,
  children,
  tone = 'default',
  hoverable = false,
  ...props
}: CardProps): React.ReactElement {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4 } : undefined}
      className={cn(
        'rounded-[28px] p-5 transition-[transform,box-shadow,background-color] duration-300',
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
