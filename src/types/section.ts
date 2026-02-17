/** 섹션 유형 (5단계 스토리텔링 구조) */
export type SectionType = 'hooking' | 'empathy' | 'solution' | 'trust' | 'conversion';

/** 섹션 유형별 표시 라벨 */
export const SECTION_LABELS: Record<SectionType, string> = {
  hooking: '후킹 영역',
  empathy: '공감 영역',
  solution: '해결 영역',
  trust: '신뢰 영역',
  conversion: '전환 영역',
};

/** 섹션별 비중 (%) */
export const SECTION_WEIGHTS: Record<SectionType, number> = {
  hooking: 20,
  empathy: 30,
  solution: 30,
  trust: 10,
  conversion: 10,
};

/** 후킹 영역 콘텐츠 */
export interface HookingContent {
  /** 메인 헤드카피 (15자 이내) */
  mainHeadcopy: string;
  /** 서브 카피 (30자 이내) */
  subCopy: string;
  /** 핵심 베네핏 키워드 3개 */
  benefitKeywords: string[];
}

/** 공감 영역 콘텐츠 */
export interface EmpathyContent {
  /** 타겟 고객의 고민/Pain point 3~4개 */
  painPoints: string[];
  /** 공감 유도 질문형 카피 */
  empathyQuestion: string;
  /** 체크리스트 항목들 */
  checklist: string[];
}

/** 해결 영역 콘텐츠 */
export interface SolutionContent {
  /** 특징→장점→혜택 구조 설명 */
  featureBenefits: Array<{
    feature: string;
    advantage: string;
    benefit: string;
  }>;
  /** Before/After 비교 문구 */
  beforeAfter: {
    before: string;
    after: string;
  };
  /** 핵심 스펙/성분 정보 */
  specs: Array<{
    label: string;
    value: string;
  }>;
}

/** 신뢰 영역 콘텐츠 */
export interface TrustContent {
  /** 가상 리뷰 목록 */
  reviews: Array<{
    rating: number;
    text: string;
    reviewer: string;
  }>;
  /** 숫자 기반 신뢰 데이터 */
  statistics: Array<{
    label: string;
    value: string;
  }>;
  /** 인증/수상 배지 텍스트 */
  badges: string[];
}

/** 전환 영역 콘텐츠 */
export interface ConversionContent {
  /** CTA 버튼 문구 (혜택 포함) */
  ctaText: string;
  /** 긴급성 유도 문구 */
  urgencyText: string;
  /** 추가 혜택 안내 문구 */
  bonusText: string;
}

/** 섹션 콘텐츠 유니온 타입 */
export type SectionContent =
  | HookingContent
  | EmpathyContent
  | SolutionContent
  | TrustContent
  | ConversionContent;

/** 생성된 이미지 정보 */
export interface GeneratedImage {
  /** 이미지 고유 ID */
  id: string;
  /** 이미지 URL (Blob URL 또는 외부 URL) */
  url: string;
  /** 이미지 용도 설명 */
  alt: string;
  /** 이미지 너비 */
  width: number;
  /** 이미지 높이 */
  height: number;
}

/** 섹션 스타일 정보 */
export interface SectionStyle {
  /** 배경색 */
  backgroundColor: string;
  /** 텍스트 색상 */
  textColor: string;
  /** 강조 색상 */
  accentColor: string;
  /** 패딩 (px) */
  padding: number;
}

/** 상세페이지 섹션 데이터 */
export interface PageSection {
  /** 고유 ID */
  id: string;
  /** 섹션 유형 */
  type: SectionType;
  /** 정렬 순서 */
  order: number;
  /** 생성된 텍스트 콘텐츠 */
  content: SectionContent;
  /** 생성된 이미지들 */
  images: GeneratedImage[];
  /** 스타일 정보 */
  style: SectionStyle;
  /** 사용자 수정 여부 */
  isEdited: boolean;
}

/** 기본 섹션 순서 */
export const DEFAULT_SECTION_ORDER: SectionType[] = [
  'hooking',
  'empathy',
  'solution',
  'trust',
  'conversion',
];
