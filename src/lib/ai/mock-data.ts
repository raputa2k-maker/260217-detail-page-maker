/**
 * AI API 연결 불가 시 사용하는 Mock 데이터
 *
 * 개발 환경이나 네트워크 제한 환경에서 전체 흐름 테스트를 위한 샘플 콘텐츠
 */

import type { ProductInput } from '@/types/product';
import type { SectionType } from '@/types/section';

/** Mock 텍스트 생성 - 상품 정보 기반으로 현실적인 카피 생성 */
export function getMockSectionContent(sectionType: SectionType, input: ProductInput) {
  const name = input.productName || '프리미엄 제품';
  const discount = input.pricing
    ? Math.round(((input.pricing.originalPrice - input.pricing.salePrice) / input.pricing.originalPrice) * 100)
    : 30;

  switch (sectionType) {
    case 'hooking':
      return {
        mainHeadcopy: `${name}, 지금 시작하세요`,
        subCopy: '당신의 일상을 한 단계 업그레이드할 특별한 경험',
        benefitKeywords: ['프리미엄 품질', '검증된 효과', '합리적 가격'],
      };

    case 'empathy':
      return {
        painPoints: [
          '매번 기대에 못 미치는 제품에 실망하셨나요?',
          '비싼 가격만큼의 효과를 느끼지 못하셨나요?',
          '나에게 딱 맞는 제품을 찾기가 어려우셨나요?',
          '주변 추천만 믿고 샀다가 후회하신 경험이 있으신가요?',
        ],
        empathyQuestion: '혹시 이런 고민, 해보신 적 있으신가요?',
        checklist: [
          '여러 제품을 써봤지만 만족스러운 게 없었다',
          '효과가 있다는 제품이 너무 비싸다',
          '내 상황에 맞는 제품인지 확신이 없다',
          '후기가 좋아서 샀는데 나한테는 안 맞았다',
        ],
      };

    case 'solution':
      return {
        featureBenefits: [
          {
            feature: '엄선된 프리미엄 원료',
            advantage: '품질 검증을 거친 최상급 소재만 사용',
            benefit: '안심하고 사용할 수 있는 확실한 품질',
          },
          {
            feature: '과학적 설계 공법',
            advantage: '연구진이 수백 번의 테스트를 거쳐 완성',
            benefit: '눈에 보이는 확실한 변화를 경험',
          },
          {
            feature: '사용자 맞춤 최적화',
            advantage: '다양한 사용 환경에 맞춤 설계',
            benefit: '누구나 쉽고 편리하게 최적의 결과 달성',
          },
        ],
        beforeAfter: {
          before: '만족스럽지 못한 기존 제품으로 시간과 비용 낭비',
          after: `${name}으로 확실한 변화와 만족스러운 결과 달성`,
        },
        specs: [
          { label: '주요 성분', value: input.features.slice(0, 40) || '프리미엄 원료' },
          { label: '사용 대상', value: input.targetAudience.ageGroups.join(', ') || '전 연령' },
          { label: '사용 방법', value: '간편한 사용법으로 누구나 쉽게' },
          { label: '제조 인증', value: 'GMP 인증 시설 제조' },
        ],
      };

    case 'trust':
      return {
        reviews: [
          {
            rating: 5,
            text: '처음 써보고 바로 재구매했어요! 확실히 다르더라고요. 주변에도 추천하고 있습니다.',
            reviewer: '김*진',
          },
          {
            rating: 5,
            text: '가성비 최고입니다. 이 가격에 이 품질이라니, 더 일찍 알았으면 좋았을 걸요.',
            reviewer: '이*수',
          },
          {
            rating: 4,
            text: '기대 이상이었어요. 꾸준히 사용하니까 확실히 달라진 게 느껴집니다.',
            reviewer: '박*영',
          },
        ],
        statistics: [
          { label: '고객 만족도', value: '97.3%' },
          { label: '재구매율', value: '89.1%' },
          { label: '누적 판매', value: '15만+' },
        ],
        badges: ['품질 인증 획득', '고객 만족 대상', '올해의 제품 선정'],
      };

    case 'conversion':
      return {
        ctaText: input.pricing
          ? `지금 ${discount}% 할인가로 구매하기`
          : `${name} 지금 바로 구매하기`,
        urgencyText: '오늘만 특별 할인! 선착순 100명 한정',
        bonusText: '무료 배송 + 30일 무조건 환불 보장 + 추가 사은품 증정',
      };

    default:
      return {};
  }
}

/** Mock 이미지 생성 - SVG 플레이스홀더 반환 */
export function getMockImage(imageType: string, productName: string) {
  const colors: Record<string, { bg: string; fg: string }> = {
    hero: { bg: '#6366F1', fg: '#FFFFFF' },
    detail: { bg: '#3B82F6', fg: '#FFFFFF' },
    beforeAfter: { bg: '#8B5CF6', fg: '#FFFFFF' },
    scenario: { bg: '#10B981', fg: '#FFFFFF' },
    background: { bg: '#F59E0B', fg: '#FFFFFF' },
  };

  const color = colors[imageType] || colors.hero;
  const labels: Record<string, string> = {
    hero: '메인 히어로 이미지',
    detail: '상품 상세 이미지',
    beforeAfter: 'Before/After',
    scenario: '사용 시나리오',
    background: '배경 이미지',
  };

  const label = labels[imageType] || imageType;
  const safeName = productName.replace(/[<>&"']/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="860" height="500" viewBox="0 0 860 500">
    <rect width="860" height="500" fill="${color.bg}"/>
    <text x="430" y="220" font-family="sans-serif" font-size="24" font-weight="bold" fill="${color.fg}" text-anchor="middle">${safeName}</text>
    <text x="430" y="270" font-family="sans-serif" font-size="18" fill="${color.fg}" opacity="0.8" text-anchor="middle">${label}</text>
    <text x="430" y="320" font-family="sans-serif" font-size="14" fill="${color.fg}" opacity="0.5" text-anchor="middle">AI 생성 이미지 플레이스홀더</text>
  </svg>`;

  const base64 = Buffer.from(svg).toString('base64');
  return {
    url: `data:image/svg+xml;base64,${base64}`,
    alt: `${productName} - ${label}`,
  };
}
