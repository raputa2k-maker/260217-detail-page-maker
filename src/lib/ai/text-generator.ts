/**
 * AI 텍스트 생성 모듈
 *
 * Gemini API를 사용하여 상품 상세페이지의 각 섹션별 카피를 생성합니다.
 * JSON 응답 모드를 활용하여 구조화된 콘텐츠를 반환하며,
 * 실패 시 최대 2회 재시도하는 에러 핸들링을 포함합니다.
 */

import type { ProductInput } from '@/types/product';
import type { SectionType, SectionContent } from '@/types/section';
import { getGeminiClient, TEXT_MODEL } from './gemini-client';
import { buildSystemPrompt, buildSectionPrompt } from './prompts';

/** 최대 재시도 횟수 */
const MAX_RETRIES = 2;

/** 재시도 간 대기 시간 (ms) */
const RETRY_DELAY_MS = 1000;

/**
 * 지정된 밀리초만큼 대기합니다.
 *
 * @param ms - 대기 시간 (밀리초)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * AI 응답 텍스트에서 JSON을 파싱합니다.
 *
 * 응답이 마크다운 코드 블록으로 감싸져 있는 경우 이를 제거한 후 파싱합니다.
 *
 * @param responseText - AI 응답 원본 텍스트
 * @returns 파싱된 JSON 객체
 * @throws JSON 파싱에 실패한 경우 Error를 발생시킵니다
 */
function parseJsonResponse(responseText: string): unknown {
  let cleaned = responseText.trim();

  // 마크다운 코드 블록 제거 (```json ... ``` 또는 ``` ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?\s*```$/, '');
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${cleaned.substring(0, 200)}...`);
  }
}

/**
 * 파싱된 JSON이 해당 섹션 유형의 필수 필드를 포함하는지 검증합니다.
 *
 * @param data - 파싱된 JSON 데이터
 * @param sectionType - 섹션 유형
 * @returns 검증 통과 여부
 */
function validateSectionContent(data: unknown, sectionType: SectionType): data is SectionContent {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  switch (sectionType) {
    case 'hooking':
      return (
        typeof obj.mainHeadcopy === 'string' &&
        typeof obj.subCopy === 'string' &&
        Array.isArray(obj.benefitKeywords)
      );

    case 'empathy':
      return (
        Array.isArray(obj.painPoints) &&
        typeof obj.empathyQuestion === 'string' &&
        Array.isArray(obj.checklist)
      );

    case 'solution':
      return (
        Array.isArray(obj.featureBenefits) &&
        obj.beforeAfter !== null &&
        typeof obj.beforeAfter === 'object' &&
        Array.isArray(obj.specs)
      );

    case 'trust':
      return (
        Array.isArray(obj.reviews) &&
        Array.isArray(obj.statistics) &&
        Array.isArray(obj.badges)
      );

    case 'conversion':
      return (
        typeof obj.ctaText === 'string' &&
        typeof obj.urgencyText === 'string' &&
        typeof obj.bonusText === 'string'
      );

    default:
      return false;
  }
}

/**
 * 특정 섹션의 텍스트 콘텐츠를 AI로 생성합니다.
 *
 * Gemini API를 호출하여 상품 정보를 기반으로 해당 섹션의 카피를 생성합니다.
 * JSON 응답 모드를 사용하여 구조화된 데이터를 반환하며,
 * 실패 시 최대 2회까지 자동으로 재시도합니다.
 *
 * @param sectionType - 생성할 섹션 유형
 * @param productInput - 상품 입력 데이터
 * @returns 해당 섹션의 구조화된 콘텐츠
 * @throws 모든 재시도가 실패한 경우 Error를 발생시킵니다
 */
export async function generateSectionText(
  sectionType: SectionType,
  productInput: ProductInput
): Promise<SectionContent> {
  const client = getGeminiClient();
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildSectionPrompt(sectionType, productInput);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        await delay(RETRY_DELAY_MS * attempt);
      }

      const response = await client.models.generateContent({
        model: TEXT_MODEL,
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text;

      if (!responseText) {
        throw new Error('Empty response from Gemini API');
      }

      const parsed = parseJsonResponse(responseText);

      if (!validateSectionContent(parsed, sectionType)) {
        throw new Error(
          `Invalid response structure for section type "${sectionType}". ` +
            `Received: ${JSON.stringify(parsed).substring(0, 200)}`
        );
      }

      return parsed;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `[text-generator] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed for section "${sectionType}":`,
        lastError.message
      );
    }
  }

  throw new Error(
    `Failed to generate text for section "${sectionType}" after ${MAX_RETRIES + 1} attempts. ` +
      `Last error: ${lastError?.message}`
  );
}
