'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { EmpathyContent, GeneratedImage, SectionStyle } from '@/types/section';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EmpathySectionProps {
  content: EmpathyContent;
  images: GeneratedImage[];
  style: SectionStyle;
  isEditing?: boolean;
  onContentChange?: (field: string, value: unknown) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * 공감 영역 (Empathy Section)
 *
 * Connects with the customer through pain points, an empathy question,
 * and a relatable checklist. Uses warm background tones and scenario
 * imagery. Represents ~30 % of the detail page.
 */
export default function EmpathySection({
  content,
  images,
  style,
  isEditing = false,
  onContentChange,
}: EmpathySectionProps) {
  const scenarioImage = images[0] ?? null;

  const handleBlur = useCallback(
    (field: string) => (e: React.FocusEvent<HTMLElement>) => {
      onContentChange?.(field, e.currentTarget.textContent ?? '');
    },
    [onContentChange],
  );

  return (
    <section
      className="w-full"
      style={{
        backgroundColor: style.backgroundColor || '#FFF8F0',
        color: style.textColor || '#1F2937',
        padding: `${style.padding}px 24px`,
      }}
    >
      <div className="mx-auto max-w-[860px]">
        {/* ---------------------------------------------------------------- */}
        {/* Empathy question – section title                                 */}
        {/* ---------------------------------------------------------------- */}
        <h2
          className={cn(
            'text-center text-2xl font-bold leading-snug sm:text-3xl',
            isEditing && 'cursor-text rounded outline-none ring-2 ring-current/20 focus:ring-current/40',
          )}
          style={{ color: style.accentColor || '#B45309' }}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleBlur('empathyQuestion')}
        >
          {content.empathyQuestion}
        </h2>

        {/* ---------------------------------------------------------------- */}
        {/* Scenario image (optional)                                        */}
        {/* ---------------------------------------------------------------- */}
        {scenarioImage && (
          <div className="mt-8 overflow-hidden rounded-xl">
            <img
              src={scenarioImage.url}
              alt={scenarioImage.alt}
              className="h-auto w-full object-cover"
              draggable={false}
            />
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Pain points                                                      */}
        {/* ---------------------------------------------------------------- */}
        {content.painPoints.length > 0 && (
          <ul className="mt-10 space-y-4">
            {content.painPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-xl" aria-hidden>
                  😩
                </span>
                <p
                  className={cn(
                    'text-lg leading-relaxed',
                    isEditing && 'cursor-text rounded outline-none ring-2 ring-current/20 focus:ring-current/40',
                  )}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onContentChange?.(
                      `painPoints.${idx}`,
                      e.currentTarget.textContent ?? '',
                    )
                  }
                >
                  {point}
                </p>
              </li>
            ))}
          </ul>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Checklist – "이런 경험 있으신가요?" style                          */}
        {/* ---------------------------------------------------------------- */}
        {content.checklist.length > 0 && (
          <div className="mt-10 rounded-2xl bg-white/70 p-6 shadow-sm backdrop-blur-sm">
            <h3 className="mb-4 text-lg font-semibold" style={{ color: style.accentColor || '#B45309' }}>
              이런 경험 있으신가요?
            </h3>
            <ul className="space-y-3">
              {content.checklist.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs text-white"
                    style={{ backgroundColor: style.accentColor || '#F59E0B' }}
                    aria-hidden
                  >
                    ✓
                  </span>
                  <p
                    className={cn(
                      'text-base leading-relaxed',
                      isEditing && 'cursor-text rounded outline-none ring-2 ring-current/20 focus:ring-current/40',
                    )}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onContentChange?.(
                        `checklist.${idx}`,
                        e.currentTarget.textContent ?? '',
                      )
                    }
                  >
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
