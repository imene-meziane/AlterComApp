import React from 'react';
import { HTMLMotionProps, motion } from 'framer-motion';

import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[linear-gradient(135deg,#4F8CFF,#6AA5FF)] text-white shadow-float hover:shadow-panel focus-visible:ring-brand/30',
  secondary:
    'bg-white/92 text-ink ring-1 ring-white/80 shadow-soft hover:bg-white focus-visible:ring-brand/20',
  ghost:
    'bg-white/45 text-ink ring-1 ring-white/70 backdrop-blur hover:bg-white/70 focus-visible:ring-brand/20',
  danger:
    'bg-[linear-gradient(135deg,#FF7B7B,#FF9588)] text-white shadow-soft hover:shadow-panel focus-visible:ring-danger/30'
};

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      iconLeft,
      iconRight,
      type = 'button',
      variant = 'primary',
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        className={cn(
          'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-base font-bold transition-[transform,box-shadow,background-color,opacity] duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50',
          variantClasses[variant],
          className
        )}
        ref={ref}
        type={type}
        {...props}
      >
        {iconLeft}
        <span>{children}</span>
        {iconRight}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
