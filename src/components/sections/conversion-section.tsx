'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { ConversionContent, GeneratedImage, SectionStyle } from '@/types/section';

interface ConversionSectionProps {
  content: ConversionContent;
  images: GeneratedImage[];
  style: SectionStyle;
  isEditing?: boolean;
  onContentChange?: (field: string, value: unknown) => void;
  /** 가격 정보 (선택) */
  pricing?: { originalPrice: number; salePrice: number };
}

/**
 * 전환 영역 (Conversion Section)
 *
 * Action-driving section with CTA button, urgency text, bonus offer,
 * and optional pricing display. Represents ~10 % of the detail page.
 */
export default function ConversionSection({
  content,
  images: _images,
  style,
  isEditing = false,
  onContentChange,
  pricing,
}: ConversionSectionProps) {
  const handleBlur = useCallback(
    (field: string) => (e: React.FocusEvent<HTMLElement>) => {
      onContentChange?.(field, e.currentTarget.textContent ?? '');
    },
    [onContentChange],
  );

  const editableClass = isEditing
    ? 'cursor-text rounded outline-none ring-2 ring-current/20 focus:ring-current/40'
    : '';

  const discountPercent =
    pricing && pricing.originalPrice > 0
      ? Math.round(
          ((pricing.originalPrice - pricing.salePrice) / pricing.originalPrice) * 100,
        )
      : null;

  return (
    <section
      className="w-full"
      style={{
        backgroundColor: style.backgroundColor || '#FFFBEB',
        color: style.textColor || '#1F2937',
        padding: `${style.padding}px 24px`,
      }}
    >
      <div className="mx-auto flex max-w-[860px] flex-col items-center text-center">
        {/* ---------------------------------------------------------------- */}
        {/* Urgency text                                                     */}
        {/* ---------------------------------------------------------------- */}
        <p
          className={cn(
            'mb-4 text-lg font-bold text-red-500 sm:text-xl',
            editableClass,
          )}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleBlur('urgencyText')}
        >
          {content.urgencyText}
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* Pricing display (optional)                                       */}
        {/* ---------------------------------------------------------------- */}
        {pricing && (
          <div className="mb-6 flex items-end gap-3">
            {discountPercent !== null && discountPercent > 0 && (
              <span className="text-2xl font-extrabold text-red-500">
                {discountPercent}%
              </span>
            )}
            {pricing.originalPrice > 0 && (
              <span className="text-lg text-gray-400 line-through">
                {pricing.originalPrice.toLocaleString()}원
              </span>
            )}
            <span
              className="text-3xl font-extrabold sm:text-4xl"
              style={{ color: style.accentColor || '#1F2937' }}
            >
              {pricing.salePrice.toLocaleString()}원
            </span>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* CTA Button                                                       */}
        {/* ---------------------------------------------------------------- */}
        <button
          type="button"
          className={cn(
            'w-full max-w-md rounded-2xl px-8 py-5 text-xl font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]',
            'focus:outline-none focus:ring-4 focus:ring-amber-300',
          )}
          style={{ backgroundColor: '#F59E0B' }}
        >
          <span
            className={cn(editableClass, 'text-white')}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleBlur('ctaText')}
          >
            {content.ctaText}
          </span>
        </button>

        {/* ---------------------------------------------------------------- */}
        {/* Bonus / additional benefits                                      */}
        {/* ---------------------------------------------------------------- */}
        <p
          className={cn(
            'mt-6 text-base leading-relaxed text-gray-600',
            editableClass,
          )}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleBlur('bonusText')}
        >
          {content.bonusText}
        </p>
      </div>
    </section>
  );
}
