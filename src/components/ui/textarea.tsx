'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** When true and maxLength is set, displays a character count below the textarea. */
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, showCount = false, maxLength, onChange, ...props }, ref) => {
    const [length, setLength] = React.useState<number>(
      typeof props.value === 'string'
        ? props.value.length
        : typeof props.defaultValue === 'string'
          ? props.defaultValue.length
          : 0,
    );

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLength(e.target.value.length);
        onChange?.(e);
      },
      [onChange],
    );

    // Keep length in sync when controlled value changes externally
    React.useEffect(() => {
      if (typeof props.value === 'string') {
        setLength(props.value.length);
      }
    }, [props.value]);

    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] shadow-sm placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          ref={ref}
          maxLength={maxLength}
          onChange={handleChange}
          {...props}
        />
        {showCount && maxLength != null && (
          <p className="mt-1 text-right text-xs text-[#6B7280]">
            {length}/{maxLength}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
