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

/** 최대 재시도 횟수 */
const MAX_RETRIES = 2;

/** 재시도 간 대기 시간 (ms) */
const RETRY_DELAY_MS = 2000;

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
 * 지정된 밀리초만큼 대기합니다.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * placeholder SVG 이미지를 base64 data URL로 생성합니다.
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
 * API 호출 실패 시 최대 2회까지 자동으로 재시도합니다.
 * 모든 시도가 실패한 경우 placeholder 이미지를 반환합니다.
 */
export async function generateSectionImage(
  productInput: ProductInput,
  imageType: ImageType,
  description?: string
): Promise<GeneratedImageResult> {
  const alt = `${productInput.productName} - ${IMAGE_ALT_TEXT[imageType]}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[image-generator] Retry attempt ${attempt}/${MAX_RETRIES} for ${imageType}`);
        await delay(RETRY_DELAY_MS * attempt);
      }

      const client = getGeminiClient();
      const prompt = buildImagePrompt(productInput, imageType, description);

      console.log(`[image-generator] Generating ${imageType} image (attempt ${attempt + 1}/${MAX_RETRIES + 1}) with model: ${IMAGE_MODEL}`);

      const response = await client.models.generateContent({
        model: IMAGE_MODEL,
        contents: prompt,
        config: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      });

      // 응답 구조 디버그 로깅
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        console.warn(`[image-generator] No candidates in response for ${imageType}. Full response keys:`, Object.keys(response));
        throw new Error('No candidates in API response');
      }

      const parts = candidates[0].content?.parts;
      if (!parts || parts.length === 0) {
        console.warn(`[image-generator] No parts in response for ${imageType}. Candidate:`, JSON.stringify(candidates[0]).substring(0, 500));
        throw new Error('No parts in API response candidate');
      }

      // 이미지 데이터가 포함된 파트 찾기
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data && part.inlineData.mimeType) {
          const { mimeType, data } = part.inlineData;
          console.log(`[image-generator] Successfully generated ${imageType} image (${mimeType}, ${Math.round(data.length / 1024)}KB base64)`);
          const dataUrl = `data:${mimeType};base64,${data}`;
          return { url: dataUrl, alt };
        }
      }

      // 이미지 파트를 찾지 못한 경우 - 파트 타입 로깅
      const partTypes = parts.map((p) => {
        if (p.text) return 'text';
        if (p.inlineData) return `inlineData(${p.inlineData.mimeType || 'no-mime'})`;
        return `unknown(${Object.keys(p).join(',')})`;
      });
      console.warn(`[image-generator] No inline image data found for ${imageType}. Part types: [${partTypes.join(', ')}]`);
      throw new Error(`No inline image data in response. Parts: [${partTypes.join(', ')}]`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `[image-generator] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed for ${imageType}:`,
        lastError.message,
      );
    }
  }

  console.error(
    `[image-generator] All ${MAX_RETRIES + 1} attempts failed for ${imageType}. Last error:`,
    lastError?.message,
  );
  return { url: generatePlaceholder(imageType, productInput.productName), alt };
}
