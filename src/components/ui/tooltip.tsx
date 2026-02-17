'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The tooltip text to display on hover. */
  content: string;
  /** Position of the tooltip relative to the trigger. */
  side?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, content, side = 'top', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('group/tooltip relative inline-flex', className)}
        {...props}
      >
        {children}
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-[#1F2937] px-2.5 py-1.5 text-xs text-white opacity-0 shadow-md transition-opacity duration-150 group-hover/tooltip:opacity-100',
            side === 'top' &&
              'bottom-full left-1/2 mb-2 -translate-x-1/2',
            side === 'bottom' &&
              'top-full left-1/2 mt-2 -translate-x-1/2',
            side === 'left' &&
              'right-full top-1/2 mr-2 -translate-y-1/2',
            side === 'right' &&
              'left-full top-1/2 ml-2 -translate-y-1/2',
          )}
        >
          {content}
        </span>
      </div>
    );
  },
);
Tooltip.displayName = 'Tooltip';

export { Tooltip };
