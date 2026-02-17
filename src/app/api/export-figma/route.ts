import { NextRequest, NextResponse } from 'next/server';
import { convertToFigmaJSON } from '@/lib/figma/html-to-figma';
import type { PageSection } from '@/types/section';

/**
 * POST /api/export-figma
 *
 * 생성된 페이지 데이터를 Figma Plugin API 호환 JSON으로 변환합니다.
 * Body: { sections: PageSection[], pageName?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sections, pageName } = body as {
      sections: PageSection[];
      pageName?: string;
    };

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json(
        { error: '변환할 섹션 데이터가 필요합니다.' },
        { status: 400 },
      );
    }

    const figmaJSON = convertToFigmaJSON(sections, pageName);

    return NextResponse.json(figmaJSON);
  } catch (error) {
    console.error('[export-figma] Error:', error);
    const message =
      error instanceof Error ? error.message : 'Figma JSON 변환 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
