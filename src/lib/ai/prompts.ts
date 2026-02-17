/**
 * AI 프롬프트 템플릿 모듈
 *
 * 상품 상세페이지 생성을 위한 시스템 프롬프트, 섹션별 사용자 프롬프트,
 * 이미지 생성 프롬프트를 빌드하는 함수들을 제공합니다.
 */

import type { ProductInput } from '@/types/product';
import { CATEGORY_LABELS, TONE_LABELS, TONE_IMAGE_STYLES } from '@/types/product';
import type { SectionType } from '@/types/section';

/** 이미지 유형 */
export type ImageType = 'hero' | 'detail' | 'beforeAfter' | 'scenario' | 'background';

/**
 * AI 카피라이터 시스템 프롬프트를 생성합니다.
 *
 * AIDA 모델 기반의 5단계 스토리텔링 구조, 헤드카피 공식,
 * CTA 최적화 규칙을 포함하는 한국어 시스템 프롬프트를 반환합니다.
 *
 * @returns 시스템 프롬프트 문자열
 */
export function buildSystemPrompt(): string {
  return `당신은 한국 이커머스 상세페이지 전문 카피라이터입니다.
다음 원칙을 반드시 준수하세요:

## AIDA 모델 기반 카피라이팅
- Attention(주의): 강렬한 헤드카피로 시선을 끌기
- Interest(흥미): 타겟 고객의 공감 포인트를 자극
- Desire(욕구): 제품의 FAB(Feature-Advantage-Benefit) 구조로 구매 욕구 자극
- Action(행동): 명확한 CTA와 긴급성으로 즉각적인 행동 유도

## 5단계 스토리텔링 구조
1. 후킹 (Hooking): 3초 내 시선 잡기 - 임팩트 있는 메인 카피와 핵심 키워드
2. 공감 (Empathy): 타겟 고객의 고민과 Pain Point를 정확히 짚어내기
3. 해결 (Solution): 제품이 해결해주는 방식을 FAB 구조로 설명
4. 신뢰 (Trust): 리뷰, 통계, 인증으로 신뢰 형성
5. 전환 (Conversion): 강력한 CTA와 긴급성으로 전환 유도

## 헤드카피 공식
- 숫자 공식: "OO% 개선", "단 O일만에"
- 질문 공식: "아직도 OO하세요?"
- 대비 공식: "OO은 잊으세요, 이제 OO입니다"
- 증언 공식: "OO만 명이 선택한 이유"
- 한정 공식: "오직 OO만을 위한"

## CTA 최적화 규칙
- 혜택 중심 CTA: 단순 "구매하기" 대신 혜택을 포함 (예: "50% 할인가로 시작하기")
- 긴급성 부여: 한정 수량, 기간 제한 등 활용
- 리스크 제거: 무료 반품, 100% 환불 보장 등 언급
- 추가 혜택 강조: 사은품, 적립금, 무료 배송 등 안내

## 작성 규칙
- 모든 카피는 한국어로 작성
- 타겟 고객의 언어와 톤으로 작성
- 과장 없이 신뢰감 있는 표현 사용
- 구체적인 숫자와 데이터 활용
- 짧고 임팩트 있는 문장 선호
- JSON 형식으로 정확히 응답`;
}

/**
 * 타겟 고객 정보를 문자열로 포맷합니다.
 *
 * @param productInput - 상품 입력 데이터
 * @returns 포맷된 타겟 고객 설명 문자열
 */
function formatTargetAudience(productInput: ProductInput): string {
  const { ageGroups, gender, keywords } = productInput.targetAudience;
  const parts: string[] = [];

  if (ageGroups.length > 0) {
    parts.push(`연령대: ${ageGroups.join(', ')}`);
  }
  if (gender !== '무관') {
    parts.push(`성별: ${gender}`);
  }
  if (keywords.length > 0) {
    parts.push(`키워드: ${keywords.join(', ')}`);
  }

  return parts.join(' / ');
}

/**
 * 가격 정보를 문자열로 포맷합니다.
 *
 * @param productInput - 상품 입력 데이터
 * @returns 포맷된 가격 정보 문자열 또는 빈 문자열
 */
function formatPricing(productInput: ProductInput): string {
  if (!productInput.pricing) return '';

  const { originalPrice, salePrice } = productInput.pricing;
  const discountRate = Math.round((1 - salePrice / originalPrice) * 100);

  return `정가: ${originalPrice.toLocaleString()}원 / 할인가: ${salePrice.toLocaleString()}원 (${discountRate}% 할인)`;
}

/**
 * 상품 정보 요약을 빌드합니다.
 *
 * @param productInput - 상품 입력 데이터
 * @returns 상품 정보 요약 문자열
 */
function buildProductSummary(productInput: ProductInput): string {
  const categoryLabel =
    productInput.category === 'other' && productInput.customCategory
      ? productInput.customCategory
      : CATEGORY_LABELS[productInput.category];
  const toneLabel = TONE_LABELS[productInput.toneManner];
  const targetInfo = formatTargetAudience(productInput);
  const pricingInfo = formatPricing(productInput);

  let summary = `## 상품 정보
- 상품명: ${productInput.productName}
- 카테고리: ${categoryLabel}
- 타겟 고객: ${targetInfo}
- 상품 특징: ${productInput.features}
- 톤앤매너: ${toneLabel}`;

  if (pricingInfo) {
    summary += `\n- 가격: ${pricingInfo}`;
  }

  return summary;
}

/**
 * 특정 섹션 유형에 대한 사용자 프롬프트를 빌드합니다.
 *
 * 상품 입력 데이터와 섹션 유형을 기반으로, AI가 해당 섹션의 콘텐츠를
 * JSON 형식으로 생성하도록 지시하는 프롬프트를 반환합니다.
 *
 * @param sectionType - 생성할 섹션 유형
 * @param productInput - 상품 입력 데이터
 * @returns 섹션 생성용 사용자 프롬프트 문자열
 */
export function buildSectionPrompt(sectionType: SectionType, productInput: ProductInput): string {
  const productSummary = buildProductSummary(productInput);
  const sectionInstructions = getSectionInstructions(sectionType);

  return `${productSummary}

${sectionInstructions}

반드시 위 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.`;
}

/**
 * 섹션 유형별 상세 지시사항과 JSON 스키마를 반환합니다.
 *
 * @param sectionType - 섹션 유형
 * @returns 해당 섹션의 생성 지시사항 문자열
 */
function getSectionInstructions(sectionType: SectionType): string {
  switch (sectionType) {
    case 'hooking':
      return `## 요청: 후킹(Hooking) 영역 카피 생성

3초 내에 시선을 잡을 수 있는 강렬한 헤드카피와 서브카피를 생성하세요.
헤드카피 공식(숫자, 질문, 대비, 증언, 한정)을 적극 활용하세요.

다음 JSON 형식으로 응답하세요:
{
  "mainHeadcopy": "메인 헤드카피 (15자 이내, 임팩트 있는 한 줄)",
  "subCopy": "서브 카피 (30자 이내, 메인 카피를 보완하는 설명)",
  "benefitKeywords": ["핵심 베네핏 키워드 1", "핵심 베네핏 키워드 2", "핵심 베네핏 키워드 3"]
}`;

    case 'empathy':
      return `## 요청: 공감(Empathy) 영역 카피 생성

타겟 고객이 "맞아, 나도 그래!"라고 느낄 수 있는 공감 포인트를 생성하세요.
고객의 실제 고민과 Pain Point를 정확히 짚어주세요.

다음 JSON 형식으로 응답하세요:
{
  "painPoints": [
    "타겟 고객의 구체적인 고민 1",
    "타겟 고객의 구체적인 고민 2",
    "타겟 고객의 구체적인 고민 3",
    "타겟 고객의 구체적인 고민 4"
  ],
  "empathyQuestion": "공감 유도 질문형 카피 (예: '혹시 이런 고민, 당신도 하고 계신가요?')",
  "checklist": [
    "체크리스트 항목 1 (고객이 '네, 저요!' 할 수 있는 상황)",
    "체크리스트 항목 2",
    "체크리스트 항목 3",
    "체크리스트 항목 4"
  ]
}`;

    case 'solution':
      return `## 요청: 해결(Solution) 영역 카피 생성

제품이 고객의 고민을 어떻게 해결하는지 FAB(Feature-Advantage-Benefit) 구조로 설명하세요.
Before/After 비교와 핵심 스펙 정보도 포함하세요.

다음 JSON 형식으로 응답하세요:
{
  "featureBenefits": [
    {
      "feature": "제품의 특징/기능",
      "advantage": "그 특징이 가져다주는 장점",
      "benefit": "고객이 실제로 얻는 혜택"
    },
    {
      "feature": "제품의 특징/기능 2",
      "advantage": "장점 2",
      "benefit": "혜택 2"
    },
    {
      "feature": "제품의 특징/기능 3",
      "advantage": "장점 3",
      "benefit": "혜택 3"
    }
  ],
  "beforeAfter": {
    "before": "제품 사용 전 상태를 생생하게 묘사",
    "after": "제품 사용 후 변화된 상태를 매력적으로 묘사"
  },
  "specs": [
    { "label": "핵심 스펙/성분 라벨", "value": "구체적인 수치/정보" },
    { "label": "스펙 라벨 2", "value": "수치/정보 2" },
    { "label": "스펙 라벨 3", "value": "수치/정보 3" }
  ]
}`;

    case 'trust':
      return `## 요청: 신뢰(Trust) 영역 카피 생성

제품에 대한 신뢰를 형성할 수 있는 가상 리뷰, 통계 데이터, 인증 배지를 생성하세요.
실제 쇼핑몰 리뷰처럼 자연스러운 톤으로 작성하세요.

다음 JSON 형식으로 응답하세요:
{
  "reviews": [
    {
      "rating": 5,
      "text": "자연스러운 한줄 리뷰 텍스트",
      "reviewer": "리뷰어 닉네임 (예: 김**)"
    },
    {
      "rating": 5,
      "text": "두 번째 리뷰 텍스트",
      "reviewer": "리뷰어 닉네임"
    },
    {
      "rating": 4,
      "text": "세 번째 리뷰 텍스트",
      "reviewer": "리뷰어 닉네임"
    }
  ],
  "statistics": [
    { "label": "통계 라벨 (예: 고객 만족도)", "value": "구체적 수치 (예: 97%)" },
    { "label": "통계 라벨 2", "value": "수치 2" },
    { "label": "통계 라벨 3", "value": "수치 3" }
  ],
  "badges": [
    "인증/수상 배지 텍스트 1 (예: 2024 소비자 만족 대상)",
    "인증/수상 배지 텍스트 2",
    "인증/수상 배지 텍스트 3"
  ]
}`;

    case 'conversion':
      return `## 요청: 전환(Conversion) 영역 카피 생성

즉각적인 구매 행동을 유도하는 CTA, 긴급성 문구, 추가 혜택 안내를 생성하세요.
혜택 중심 CTA, 리스크 제거 요소를 포함하세요.

다음 JSON 형식으로 응답하세요:
{
  "ctaText": "혜택 포함 CTA 버튼 문구 (예: '50% 할인가로 지금 시작하기')",
  "urgencyText": "긴급성 유도 문구 (예: '한정 수량 100개, 소진 시 정가 복원')",
  "bonusText": "추가 혜택 안내 (예: '지금 구매 시 전용 파우치 + 무료 배송')"
}`;

    default:
      throw new Error(`Unknown section type: ${sectionType}`);
  }
}

/**
 * 이미지 생성용 프롬프트를 빌드합니다.
 *
 * 상품 정보와 이미지 유형에 따라 적절한 이미지 생성 프롬프트를 반환합니다.
 * 톤앤매너에 맞는 스타일 키워드가 자동으로 포함됩니다.
 *
 * @param productInput - 상품 입력 데이터
 * @param imageType - 생성할 이미지 유형
 * @param description - 추가 이미지 설명 (선택)
 * @returns 이미지 생성용 프롬프트 문자열
 */
export function buildImagePrompt(
  productInput: ProductInput,
  imageType: ImageType,
  description?: string
): string {
  const categoryLabel =
    productInput.category === 'other' && productInput.customCategory
      ? productInput.customCategory
      : CATEGORY_LABELS[productInput.category];
  const styleKeywords = TONE_IMAGE_STYLES[productInput.toneManner];
  const baseContext = `Product: ${productInput.productName} (${categoryLabel}). Style: ${styleKeywords}.`;

  const typePrompts: Record<ImageType, string> = {
    hero: `Create a premium hero banner image for an e-commerce product detail page. ${baseContext} The image should be eye-catching, showcase the product prominently in the center, with a clean and attractive background. Professional product photography style, high quality, 16:9 aspect ratio.`,

    detail: `Create a detailed product feature image for an e-commerce listing. ${baseContext} Show the product from a close-up angle highlighting its key features, textures, and quality. Clean white or neutral background, studio lighting, high detail.`,

    beforeAfter: `Create a split before-and-after comparison image. ${baseContext} Left side shows the "before" state (problem/pain point), right side shows the "after" state (solution/improvement). Clear visual contrast, clean layout, easy to understand at a glance.`,

    scenario: `Create a lifestyle scenario image showing the product in use. ${baseContext} Show a person naturally using or benefiting from the product in an everyday setting. Warm, relatable, authentic feeling. The scene should resonate with the target audience.`,

    background: `Create a subtle, elegant background image for an e-commerce product detail page section. ${baseContext} Abstract or soft-focus design that complements the product's branding without distracting from text overlay. Subtle gradients or patterns, muted tones.`,
  };

  let prompt = typePrompts[imageType];

  if (description) {
    prompt += ` Additional context: ${description}`;
  }

  prompt += ' Do not include any text, logos, or watermarks in the image.';

  return prompt;
}
