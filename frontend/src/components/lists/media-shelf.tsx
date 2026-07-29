'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface MediaShelfProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  count?: number;
  icon?: React.ReactNode;
  actionText?: string;
  onActionClick?: () => void;
}

export function MediaShelf({
  title,
  count,
  icon,
  actionText = 'View All',
  onActionClick,
  className,
  children,
  ...props
}: MediaShelfProps) {
  return (
    <section
      className={cn(
        'w-full bg-[#121622] border border-[#263044] rounded-3xl p-5 sm:p-7 shadow-xl shadow-[#0B0E14]/40 transition-all duration-300',
        className
      )}
      {...props}
    >
      {/* Shelf Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex items-center justify-center h-9 w-9 rounded-2xl bg-[#FB3DB5]/10 text-[#FB3DB5] border border-[#FB3DB5]/20">
              {icon}
            </div>
          )}
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">{title}</h2>
            {count !== undefined && (
              <span className="text-xs font-semibold text-[#94A3B8] bg-[#1A2130] px-2 py-0.5 rounded-full border border-[#263044]">
                {count}
              </span>
            )}
          </div>
        </div>

        {actionText && (
          <button
            onClick={onActionClick}
            className="group flex items-center gap-1 text-xs font-semibold text-[#94A3B8] hover:text-[#FB3DB5] transition-colors cursor-pointer"
          >
            <span>{actionText}</span>
            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Shelf Grid Content */}
      {children}
    </section>
  );
}

// Sub-component: Grid Container
MediaShelf.Grid = function MediaShelfGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5',
        className
      )}
    >
      {children}
    </div>
  );
};
