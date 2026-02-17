'use client';

import { useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SolutionContent, GeneratedImage, SectionStyle } from '@/types/section';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SolutionSectionProps {
  content: SolutionContent;
  images: GeneratedImage[];
  style: SectionStyle;
  isEditing?: boolean;
  onContentChange?: (field: string, value: unknown) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * 해결 영역 (Solution Section)
 *
 * Showcases the product's value through feature-benefit cards, a
 * before/after comparison, and a specs table. Represents ~30 % of the
 * detail page.
 */
export default function SolutionSection({
  content,
  images,
  style,
  isEditing = false,
  onContentChange,
}: SolutionSectionProps) {
  const detailImage = images[0] ?? null;
  const beforeAfterImage = images[1] ?? null;

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
        backgroundColor: style.backgroundColor || '#FFFFFF',
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
          이런 점이 다릅니다
        </h2>

        {/* ---------------------------------------------------------------- */}
        {/* Detail image (optional)                                          */}
        {/* ---------------------------------------------------------------- */}
        {detailImage && (
          <div className="mb-10 overflow-hidden rounded-xl">
            <img
              src={detailImage.url}
              alt={detailImage.alt}
              className="h-auto w-full object-cover"
              draggable={false}
            />
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Feature → Advantage → Benefit cards                              */}
        {/* ---------------------------------------------------------------- */}
        {content.featureBenefits.length > 0 && (
          <div className="grid gap-5">
            {content.featureBenefits.map((fab, idx) => (
              <div
                key={idx}
                className="rounded-2xl border bg-white p-5 shadow-sm"
                style={{ borderColor: `${style.accentColor || '#6366F1'}25` }}
              >
                {/* Feature → Advantage → Benefit chain */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                  {/* Feature */}
                  <div className="flex-1">
                    <span
                      className="mb-1 block text-xs font-semibold uppercase tracking-wider opacity-50"
                    >
                      특징
                    </span>
                    <p
                      className={cn('text-base font-semibold', editableClass)}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={handleBlur(`featureBenefits.${idx}.feature`)}
                    >
                      {fab.feature}
                    </p>
                  </div>

                  <ArrowRight
                    className="hidden h-4 w-4 shrink-0 opacity-30 sm:block"
                    aria-hidden
                  />

                  {/* Advantage */}
                  <div className="flex-1">
                    <span
                      className="mb-1 block text-xs font-semibold uppercase tracking-wider opacity-50"
                    >
                      장점
                    </span>
                    <p
                      className={cn('text-base', editableClass)}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={handleBlur(`featureBenefits.${idx}.advantage`)}
                    >
                      {fab.advantage}
                    </p>
                  </div>

                  <ArrowRight
                    className="hidden h-4 w-4 shrink-0 opacity-30 sm:block"
                    aria-hidden
                  />

                  {/* Benefit */}
                  <div className="flex-1">
                    <span
                      className="mb-1 block text-xs font-semibold uppercase tracking-wider"
                      style={{ color: style.accentColor || '#6366F1' }}
                    >
                      혜택
                    </span>
                    <p
                      className={cn('text-base font-semibold', editableClass)}
                      style={{ color: style.accentColor || '#6366F1' }}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={handleBlur(`featureBenefits.${idx}.benefit`)}
                    >
                      {fab.benefit}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Before / After comparison                                        */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-12">
          <h3 className="mb-6 text-center text-xl font-bold">Before &amp; After</h3>

          {beforeAfterImage && (
            <div className="mb-6 overflow-hidden rounded-xl">
              <img
                src={beforeAfterImage.url}
                alt={beforeAfterImage.alt}
                className="h-auto w-full object-cover"
                draggable={false}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Before */}
            <div className="rounded-xl bg-gray-100 p-5 text-center">
              <span className="mb-2 block text-sm font-bold uppercase tracking-wider text-gray-400">
                Before
              </span>
              <p
                className={cn('text-base leading-relaxed text-gray-500', editableClass)}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={handleBlur('beforeAfter.before')}
              >
                {content.beforeAfter.before}
              </p>
            </div>

            {/* After */}
            <div
              className="rounded-xl p-5 text-center"
              style={{
                backgroundColor: `${style.accentColor || '#6366F1'}10`,
              }}
            >
              <span
                className="mb-2 block text-sm font-bold uppercase tracking-wider"
                style={{ color: style.accentColor || '#6366F1' }}
              >
                After
              </span>
              <p
                className={cn('text-base font-semibold leading-relaxed', editableClass)}
                style={{ color: style.accentColor || '#6366F1' }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={handleBlur('beforeAfter.after')}
              >
                {content.beforeAfter.after}
              </p>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Specs table                                                      */}
        {/* ---------------------------------------------------------------- */}
        {content.specs.length > 0 && (
          <div className="mt-12">
            <h3 className="mb-4 text-lg font-bold">상세 스펙</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <tbody>
                  {content.specs.map((spec, idx) => (
                    <tr
                      key={idx}
                      className={cn(idx % 2 === 0 ? 'bg-gray-50' : 'bg-white')}
                    >
                      <td className="w-1/3 px-4 py-3 font-semibold text-gray-600">
                        <span
                          className={cn(editableClass)}
                          contentEditable={isEditing}
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            onContentChange?.(
                              `specs.${idx}.label`,
                              e.currentTarget.textContent ?? '',
                            )
                          }
                        >
                          {spec.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(editableClass)}
                          contentEditable={isEditing}
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            onContentChange?.(
                              `specs.${idx}.value`,
                              e.currentTarget.textContent ?? '',
                            )
                          }
                        >
                          {spec.value}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
