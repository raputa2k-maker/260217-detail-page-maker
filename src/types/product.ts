/** 상품 카테고리 유형 */
export type CategoryType =
  | 'beauty'
  | 'food'
  | 'fashion'
  | 'electronics'
  | 'lifestyle'
  | 'kids'
  | 'other';

/** 카테고리 표시 라벨 매핑 */
export const CATEGORY_LABELS: Record<CategoryType, string> = {
  beauty: '뷰티/화장품',
  food: '식품/건강식품',
  fashion: '패션/의류',
  electronics: '가전/전자기기',
  lifestyle: '생활용품',
  kids: '유아/키즈',
  other: '기타',
};

/** 카테고리별 예시 placeholder */
export const CATEGORY_PLACEHOLDERS: Record<CategoryType, string> = {
  beauty: '예: 비타민C 세럼, 자외선 차단 기능, 민감성 피부에도 사용 가능, 천연 성분 95%',
  food: '예: 유기농 원료, 무설탕, 간편 조리, 식이섬유 풍부, HACCP 인증',
  fashion: '예: 프리미엄 면 100%, 사계절 착용, 오버핏 디자인, 다양한 컬러',
  electronics: '예: 최신 칩셋 탑재, 12시간 배터리, 방수 IP68, AI 노이즈 캔슬링',
  lifestyle: '예: 친환경 소재, 다용도 수납, 공간 절약형, 조립 불필요',
  kids: '예: KC 인증 완료, 무독성 소재, 교육적 효과, 연령별 맞춤 설계',
  other: '상품의 핵심 장점, 차별점, 성분/소재 등을 자유롭게 입력하세요',
};

/** 연령대 */
export type AgeGroup = '10대' | '20대' | '30대' | '40대' | '50대+';

/** 성별 */
export type Gender = '남성' | '여성' | '무관';

/** 타겟 키워드 */
export type TargetKeyword = '직장인' | '학생' | '주부' | '부모' | '시니어';

/** 톤앤매너 유형 */
export type ToneManner = 'trendy' | 'professional' | 'warm' | 'impact';

/** 톤앤매너 표시 라벨 */
export const TONE_LABELS: Record<ToneManner, string> = {
  trendy: '트렌디/감각적',
  professional: '신뢰/전문적',
  warm: '따뜻한/감성적',
  impact: '강렬한/임팩트',
};

/** 톤앤매너별 이미지 스타일 키워드 */
export const TONE_IMAGE_STYLES: Record<ToneManner, string> = {
  trendy: 'bright, modern, minimalist, vibrant colors, trendy aesthetic',
  professional: 'clean, sophisticated, neutral tones, corporate, trustworthy',
  warm: 'warm lighting, cozy, soft colors, emotional, heartfelt',
  impact: 'bold, high contrast, dramatic lighting, striking, powerful',
};

/** 가격 정보 */
export interface Pricing {
  /** 정가 */
  originalPrice: number;
  /** 할인가 */
  salePrice: number;
}

/** 타겟 고객 정보 */
export interface TargetAudience {
  /** 연령대 (다중 선택) */
  ageGroups: AgeGroup[];
  /** 성별 */
  gender: Gender;
  /** 타겟 키워드 (다중 선택) */
  keywords: TargetKeyword[];
}

/** 상품 입력 데이터 */
export interface ProductInput {
  /** 상품명 (최대 50자) */
  productName: string;
  /** 카테고리 */
  category: CategoryType;
  /** 기타 카테고리 직접 입력 값 */
  customCategory?: string;
  /** 타겟 고객 정보 */
  targetAudience: TargetAudience;
  /** 상품 특징 (최대 500자) */
  features: string;
  /** 가격 정보 (선택) */
  pricing?: Pricing;
  /** 톤앤매너 */
  toneManner: ToneManner;
}

/** 입력값 유효성 검사 상수 */
export const MAX_TITLE_LENGTH = 50;
export const MAX_FEATURES_LENGTH = 500;

/** 연령대 옵션 */
export const AGE_GROUP_OPTIONS: AgeGroup[] = ['10대', '20대', '30대', '40대', '50대+'];

/** 성별 옵션 */
export const GENDER_OPTIONS: Gender[] = ['남성', '여성', '무관'];

/** 타겟 키워드 옵션 */
export const TARGET_KEYWORD_OPTIONS: TargetKeyword[] = ['직장인', '학생', '주부', '부모', '시니어'];
