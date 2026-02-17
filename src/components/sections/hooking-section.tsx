'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { HookingContent, GeneratedImage, SectionStyle } from '@/types/section';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HookingSectionProps {
  content: HookingContent;
  images: GeneratedImage[];
  style: SectionStyle;
  isEditing?: boolean;
  onContentChange?: (field: string, value: unknown) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * 후킹 영역 (Hooking Section)
 *
 * Hero section that grabs attention with a full-width background image,
 * dark gradient overlay, bold main headcopy, sub copy, and benefit keyword
 * badges. Represents ~20 % of the detail page.
 */
export default function HookingSection({
  content,
  images,
  style,
  isEditing = false,
  onContentChange,
}: HookingSectionProps) {
  const heroImage = images[0] ?? null;

  // -- Editable handler helpers -------------------------------------------

  const handleBlur = useCallback(
    (field: string) => (e: React.FocusEvent<HTMLElement>) => {
      onContentChange?.(field, e.currentTarget.textContent ?? '');
    },
    [onContentChange],
  );

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ padding: `${style.padding}px 0` }}
    >
      {/* ---------------------------------------------------------------- */}
      {/* Background – hero image or gradient placeholder                   */}
      {/* ---------------------------------------------------------------- */}
      {heroImage ? (
        <img
          src={heroImage.url}
          alt={heroImage.alt}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #1e293b 0%, #334155 40%, #475569 100%)',
          }}
        />
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Dark gradient overlay                                             */}
      {/* ---------------------------------------------------------------- */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />

      {/* ---------------------------------------------------------------- */}
      {/* Content                                                           */}
      {/* ---------------------------------------------------------------- */}
      <div className="relative z-10 flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
        {/* Main headcopy */}
        <h1
          className={cn(
            'text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl',
            isEditing && 'cursor-text rounded outline-none ring-2 ring-white/30 focus:ring-white/60',
          )}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleBlur('mainHeadcopy')}
        >
          {content.mainHeadcopy}
        </h1>

        {/* Sub copy */}
        <p
          className={cn(
            'mt-4 max-w-lg text-lg leading-relaxed text-white/85',
            isEditing && 'cursor-text rounded outline-none ring-2 ring-white/30 focus:ring-white/60',
          )}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleBlur('subCopy')}
        >
          {content.subCopy}
        </p>

        {/* Benefit keyword badges */}
        {content.benefitKeywords.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {content.benefitKeywords.map((keyword, idx) => (
              <span
                key={idx}
                className={cn(
                  'rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm',
                  isEditing && 'cursor-text outline-none ring-2 ring-white/30 focus:ring-white/60',
                )}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) =>
                  onContentChange?.(
                    `benefitKeywords.${idx}`,
                    e.currentTarget.textContent ?? '',
                  )
                }
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
