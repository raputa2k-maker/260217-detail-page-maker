/**
 * AI 이미지 생성 모듈
 *
 * Gemini API의 이미지 생성 기능을 사용하여 상품 상세페이지에 필요한
 * 다양한 유형의 이미지를 생성합니다.
 * 생성 실패 시 placeholder 이미지를 반환하여 안정적인 동작을 보장합니다.
 */

import type { ProductInput } from '@/types/product';
import { getGeminiClient, IMAGE_MODEL } from './gemini-client';
import { buildImagePrompt, type ImageType } from './prompts';

/** 생성된 이미지 결과 */
export interface GeneratedImageResult {
  /** 이미지 URL (base64 data URL 또는 placeholder) */
  url: string;
  /** 이미지 대체 텍스트 */
  alt: string;
}

/** 이미지 유형별 대체 텍스트 */
const IMAGE_ALT_TEXT: Record<ImageType, string> = {
  hero: '상품 히어로 배너 이미지',
  detail: '상품 상세 특징 이미지',
  beforeAfter: '사용 전후 비교 이미지',
  scenario: '사용 시나리오 이미지',
  background: '섹션 배경 이미지',
};

/** 이미지 유형별 placeholder SVG 색상 */
const PLACEHOLDER_COLORS: Record<ImageType, { bg: string; fg: string }> = {
  hero: { bg: '#6366f1', fg: '#e0e7ff' },
  detail: { bg: '#0891b2', fg: '#cffafe' },
  beforeAfter: { bg: '#059669', fg: '#d1fae5' },
  scenario: { bg: '#d97706', fg: '#fef3c7' },
  background: { bg: '#64748b', fg: '#e2e8f0' },
};

/**
 * placeholder SVG 이미지를 base64 data URL로 생성합니다.
 *
 * @param imageType - 이미지 유형
 * @param productName - 상품명
 * @returns base64 인코딩된 SVG data URL
 */
function generatePlaceholder(imageType: ImageType, productName: string): string {
  const colors = PLACEHOLDER_COLORS[imageType];
  const altText = IMAGE_ALT_TEXT[imageType];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="${colors.bg}" rx="8"/>
    <text x="400" y="270" text-anchor="middle" fill="${colors.fg}" font-family="sans-serif" font-size="24" font-weight="bold">${altText}</text>
    <text x="400" y="310" text-anchor="middle" fill="${colors.fg}" font-family="sans-serif" font-size="16" opacity="0.8">${escapeXml(productName)}</text>
    <text x="400" y="350" text-anchor="middle" fill="${colors.fg}" font-family="sans-serif" font-size="14" opacity="0.6">AI 이미지 생성 대기 중</text>
  </svg>`;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * XML 특수 문자를 이스케이프합니다.
 *
 * @param str - 이스케이프할 문자열
 * @returns 이스케이프된 문자열
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * AI를 사용하여 상품 상세페이지용 이미지를 생성합니다.
 *
 * Gemini API의 멀티모달 생성 기능을 활용하여 이미지를 생성합니다.
 * 생성된 이미지는 base64 data URL 형태로 반환됩니다.
 * API 호출 실패 또는 이미지 데이터가 없는 경우 placeholder 이미지를 반환합니다.
 *
 * @param productInput - 상품 입력 데이터
 * @param imageType - 생성할 이미지 유형
 * @param description - 추가 이미지 설명 (선택)
 * @returns 생성된 이미지의 URL과 대체 텍스트
 */
export async function generateSectionImage(
  productInput: ProductInput,
  imageType: ImageType,
  description?: string
): Promise<GeneratedImageResult> {
  const alt = `${productInput.productName} - ${IMAGE_ALT_TEXT[imageType]}`;

  try {
    const client = getGeminiClient();
    const prompt = buildImagePrompt(productInput, imageType, description);

    const response = await client.models.generateContent({
      model: IMAGE_MODEL,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    // 응답에서 인라인 이미지 데이터 추출
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      console.warn(`[image-generator] No candidates in response for ${imageType}`);
      return { url: generatePlaceholder(imageType, productInput.productName), alt };
    }

    const parts = candidates[0].content?.parts;
    if (!parts || parts.length === 0) {
      console.warn(`[image-generator] No parts in response for ${imageType}`);
      return { url: generatePlaceholder(imageType, productInput.productName), alt };
    }

    // 이미지 데이터가 포함된 파트 찾기
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data && part.inlineData.mimeType) {
        const { mimeType, data } = part.inlineData;
        const dataUrl = `data:${mimeType};base64,${data}`;
        return { url: dataUrl, alt };
      }
    }

    // 이미지 파트를 찾지 못한 경우
    console.warn(`[image-generator] No inline image data found in response for ${imageType}`);
    return { url: generatePlaceholder(imageType, productInput.productName), alt };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[image-generator] Failed to generate ${imageType} image:`, errorMessage);
    return { url: generatePlaceholder(imageType, productInput.productName), alt };
  }
}
