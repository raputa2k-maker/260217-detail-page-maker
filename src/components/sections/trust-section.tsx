'use client';

import { useCallback } from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TrustContent, GeneratedImage, SectionStyle } from '@/types/section';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Render filled/empty stars for a rating (1-5) */
function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-amber-400" aria-label={`${rating}점`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className="text-base">
          {i < Math.round(rating) ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TrustSectionProps {
  content: TrustContent;
  images: GeneratedImage[];
  style: SectionStyle;
  isEditing?: boolean;
  onContentChange?: (field: string, value: unknown) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * 신뢰 영역 (Trust Section)
 *
 * Builds confidence with customer reviews (star ratings), statistics
 * displayed as large numbers, and certification/badge labels.
 * Represents ~10 % of the detail page.
 */
export default function TrustSection({
  content,
  images: _images,
  style,
  isEditing = false,
  onContentChange,
}: TrustSectionProps) {
  const handleBlur = useCallback(
    (field: string) => (e: React.FocusEvent<HTMLElement>) => {
      onContentChange?.(field, e.currentTarget.textContent ?? '');
    },
    [onContentChange],
  );

  const editableClass = isEditing
    ? 'cursor-text rounded outline-none ring-2 ring-current/20 focus:ring-current/40'
    : '';

  return (
    <section
      className="w-full"
      style={{
        backgroundColor: style.backgroundColor || '#F9FAFB',
        color: style.textColor || '#1F2937',
        padding: `${style.padding}px 24px`,
      }}
    >
      <div className="mx-auto max-w-[860px]">
        {/* ---------------------------------------------------------------- */}
        {/* Section title                                                    */}
        {/* ---------------------------------------------------------------- */}
        <h2
          className="mb-10 text-center text-2xl font-bold sm:text-3xl"
          style={{ color: style.accentColor || '#6366F1' }}
        >
          고객이 인정한 품질
        </h2>

        {/* ---------------------------------------------------------------- */}
        {/* Statistics – large number displays                               */}
        {/* ---------------------------------------------------------------- */}
        {content.statistics.length > 0 && (
          <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {content.statistics.map((stat, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center rounded-2xl bg-white p-5 shadow-sm"
              >
                <span
                  className={cn('text-3xl font-extrabold sm:text-4xl', editableClass)}
                  style={{ color: style.accentColor || '#6366F1' }}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onContentChange?.(
                      `statistics.${idx}.value`,
                      e.currentTarget.textContent ?? '',
                    )
                  }
                >
                  {stat.value}
                </span>
                <span
                  className={cn('mt-1 text-sm text-gray-500', editableClass)}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onContentChange?.(
                      `statistics.${idx}.label`,
                      e.currentTarget.textContent ?? '',
                    )
                  }
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Review cards                                                     */}
        {/* ---------------------------------------------------------------- */}
        {content.reviews.length > 0 && (
          <div className="mb-10 space-y-4">
            {content.reviews.map((review, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <StarRating rating={review.rating} />
                  <span
                    className={cn('text-sm font-medium text-gray-400', editableClass)}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onContentChange?.(
                        `reviews.${idx}.reviewer`,
                        e.currentTarget.textContent ?? '',
                      )
                    }
                  >
                    {review.reviewer}
                  </span>
                </div>
                <p
                  className={cn('text-base leading-relaxed text-gray-700', editableClass)}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onContentChange?.(
                      `reviews.${idx}.text`,
                      e.currentTarget.textContent ?? '',
                    )
                  }
                >
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Badges / certifications                                          */}
        {/* ---------------------------------------------------------------- */}
        {content.badges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            {content.badges.map((badge, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm"
              >
                <ShieldCheck
                  className="h-4 w-4"
                  style={{ color: style.accentColor || '#6366F1' }}
                  aria-hidden
                />
                <span
                  className={cn(editableClass)}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onContentChange?.(
                      `badges.${idx}`,
                      e.currentTarget.textContent ?? '',
                    )
                  }
                >
                  {badge}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
