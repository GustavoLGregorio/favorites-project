import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95 cursor-pointer',
  {
    variants: {
      variant: {
        magenta:
          'bg-[#FB3DB5] text-white hover:bg-[#E0269B] glow-magenta-subtle hover:glow-magenta border border-[#FB3DB5]/30',
        silver:
          'bg-[#121622] text-[#CBD5E1] hover:text-white hover:bg-[#1A2130] border border-[#263044] hover:border-[#CBD5E1]/30',
        ghost:
          'bg-transparent text-[#94A3B8] hover:text-[#FB3DB5] hover:bg-[#FB3DB5]/10',
        outline:
          'bg-transparent text-white border border-[#263044] hover:border-[#FB3DB5] hover:text-[#FB3DB5]',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-full gap-1.5',
        md: 'h-10 px-4 text-sm rounded-xl gap-2',
        lg: 'h-12 px-6 text-base rounded-2xl gap-2.5',
        icon: 'h-9 w-9 p-0 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'silver',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
