'use client';

import { useState } from 'react';
import { Pencil, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageSection } from '@/types/section';
import { SECTION_LABELS } from '@/types/section';
import HookingSection from '@/components/sections/hooking-section';
import EmpathySection from '@/components/sections/empathy-section';
import SolutionSection from '@/components/sections/solution-section';
import TrustSection from '@/components/sections/trust-section';
import ConversionSection from '@/components/sections/conversion-section';
import type {
  HookingContent,
  EmpathyContent,
  SolutionContent,
  TrustContent,
  ConversionContent,
} from '@/types/section';

interface SectionRendererProps {
  section: PageSection;
  /** 인라인 편집 콜백 */
  onEdit?: (sectionId: string, field: string, value: unknown) => void;
  /** 섹션 재생성 콜백 */
  onRegenerate?: (sectionId: string) => void;
  /** 가격 정보 (전환 영역에서 표시) */
  pricing?: { originalPrice: number; salePrice: number };
}

/**
 * 각 섹션 타입에 맞는 컴포넌트를 렌더링하는 래퍼.
 * hover 시 섹션 라벨, 편집/재생성 버튼을 오버레이로 표시합니다.
 */
export default function SectionRenderer({
  section,
  onEdit,
  onRegenerate,
  pricing,
}: SectionRendererProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleContentChange = (field: string, value: unknown) => {
    onEdit?.(section.id, field, value);
  };

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const handleRegenerate = () => {
    onRegenerate?.(section.id);
  };

  const renderSection = () => {
    const commonProps = {
      images: section.images,
      style: section.style,
      isEditing,
      onContentChange: handleContentChange,
    };

    switch (section.type) {
      case 'hooking':
        return (
          <HookingSection
            content={section.content as HookingContent}
            {...commonProps}
          />
        );
      case 'empathy':
        return (
          <EmpathySection
            content={section.content as EmpathyContent}
            {...commonProps}
          />
        );
      case 'solution':
        return (
          <SolutionSection
            content={section.content as SolutionContent}
            {...commonProps}
          />
        );
      case 'trust':
        return (
          <TrustSection
            content={section.content as TrustContent}
            {...commonProps}
          />
        );
      case 'conversion':
        return (
          <ConversionSection
            content={section.content as ConversionContent}
            pricing={pricing}
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 섹션 콘텐츠 */}
      {renderSection()}

      {/* 오버레이 컨트롤 (hover 시 표시) */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-20 border-2 border-transparent transition-all duration-200',
          isHovered && !isEditing && 'border-[#6366F1]/40',
          isEditing && 'border-[#6366F1]',
        )}
      >
        {/* 섹션 라벨 */}
        <div
          className={cn(
            'absolute -top-0 left-0 rounded-br-lg px-3 py-1 text-xs font-bold text-white transition-opacity duration-200',
            isHovered || isEditing ? 'opacity-100' : 'opacity-0',
          )}
          style={{ backgroundColor: '#6366F1' }}
        >
          {SECTION_LABELS[section.type]}
          {section.isEdited && ' (수정됨)'}
        </div>

        {/* 액션 버튼 */}
        <div
          className={cn(
            'pointer-events-auto absolute top-0 right-0 flex gap-1 p-1 transition-opacity duration-200',
            isHovered || isEditing ? 'opacity-100' : 'opacity-0',
          )}
        >
          <button
            type="button"
            onClick={handleToggleEdit}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md text-white transition-colors',
              isEditing ? 'bg-[#6366F1]' : 'bg-[#6366F1]/70 hover:bg-[#6366F1]',
            )}
            title={isEditing ? '편집 완료' : '인라인 편집'}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRegenerate}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-[#6366F1]/70 text-white transition-colors hover:bg-[#6366F1]"
            title="이 섹션 재생성"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
