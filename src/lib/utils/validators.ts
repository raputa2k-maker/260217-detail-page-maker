import { ProductInput, MAX_TITLE_LENGTH, MAX_FEATURES_LENGTH } from '@/types/product';

/** 유효성 검사 에러 */
export interface ValidationErrors {
  productName?: string;
  category?: string;
  targetAudience?: string;
  features?: string;
  pricing?: string;
}

/** 상품 입력 데이터 유효성 검사 */
export function validateProductInput(input: ProductInput): ValidationErrors {
  const errors: ValidationErrors = {};

  // 상품명 검사
  if (!input.productName.trim()) {
    errors.productName = '상품명을 입력해주세요.';
  } else if (input.productName.length > MAX_TITLE_LENGTH) {
    errors.productName = `상품명은 ${MAX_TITLE_LENGTH}자 이내로 입력해주세요.`;
  }

  // 카테고리 검사
  if (!input.category) {
    errors.category = '카테고리를 선택해주세요.';
  }

  // 타겟 고객 검사
  if (input.targetAudience.ageGroups.length === 0) {
    errors.targetAudience = '타겟 연령대를 1개 이상 선택해주세요.';
  }

  // 상품 특징 검사
  if (!input.features.trim()) {
    errors.features = '상품 특징을 입력해주세요.';
  } else if (input.features.length > MAX_FEATURES_LENGTH) {
    errors.features = `상품 특징은 ${MAX_FEATURES_LENGTH}자 이내로 입력해주세요.`;
  }

  // 가격 정보 검사 (선택 필드이므로 입력 시에만 검사)
  if (input.pricing) {
    if (input.pricing.originalPrice < 0) {
      errors.pricing = '정가는 0 이상이어야 합니다.';
    }
    if (input.pricing.salePrice < 0) {
      errors.pricing = '할인가는 0 이상이어야 합니다.';
    }
    if (input.pricing.salePrice > input.pricing.originalPrice) {
      errors.pricing = '할인가는 정가보다 클 수 없습니다.';
    }
  }

  return errors;
}

/** 유효성 에러가 있는지 확인 */
export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
