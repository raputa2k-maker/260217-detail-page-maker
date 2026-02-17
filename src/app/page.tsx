'use client';

import { useCallback, useEffect } from 'react';
import { Sparkles, History, Settings } from 'lucide-react';
import { usePageStore } from '@/stores/page-store';
import ProductForm from '@/components/input/product-form';
import PreviewPanel from '@/components/preview/preview-panel';
import ExportPanel from '@/components/export/export-panel';
import type { SectionType, PageSection, SectionStyle } from '@/types/section';
import type { GeneratedImage } from '@/types/section';
import type { ProductInput } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_SECTION_ORDER } from '@/types/section';

/** 섹션별 기본 스타일 */
const DEFAULT_SECTION_STYLES: Record<SectionType, SectionStyle> = {
  hooking: {
    backgroundColor: '#1E293B',
    textColor: '#FFFFFF',
    accentColor: '#6366F1',
    padding: 48,
  },
  empathy: {
    backgroundColor: '#FFF8F0',
    textColor: '#1F2937',
    accentColor: '#B45309',
    padding: 48,
  },
  solution: {
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    accentColor: '#6366F1',
    padding: 48,
  },
  trust: {
    backgroundColor: '#F9FAFB',
    textColor: '#1F2937',
    accentColor: '#6366F1',
    padding: 48,
  },
  conversion: {
    backgroundColor: '#FFFBEB',
    textColor: '#1F2937',
    accentColor: '#F59E0B',
    padding: 48,
  },
};

/** 섹션별 이미지 타입 매핑 */
const SECTION_IMAGE_TYPES: Record<SectionType, string[]> = {
  hooking: ['hero'],
  empathy: ['scenario'],
  solution: ['detail', 'beforeAfter'],
  trust: [],
  conversion: [],
};

export default function Home() {
  const input = usePageStore((s) => s.input);
  const setGeneratedPage = usePageStore((s) => s.setGeneratedPage);
  const setGenerationStep = usePageStore((s) => s.setGenerationStep);
  const setGenerationError = usePageStore((s) => s.setGenerationError);
  const generatedPage = usePageStore((s) => s.generatedPage);
  const loadHistory = usePageStore((s) => s.loadHistory);
  const saveToHistory = usePageStore((s) => s.saveToHistory);

  // 히스토리 로드
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  /**
   * AI 컨텐츠 생성 핸들러
   *
   * 1. 텍스트 생성 (5개 섹션 병렬)
   * 2. 이미지 생성 (관련 섹션 병렬)
   * 3. 레이아웃 구성
   */
  const handleGenerate = useCallback(async () => {
    const startTime = Date.now();

    try {
      // Step 1: 카피 생성
      setGenerationStep('generating-copy');
      setGenerationError(null);

      const textResults = await Promise.allSettled(
        DEFAULT_SECTION_ORDER.map(async (sectionType) => {
          const res = await fetch('/api/generate-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sectionType, productInput: input }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || `${sectionType} 텍스트 생성 실패`);
          }
          const data = await res.json();
          return { sectionType, content: data.content };
        }),
      );

      // 결과 정리 - 실패한 섹션은 기본 콘텐츠로 대체
      const sectionContents: Record<string, unknown> = {};
      textResults.forEach((result, index) => {
        const sectionType = DEFAULT_SECTION_ORDER[index];
        if (result.status === 'fulfilled') {
          sectionContents[sectionType] = result.value.content;
        } else {
          console.warn(`[${sectionType}] 텍스트 생성 실패:`, result.reason);
          sectionContents[sectionType] = getDefaultContent(sectionType, input);
        }
      });

      // Step 2: 이미지 생성
      setGenerationStep('generating-images');

      const imageRequests: Array<{
        sectionType: SectionType;
        imageType: string;
      }> = [];
      DEFAULT_SECTION_ORDER.forEach((sectionType) => {
        SECTION_IMAGE_TYPES[sectionType].forEach((imageType) => {
          imageRequests.push({ sectionType, imageType });
        });
      });

      const imageResults = await Promise.allSettled(
        imageRequests.map(async ({ imageType }) => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 55000);
          try {
            const res = await fetch('/api/generate-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productInput: input, imageType }),
              signal: controller.signal,
            });
            if (!res.ok) {
              console.warn(`[image] ${imageType} 요청 실패: ${res.status}`);
              return { url: '', alt: imageType };
            }
            return await res.json();
          } catch (fetchError) {
            console.warn(`[image] ${imageType} fetch 에러:`, fetchError);
            return { url: '', alt: imageType };
          } finally {
            clearTimeout(timeout);
          }
        }),
      );

      // 이미지를 섹션별로 매핑
      const sectionImages: Record<string, GeneratedImage[]> = {};
      DEFAULT_SECTION_ORDER.forEach((st) => {
        sectionImages[st] = [];
      });

      let imgIdx = 0;
      imageRequests.forEach(({ sectionType }) => {
        const result = imageResults[imgIdx];
        if (result?.status === 'fulfilled' && result.value.url) {
          sectionImages[sectionType].push({
            id: uuidv4(),
            url: result.value.url,
            alt: result.value.alt || '',
            width: 860,
            height: 500,
          });
        }
        imgIdx++;
      });

      // Step 3: 레이아웃 구성
      setGenerationStep('composing-layout');

      const sections: PageSection[] = DEFAULT_SECTION_ORDER.map(
        (sectionType, index) => ({
          id: uuidv4(),
          type: sectionType,
          order: index,
          content: sectionContents[sectionType] as PageSection['content'],
          images: sectionImages[sectionType] || [],
          style: DEFAULT_SECTION_STYLES[sectionType],
          isEdited: false,
        }),
      );

      const generationTime = Date.now() - startTime;

      setGeneratedPage({
        id: uuidv4(),
        input: { ...input },
        sections,
        metadata: {
          createdAt: new Date().toISOString(),
          generationTime,
          aiModel: 'gemini-3-pro',
        },
      });

      setGenerationStep('complete');

      // 히스토리에 자동 저장
      setTimeout(() => {
        saveToHistory();
      }, 500);
    } catch (error) {
      console.error('[Generation] Error:', error);
      setGenerationError(
        error instanceof Error ? error.message : '생성 중 오류가 발생했습니다.',
      );
      setGenerationStep('error');
    }
  }, [input, setGeneratedPage, setGenerationStep, setGenerationError, saveToHistory]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* ================================================================== */}
      {/* Navigation Bar                                                      */}
      {/* ================================================================== */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">
            AI 상세페이지 메이커
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
            title="히스토리"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">히스토리</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
            title="설정"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ================================================================== */}
      {/* Main Content – Split Layout                                         */}
      {/* ================================================================== */}
      <div className="flex min-h-0 flex-1">
        {/* Left Panel – Input Form + Export (40%) */}
        <aside className="flex w-[40%] min-w-[360px] max-w-[520px] flex-col border-r border-gray-200 bg-white">
          <div className="flex-1 overflow-y-auto p-5">
            <ProductForm onGenerate={handleGenerate} />

            {/* 내보내기 패널 - 생성 완료 시에만 표시 */}
            {generatedPage && (
              <div className="mt-6 animate-fade-in border-t border-gray-200 pt-6">
                <ExportPanel />
              </div>
            )}
          </div>
        </aside>

        {/* Right Panel – Preview (60%) */}
        <main className="flex-1 overflow-hidden bg-gray-50">
          <div data-preview-content className="h-full">
            <PreviewPanel />
          </div>
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default content fallbacks (API 실패 시 기본 콘텐츠)
// ---------------------------------------------------------------------------

function getDefaultContent(sectionType: SectionType, input: ProductInput) {
  switch (sectionType) {
    case 'hooking':
      return {
        mainHeadcopy: `${input.productName}의 새로운 시작`,
        subCopy: '지금 바로 경험해보세요',
        benefitKeywords: ['프리미엄', '혁신', '신뢰'],
      };
    case 'empathy':
      return {
        painPoints: [
          '이런 고민을 해보신 적 있나요?',
          '매번 같은 문제로 고민하셨나요?',
          '더 나은 선택이 필요하다고 느끼셨나요?',
        ],
        empathyQuestion: '혹시 이런 경험 있으신가요?',
        checklist: [
          '매번 비슷한 제품에 실망한 경험',
          '기대했던 효과를 보지 못한 경험',
          '더 좋은 대안을 찾고 있던 경험',
        ],
      };
    case 'solution':
      return {
        featureBenefits: [
          {
            feature: '핵심 기능',
            advantage: '차별화된 장점',
            benefit: '일상의 변화를 경험하세요',
          },
        ],
        beforeAfter: {
          before: '사용 전의 불편함',
          after: `${input.productName}으로 달라진 일상`,
        },
        specs: [{ label: '주요 특징', value: input.features.slice(0, 50) || '프리미엄 품질' }],
      };
    case 'trust':
      return {
        reviews: [
          { rating: 5, text: '정말 만족합니다! 추천해요.', reviewer: '김**' },
          { rating: 5, text: '기대 이상이었어요.', reviewer: '이**' },
        ],
        statistics: [
          { label: '고객 만족도', value: '97.3%' },
          { label: '재구매율', value: '89%' },
        ],
        badges: ['품질 인증', '고객 만족 1위'],
      };
    case 'conversion':
      return {
        ctaText: input.pricing
          ? `지금 ${Math.round(((input.pricing.originalPrice - input.pricing.salePrice) / input.pricing.originalPrice) * 100)}% 할인가로 구매하기`
          : '지금 바로 구매하기',
        urgencyText: '오늘만 특별 할인!',
        bonusText: '무료 배송 + 30일 무조건 환불 보장',
      };
    default:
      return {};
  }
}
