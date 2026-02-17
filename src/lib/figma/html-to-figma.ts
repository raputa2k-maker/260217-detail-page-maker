/**
 * HTML/CSS 기반 상세페이지를 Figma Plugin API 호환 JSON으로 변환
 *
 * 생성된 PageSection 데이터를 직접 Figma 노드 구조로 변환합니다.
 * (DOM 파싱이 아닌, 구조화된 데이터 기반 변환)
 */

import type { PageSection, SectionType } from '@/types/section';
import type {
  HookingContent,
  EmpathyContent,
  SolutionContent,
  TrustContent,
  ConversionContent,
} from '@/types/section';
import type {
  FigmaFrameNode,
  FigmaTextNode,
  FigmaImageNode,
  FigmaNode,
  FigmaExportJSON,
} from './figma-types';
import { createSolidFill, cssColorToFigma, cssToFigmaTextStyle } from './style-mapper';

const PAGE_WIDTH = 860;

/** 텍스트 노드 헬퍼 */
function textNode(
  name: string,
  text: string,
  opts: {
    fontSize?: number;
    fontWeight?: number;
    color?: string;
    align?: 'LEFT' | 'CENTER' | 'RIGHT';
    width?: number;
  } = {},
): FigmaTextNode {
  return {
    type: 'TEXT',
    name,
    characters: text,
    width: opts.width || PAGE_WIDTH,
    style: {
      fontSize: opts.fontSize || 16,
      fontFamily: 'Pretendard',
      fontWeight: opts.fontWeight || 400,
      textAlignHorizontal: opts.align || 'LEFT',
    },
    fills: opts.color ? [createSolidFill(opts.color)] : undefined,
  };
}

/** 이미지 노드 헬퍼 */
function imageNode(
  name: string,
  imageRef: string,
  width: number,
  height: number,
): FigmaImageNode {
  return {
    type: 'IMAGE',
    name,
    imageRef,
    width,
    height,
  };
}

/** 프레임 노드 헬퍼 */
function frame(
  name: string,
  children: FigmaNode[],
  opts: {
    width?: number;
    bgColor?: string;
    padding?: number;
    itemSpacing?: number;
    direction?: 'VERTICAL' | 'HORIZONTAL';
    cornerRadius?: number;
  } = {},
): FigmaFrameNode {
  return {
    type: 'FRAME',
    name,
    width: opts.width || PAGE_WIDTH,
    layoutMode: opts.direction || 'VERTICAL',
    children,
    fills: opts.bgColor ? [createSolidFill(opts.bgColor)] : undefined,
    paddingLeft: opts.padding,
    paddingRight: opts.padding,
    paddingTop: opts.padding,
    paddingBottom: opts.padding,
    itemSpacing: opts.itemSpacing || 16,
    cornerRadius: opts.cornerRadius,
    layoutSizingHorizontal: 'FIXED',
    layoutSizingVertical: 'HUG',
  };
}

// ---------------------------------------------------------------------------
// Section converters
// ---------------------------------------------------------------------------

function convertHooking(section: PageSection): FigmaFrameNode {
  const content = section.content as HookingContent;
  const heroImg = section.images[0];

  const children: FigmaNode[] = [];

  if (heroImg) {
    children.push(imageNode('히어로 이미지', heroImg.url, PAGE_WIDTH, 500));
  }

  children.push(
    textNode('메인 헤드카피', content.mainHeadcopy, {
      fontSize: 36,
      fontWeight: 800,
      color: '#FFFFFF',
      align: 'CENTER',
    }),
  );

  children.push(
    textNode('서브 카피', content.subCopy, {
      fontSize: 20,
      fontWeight: 500,
      color: '#FFFFFFDD',
      align: 'CENTER',
    }),
  );

  if (content.benefitKeywords.length > 0) {
    const badges = content.benefitKeywords.map((kw, i) =>
      frame(`키워드-${i + 1}`, [
        textNode(`키워드텍스트-${i + 1}`, kw, {
          fontSize: 14,
          fontWeight: 600,
          color: '#FFFFFF',
          align: 'CENTER',
        }),
      ], { bgColor: '#FFFFFF33', cornerRadius: 20, padding: 8 }),
    );
    children.push(
      frame('베네핏 키워드', badges, { direction: 'HORIZONTAL', itemSpacing: 12 }),
    );
  }

  return frame('섹션1-후킹', children, {
    bgColor: section.style.backgroundColor || '#1E293B',
    padding: section.style.padding || 48,
    itemSpacing: 16,
  });
}

function convertEmpathy(section: PageSection): FigmaFrameNode {
  const content = section.content as EmpathyContent;
  const children: FigmaNode[] = [];

  children.push(
    textNode('공감 질문', content.empathyQuestion, {
      fontSize: 28,
      fontWeight: 700,
      color: section.style.accentColor || '#B45309',
      align: 'CENTER',
    }),
  );

  content.painPoints.forEach((point, i) => {
    children.push(
      textNode(`고민-${i + 1}`, `😩 ${point}`, { fontSize: 18, fontWeight: 400 }),
    );
  });

  if (content.checklist.length > 0) {
    const checkItems = content.checklist.map((item, i) =>
      textNode(`체크-${i + 1}`, `✓ ${item}`, { fontSize: 16, fontWeight: 400 }),
    );
    children.push(
      frame('체크리스트', checkItems, {
        bgColor: '#FFFFFF',
        cornerRadius: 16,
        padding: 24,
        itemSpacing: 12,
      }),
    );
  }

  return frame('섹션2-공감', children, {
    bgColor: section.style.backgroundColor || '#FFF8F0',
    padding: section.style.padding || 48,
    itemSpacing: 24,
  });
}

function convertSolution(section: PageSection): FigmaFrameNode {
  const content = section.content as SolutionContent;
  const children: FigmaNode[] = [];

  children.push(
    textNode('섹션 타이틀', '이런 점이 다릅니다', {
      fontSize: 28,
      fontWeight: 700,
      color: section.style.accentColor || '#6366F1',
      align: 'CENTER',
    }),
  );

  content.featureBenefits.forEach((fab, i) => {
    const card = frame(`특징카드-${i + 1}`, [
      textNode('특징', fab.feature, { fontSize: 16, fontWeight: 600 }),
      textNode('장점', fab.advantage, { fontSize: 16, fontWeight: 400 }),
      textNode('혜택', fab.benefit, {
        fontSize: 16,
        fontWeight: 600,
        color: section.style.accentColor || '#6366F1',
      }),
    ], { bgColor: '#FFFFFF', cornerRadius: 16, padding: 20, itemSpacing: 8 });
    children.push(card);
  });

  // Before/After
  const ba = frame('Before & After', [
    frame('Before', [
      textNode('Before 텍스트', content.beforeAfter.before, {
        fontSize: 16,
        color: '#9CA3AF',
        align: 'CENTER',
      }),
    ], { bgColor: '#F3F4F6', cornerRadius: 12, padding: 20 }),
    frame('After', [
      textNode('After 텍스트', content.beforeAfter.after, {
        fontSize: 16,
        fontWeight: 600,
        color: section.style.accentColor || '#6366F1',
        align: 'CENTER',
      }),
    ], { bgColor: `${section.style.accentColor || '#6366F1'}15`, cornerRadius: 12, padding: 20 }),
  ], { direction: 'HORIZONTAL', itemSpacing: 16 });
  children.push(ba);

  // Specs
  if (content.specs.length > 0) {
    const specRows = content.specs.map((spec, i) =>
      frame(`스펙-${i + 1}`, [
        textNode('라벨', spec.label, { fontSize: 14, fontWeight: 600, color: '#6B7280' }),
        textNode('값', spec.value, { fontSize: 14, fontWeight: 400 }),
      ], { direction: 'HORIZONTAL', itemSpacing: 16, padding: 12 }),
    );
    children.push(frame('상세 스펙', specRows, { itemSpacing: 0 }));
  }

  return frame('섹션3-해결', children, {
    bgColor: section.style.backgroundColor || '#FFFFFF',
    padding: section.style.padding || 48,
    itemSpacing: 24,
  });
}

function convertTrust(section: PageSection): FigmaFrameNode {
  const content = section.content as TrustContent;
  const children: FigmaNode[] = [];

  children.push(
    textNode('섹션 타이틀', '고객이 인정한 품질', {
      fontSize: 28,
      fontWeight: 700,
      color: section.style.accentColor || '#6366F1',
      align: 'CENTER',
    }),
  );

  // Statistics
  if (content.statistics.length > 0) {
    const stats = content.statistics.map((stat, i) =>
      frame(`통계-${i + 1}`, [
        textNode('수치', stat.value, {
          fontSize: 36,
          fontWeight: 800,
          color: section.style.accentColor || '#6366F1',
          align: 'CENTER',
        }),
        textNode('라벨', stat.label, {
          fontSize: 14,
          color: '#6B7280',
          align: 'CENTER',
        }),
      ], { bgColor: '#FFFFFF', cornerRadius: 16, padding: 20 }),
    );
    children.push(
      frame('통계 영역', stats, { direction: 'HORIZONTAL', itemSpacing: 16 }),
    );
  }

  // Reviews
  content.reviews.forEach((review, i) => {
    const stars = '★'.repeat(Math.round(review.rating)) + '☆'.repeat(5 - Math.round(review.rating));
    children.push(
      frame(`리뷰-${i + 1}`, [
        textNode('별점', stars, { fontSize: 14, color: '#F59E0B' }),
        textNode('리뷰텍스트', review.text, { fontSize: 16, fontWeight: 400 }),
        textNode('리뷰어', review.reviewer, { fontSize: 14, color: '#9CA3AF' }),
      ], { bgColor: '#FFFFFF', cornerRadius: 12, padding: 20, itemSpacing: 8 }),
    );
  });

  // Badges
  if (content.badges.length > 0) {
    const badgeNodes = content.badges.map((badge, i) =>
      frame(`배지-${i + 1}`, [
        textNode('배지텍스트', `🛡️ ${badge}`, { fontSize: 14, fontWeight: 500, align: 'CENTER' }),
      ], { bgColor: '#FFFFFF', cornerRadius: 20, padding: 8 }),
    );
    children.push(
      frame('인증 배지', badgeNodes, { direction: 'HORIZONTAL', itemSpacing: 12 }),
    );
  }

  return frame('섹션4-신뢰', children, {
    bgColor: section.style.backgroundColor || '#F9FAFB',
    padding: section.style.padding || 48,
    itemSpacing: 24,
  });
}

function convertConversion(section: PageSection): FigmaFrameNode {
  const content = section.content as ConversionContent;
  const children: FigmaNode[] = [];

  children.push(
    textNode('긴급성 문구', content.urgencyText, {
      fontSize: 20,
      fontWeight: 700,
      color: '#EF4444',
      align: 'CENTER',
    }),
  );

  // CTA Button
  children.push(
    frame('CTA 버튼', [
      textNode('CTA 텍스트', content.ctaText, {
        fontSize: 20,
        fontWeight: 800,
        color: '#FFFFFF',
        align: 'CENTER',
      }),
    ], {
      bgColor: '#F59E0B',
      cornerRadius: 16,
      padding: 20,
      width: PAGE_WIDTH - 96,
    }),
  );

  children.push(
    textNode('추가 혜택', content.bonusText, {
      fontSize: 16,
      color: '#6B7280',
      align: 'CENTER',
    }),
  );

  return frame('섹션5-전환', children, {
    bgColor: section.style.backgroundColor || '#FFFBEB',
    padding: section.style.padding || 48,
    itemSpacing: 16,
  });
}

// ---------------------------------------------------------------------------
// Main export function
// ---------------------------------------------------------------------------

const SECTION_CONVERTERS: Record<SectionType, (section: PageSection) => FigmaFrameNode> = {
  hooking: convertHooking,
  empathy: convertEmpathy,
  solution: convertSolution,
  trust: convertTrust,
  conversion: convertConversion,
};

/**
 * PageSection 배열을 Figma Plugin API 호환 JSON으로 변환합니다.
 *
 * @param sections - 정렬된 PageSection 배열
 * @param pageName - Figma 페이지 이름
 * @returns FigmaExportJSON
 */
export function convertToFigmaJSON(
  sections: PageSection[],
  pageName: string = '상세페이지',
): FigmaExportJSON {
  // 이미지 URL 매핑 수집
  const imageMap: Record<string, string> = {};
  sections.forEach((section) => {
    section.images.forEach((img) => {
      imageMap[img.url] = img.url;
    });
  });

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  const sectionNodes = sorted.map((section) => {
    const converter = SECTION_CONVERTERS[section.type];
    return converter(section);
  });

  const root: FigmaFrameNode = {
    type: 'FRAME',
    name: pageName,
    width: PAGE_WIDTH,
    layoutMode: 'VERTICAL',
    layoutSizingHorizontal: 'FIXED',
    layoutSizingVertical: 'HUG',
    itemSpacing: 0,
    children: sectionNodes,
    fills: [createSolidFill('#FFFFFF')],
  };

  return {
    version: '1.0.0',
    name: pageName,
    root,
    images: imageMap,
  };
}
