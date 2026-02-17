import { ProductInput } from './product';
import { PageSection } from './section';

/** 생성 진행 단계 */
export type GenerationStep =
  | 'idle'
  | 'generating-copy'
  | 'generating-images'
  | 'composing-layout'
  | 'complete'
  | 'error';

/** 생성 단계별 표시 메시지 */
export const GENERATION_STEP_MESSAGES: Record<GenerationStep, string> = {
  idle: '',
  'generating-copy': '카피 생성 중...',
  'generating-images': '이미지 생성 중...',
  'composing-layout': '레이아웃 구성 중...',
  complete: '완료!',
  error: '생성 중 오류가 발생했습니다.',
};

/** AI 생성 결과 전체 페이지 데이터 */
export interface GeneratedPage {
  /** 고유 ID */
  id: string;
  /** 원본 입력 데이터 */
  input: ProductInput;
  /** 생성된 섹션들 */
  sections: PageSection[];
  /** 메타데이터 */
  metadata: {
    /** 생성 일시 */
    createdAt: string;
    /** 생성 소요 시간 (ms) */
    generationTime: number;
    /** 사용된 AI 모델 */
    aiModel: string;
  };
}

/** 미리보기 디바이스 유형 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/** 디바이스별 너비 (px) */
export const DEVICE_WIDTHS: Record<DeviceType, number> = {
  mobile: 375,
  tablet: 768,
  desktop: 1200,
};

/** Figma 내보내기 상태 */
export type ExportStatus = 'idle' | 'converting' | 'downloading' | 'complete' | 'error';

/** 히스토리 항목 */
export interface HistoryItem {
  /** 고유 ID */
  id: string;
  /** 상품명 (목록 표시용) */
  productName: string;
  /** 생성 일시 */
  createdAt: string;
  /** 저장된 페이지 데이터 */
  page: GeneratedPage;
}
