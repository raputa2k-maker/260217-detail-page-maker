import { NextRequest, NextResponse } from 'next/server';
import { generateSectionImage } from '@/lib/ai/image-generator';
import { getMockImage } from '@/lib/ai/mock-data';
import type { ProductInput } from '@/types/product';

/** Vercel 서버리스 함수 최대 실행 시간 (초) */
export const maxDuration = 60;

/** 이미지 유형 */
type ImageType = 'hero' | 'detail' | 'beforeAfter' | 'scenario' | 'background';

/**
 * POST /api/generate-image
 *
 * AI로 이미지를 생성합니다.
 * AI API 호출 실패 시 Mock 이미지(SVG 플레이스홀더)로 자동 폴백합니다.
 * Body: { productInput: ProductInput, imageType: ImageType, description?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productInput, imageType, description } = body as {
      productInput: ProductInput;
      imageType: ImageType;
      description?: string;
    };

    if (!productInput || !imageType) {
      return NextResponse.json(
        { error: 'productInput과 imageType이 필요합니다.' },
        { status: 400 },
      );
    }

    const validTypes: ImageType[] = [
      'hero',
      'detail',
      'beforeAfter',
      'scenario',
      'background',
    ];
    if (!validTypes.includes(imageType)) {
      return NextResponse.json(
        { error: `유효하지 않은 이미지 타입: ${imageType}` },
        { status: 400 },
      );
    }

    // AI API 호출 시도, 실패 시 Mock 이미지로 폴백
    let result;
    try {
      result = await generateSectionImage(productInput, imageType, description);
    } catch (aiError) {
      console.warn(
        `[generate-image] AI API 호출 실패, Mock 이미지로 폴백:`,
        aiError instanceof Error ? aiError.message : aiError,
      );
      result = getMockImage(imageType, productInput.productName);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[generate-image] Error:', error);
    const message =
      error instanceof Error ? error.message : '이미지 생성 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
