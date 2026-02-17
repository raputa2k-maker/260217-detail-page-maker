'use client';

import { useMemo } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePageStore } from '@/stores/page-store';
import type { DeviceType } from '@/types/generated';
import type { PageSection } from '@/types/section';
import DeviceFrame from './device-frame';
import SectionRenderer from './section-renderer';
import { Skeleton } from '@/components/ui/skeleton';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/** 디바이스 전환 버튼 아이콘 매핑 */
const DEVICE_ICONS: Record<DeviceType, React.ElementType> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

const DEVICE_LABELS: Record<DeviceType, string> = {
  mobile: '모바일',
  tablet: '태블릿',
  desktop: '데스크톱',
};

/** 드래그 가능한 섹션 래퍼 */
function SortableSection({
  section,
  onEdit,
  onRegenerate,
  pricing,
}: {
  section: PageSection;
  onEdit?: (sectionId: string, field: string, value: unknown) => void;
  onRegenerate?: (sectionId: string) => void;
  pricing?: { originalPrice: number; salePrice: number };
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as const,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SectionRenderer
        section={section}
        onEdit={onEdit}
        onRegenerate={onRegenerate}
        pricing={pricing}
      />
    </div>
  );
}

/**
 * 미리보기 패널
 *
 * 디바이스 프레임 내에서 생성된 상세페이지를 렌더링합니다.
 * 디바이스 전환, 줌 컨트롤, 섹션 드래그앤드롭 순서 변경을 지원합니다.
 */
export default function PreviewPanel() {
  const generatedPage = usePageStore((s) => s.generatedPage);
  const generationStep = usePageStore((s) => s.generationStep);
  const deviceType = usePageStore((s) => s.deviceType);
  const zoomLevel = usePageStore((s) => s.zoomLevel);
  const input = usePageStore((s) => s.input);
  const setDeviceType = usePageStore((s) => s.setDeviceType);
  const setZoomLevel = usePageStore((s) => s.setZoomLevel);
  const updateSection = usePageStore((s) => s.updateSection);
  const reorderSections = usePageStore((s) => s.reorderSections);

  const sections = useMemo(
    () =>
      generatedPage?.sections
        ? [...generatedPage.sections].sort((a, b) => a.order - b.order)
        : [],
    [generatedPage?.sections],
  );

  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // -- handlers ---------------------------------------------------------------

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sectionIds.indexOf(active.id as string);
    const newIndex = sectionIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...sectionIds];
    reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, active.id as string);
    reorderSections(reordered);
  };

  const handleEdit = (sectionId: string, field: string, value: unknown) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;
    // deep-set on the content object by dot path
    const updated = JSON.parse(JSON.stringify(section.content));
    const keys = field.split('.');
    let obj = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    updateSection(sectionId, updated);
  };

  const handleRegenerate = (sectionId: string) => {
    // This would trigger a re-generation call for the specific section
    // For now, we log and can integrate with the generation engine later
    console.log('Regenerate section:', sectionId);
  };

  const handleZoomIn = () => setZoomLevel(Math.min(zoomLevel + 10, 150));
  const handleZoomOut = () => setZoomLevel(Math.max(zoomLevel - 10, 50));
  const handleZoomReset = () => setZoomLevel(100);

  // -- loading skeleton -------------------------------------------------------

  const isGenerating =
    generationStep === 'generating-copy' ||
    generationStep === 'generating-images' ||
    generationStep === 'composing-layout';

  if (!generatedPage && !isGenerating) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-gray-400">
        <Monitor className="mb-4 h-16 w-16 opacity-30" />
        <p className="text-lg font-medium">미리보기</p>
        <p className="mt-1 text-sm">
          상품 정보를 입력하고 &quot;AI 컨텐츠 생성&quot; 버튼을 클릭하면
          <br />
          이곳에 상세페이지가 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* -------------------------------------------------------------------- */}
      {/* Top bar – device & zoom controls                                      */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        {/* Device switcher */}
        <div className="flex gap-1">
          {(Object.keys(DEVICE_ICONS) as DeviceType[]).map((d) => {
            const Icon = DEVICE_ICONS[d];
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDeviceType(d)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  deviceType === d
                    ? 'bg-[#6366F1] text-white'
                    : 'text-gray-500 hover:bg-gray-100',
                )}
                title={DEVICE_LABELS[d]}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{DEVICE_LABELS[d]}</span>
              </button>
            );
          })}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
            title="축소"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomReset}
            className="min-w-[48px] rounded-md px-2 py-1 text-center text-xs font-medium text-gray-600 hover:bg-gray-100"
            title="줌 초기화"
          >
            {zoomLevel}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
            title="확대"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomReset}
            className="ml-1 rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
            title="초기화"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Preview content area                                                  */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex-1 overflow-auto bg-gray-100/50 p-2">
        {isGenerating && !generatedPage ? (
          /* Loading skeleton */
          <div className="mx-auto max-w-md space-y-4 py-12">
            <Skeleton className="mx-auto h-64 w-full rounded-xl" />
            <Skeleton className="mx-auto h-8 w-3/4 rounded" />
            <Skeleton className="mx-auto h-4 w-1/2 rounded" />
            <div className="flex justify-center gap-3 pt-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="mx-auto mt-6 h-40 w-full rounded-xl" />
            <Skeleton className="mx-auto h-40 w-full rounded-xl" />
          </div>
        ) : (
          <DeviceFrame device={deviceType} zoom={zoomLevel}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sectionIds}
                strategy={verticalListSortingStrategy}
              >
                {sections.map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    onEdit={handleEdit}
                    onRegenerate={handleRegenerate}
                    pricing={input.pricing}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </DeviceFrame>
        )}
      </div>
    </div>
  );
}
