import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center font-medium tracking-wide uppercase transition-colors rounded-full',
  {
    variants: {
      variant: {
        magenta:
          'bg-[#FB3DB5]/15 text-[#FB3DB5] border border-[#FB3DB5]/30',
        silver:
          'bg-[#1A2130] text-[#CBD5E1] border border-[#263044]',
        success:
          'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        dark:
          'bg-[#0B0E14]/80 text-[#94A3B8] border border-[#263044]',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'silver',
      size: 'sm',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}
