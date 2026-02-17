import { NextRequest, NextResponse } from 'next/server';
import { generateSectionText } from '@/lib/ai/text-generator';
import { getMockSectionContent } from '@/lib/ai/mock-data';
import type { SectionType } from '@/types/section';
import type { ProductInput } from '@/types/product';

/**
 * POST /api/generate-text
 *
 * 특정 섹션의 텍스트 콘텐츠를 AI로 생성합니다.
 * AI API 호출 실패 시 Mock 데이터로 자동 폴백합니다.
 * Body: { sectionType: SectionType, productInput: ProductInput }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectionType, productInput } = body as {
      sectionType: SectionType;
      productInput: ProductInput;
    };

    if (!sectionType || !productInput) {
      return NextResponse.json(
        { error: 'sectionType과 productInput이 필요합니다.' },
        { status: 400 },
      );
    }

    const validTypes: SectionType[] = [
      'hooking',
      'empathy',
      'solution',
      'trust',
      'conversion',
    ];
    if (!validTypes.includes(sectionType)) {
      return NextResponse.json(
        { error: `유효하지 않은 섹션 타입: ${sectionType}` },
        { status: 400 },
      );
    }

    // AI API 호출 시도, 실패 시 Mock 데이터로 폴백
    let content;
    try {
      content = await generateSectionText(sectionType, productInput);
    } catch (aiError) {
      console.warn(
        `[generate-text] AI API 호출 실패, Mock 데이터로 폴백:`,
        aiError instanceof Error ? aiError.message : aiError,
      );
      content = getMockSectionContent(sectionType, productInput);
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('[generate-text] Error:', error);
    const message =
      error instanceof Error ? error.message : '텍스트 생성 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
