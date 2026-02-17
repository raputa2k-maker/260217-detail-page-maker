/**
 * Gemini AI 클라이언트 설정
 *
 * Google Gemini API와의 통신을 위한 클라이언트 초기화 및 모델 상수를 제공합니다.
 * 싱글톤 패턴으로 클라이언트 인스턴스를 관리합니다.
 */

import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.GOOGLE_AI_API_KEY || '';

/** 텍스트 생성용 모델 (Gemini 2.5 Pro) */
export const TEXT_MODEL = 'gemini-2.5-pro';

/** 이미지 생성용 모델 (Imagen 3 - 고품질 이미지 생성) */
export const IMAGE_MODEL = 'imagen-3.0-generate-002';

let client: GoogleGenAI | null = null;

/**
 * Gemini AI 클라이언트 인스턴스를 반환합니다.
 * 최초 호출 시 클라이언트를 초기화하고, 이후에는 캐시된 인스턴스를 반환합니다.
 *
 * @returns GoogleGenAI 클라이언트 인스턴스
 * @throws API 키가 설정되지 않은 경우 Error를 발생시킵니다
 */
export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    if (!API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is not set');
    }
    client = new GoogleGenAI({ apiKey: API_KEY });
  }
  return client;
}
