import { NextRequest, NextResponse } from 'next/server';
import { generateSectionImage } from '@/lib/ai/image-generator';
import type { ProductInput } from '@/types/product';

/** 이미지 유형 */
type ImageType = 'hero' | 'detail' | 'beforeAfter' | 'scenario' | 'background';

/**
 * POST /api/generate-image
 *
 * AI로 이미지를 생성합니다.
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

    const result = await generateSectionImage(productInput, imageType, description);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[generate-image] Error:', error);
    const message =
      error instanceof Error ? error.message : '이미지 생성 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
