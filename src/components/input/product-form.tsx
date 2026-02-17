'use client';

import { useState, useCallback, useMemo } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

import { usePageStore } from '@/stores/page-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import CategorySelect from '@/components/input/category-select';
import TargetChips from '@/components/input/target-chips';
import ToneSelector from '@/components/input/tone-selector';
import {
  validateProductInput,
  hasValidationErrors,
  type ValidationErrors,
} from '@/lib/utils/validators';
import {
  MAX_TITLE_LENGTH,
  MAX_FEATURES_LENGTH,
  CATEGORY_PLACEHOLDERS,
} from '@/types/product';
import { GENERATION_STEP_MESSAGES, type GenerationStep } from '@/types/generated';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProductFormProps {
  /** 모든 필드가 유효할 때 호출되는 콜백 */
  onGenerate: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** 생성 중인 단계인지 판별 */
function isGenerating(step: GenerationStep): boolean {
  return step !== 'idle' && step !== 'complete' && step !== 'error';
}

/** 생성 단계에 따른 프로그레스 퍼센트 */
const STEP_PROGRESS: Record<GenerationStep, number> = {
  idle: 0,
  'generating-copy': 25,
  'generating-images': 55,
  'composing-layout': 80,
  complete: 100,
  error: 0,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/** 상품 정보 입력 폼 (메인) */
export default function ProductForm({ onGenerate }: ProductFormProps) {
  // -- Store ----------------------------------------------------------------
  const input = usePageStore((s) => s.input);
  const generationStep = usePageStore((s) => s.generationStep);
  const generationError = usePageStore((s) => s.generationError);
  const updateInput = usePageStore((s) => s.updateInput);

  // -- Local state ----------------------------------------------------------
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [pricingEnabled, setPricingEnabled] = useState(!!input.pricing);

  // -- Derived --------------------------------------------------------------
  const generating = isGenerating(generationStep);

  const featurePlaceholder = useMemo(
    () => CATEGORY_PLACEHOLDERS[input.category],
    [input.category],
  );

  // -- Handlers -------------------------------------------------------------
  const handleProductNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value.length <= MAX_TITLE_LENGTH) {
        updateInput({ productName: value });
      }
      // 에러 즉시 제거
      if (errors.productName) {
        setErrors((prev) => ({ ...prev, productName: undefined }));
      }
    },
    [updateInput, errors.productName],
  );

  const handleFeaturesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateInput({ features: e.target.value });
      if (errors.features) {
        setErrors((prev) => ({ ...prev, features: undefined }));
      }
    },
    [updateInput, errors.features],
  );

  const handlePricingToggle = useCallback(() => {
    if (pricingEnabled) {
      // 가격 정보 제거
      updateInput({ pricing: undefined });
      setPricingEnabled(false);
      setErrors((prev) => ({ ...prev, pricing: undefined }));
    } else {
      // 가격 정보 초기화
      updateInput({ pricing: { originalPrice: 0, salePrice: 0 } });
      setPricingEnabled(true);
    }
  }, [pricingEnabled, updateInput]);

  const handleOriginalPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      if (!isNaN(value)) {
        updateInput({
          pricing: {
            originalPrice: value,
            salePrice: input.pricing?.salePrice ?? 0,
          },
        });
      }
      if (errors.pricing) {
        setErrors((prev) => ({ ...prev, pricing: undefined }));
      }
    },
    [updateInput, input.pricing?.salePrice, errors.pricing],
  );

  const handleSalePriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      if (!isNaN(value)) {
        updateInput({
          pricing: {
            originalPrice: input.pricing?.originalPrice ?? 0,
            salePrice: value,
          },
        });
      }
      if (errors.pricing) {
        setErrors((prev) => ({ ...prev, pricing: undefined }));
      }
    },
    [updateInput, input.pricing?.originalPrice, errors.pricing],
  );

  // -- 할인율 계산 -----------------------------------------------------------
  const discountPercent = useMemo(() => {
    if (
      !input.pricing ||
      input.pricing.originalPrice <= 0 ||
      input.pricing.salePrice <= 0
    ) {
      return null;
    }
    if (input.pricing.salePrice >= input.pricing.originalPrice) return null;
    const percent =
      ((input.pricing.originalPrice - input.pricing.salePrice) /
        input.pricing.originalPrice) *
      100;
    return Math.round(percent);
  }, [input.pricing]);

  // -- Submit ---------------------------------------------------------------
  const handleSubmit = useCallback(() => {
    const validationErrors = validateProductInput(input);
    setErrors(validationErrors);
    if (hasValidationErrors(validationErrors)) return;
    onGenerate();
  }, [input, onGenerate]);

  // -- Render ---------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------------------- */}
      {/* 1. 상품명 */}
      {/* ---------------------------------------------------------------- */}
      <div className="space-y-2">
        <Label htmlFor="productName">상품명</Label>
        <div className="relative">
          <Input
            id="productName"
            placeholder="상품명을 입력하세요"
            value={input.productName}
            onChange={handleProductNameChange}
            maxLength={MAX_TITLE_LENGTH}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280]">
            {input.productName.length}/{MAX_TITLE_LENGTH}
          </span>
        </div>
        {errors.productName && (
          <p className="text-xs text-red-500">{errors.productName}</p>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 2. 카테고리 */}
      {/* ---------------------------------------------------------------- */}
      <CategorySelect />

      {/* ---------------------------------------------------------------- */}
      {/* 3. 타겟 고객 */}
      {/* ---------------------------------------------------------------- */}
      <div className="space-y-2">
        <TargetChips />
        {errors.targetAudience && (
          <p className="text-xs text-red-500">{errors.targetAudience}</p>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 4. 상품 특징 */}
      {/* ---------------------------------------------------------------- */}
      <div className="space-y-2">
        <Label htmlFor="features">상품 특징</Label>
        <Textarea
          id="features"
          placeholder={featurePlaceholder}
          value={input.features}
          onChange={handleFeaturesChange}
          maxLength={MAX_FEATURES_LENGTH}
          showCount
          rows={5}
        />
        {errors.features && (
          <p className="text-xs text-red-500">{errors.features}</p>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 5. 가격 정보 (선택) */}
      {/* ---------------------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="pricingToggle">가격 정보</Label>
          <button
            id="pricingToggle"
            type="button"
            role="switch"
            aria-checked={pricingEnabled}
            onClick={handlePricingToggle}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2 ${
              pricingEnabled ? 'bg-[#6366F1]' : 'bg-[#D1D5DB]'
            }`}
          >
            <span
              className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                pricingEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span className="text-xs text-[#6B7280]">(선택)</span>
        </div>

        {pricingEnabled && (
          <div className="space-y-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* 정가 */}
              <div className="space-y-1">
                <Label htmlFor="originalPrice">정가</Label>
                <div className="relative">
                  <Input
                    id="originalPrice"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={input.pricing?.originalPrice || ''}
                    onChange={handleOriginalPriceChange}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280]">
                    원
                  </span>
                </div>
              </div>

              {/* 할인가 */}
              <div className="space-y-1">
                <Label htmlFor="salePrice">할인가</Label>
                <div className="relative">
                  <Input
                    id="salePrice"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={input.pricing?.salePrice || ''}
                    onChange={handleSalePriceChange}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280]">
                    원
                  </span>
                </div>
              </div>
            </div>

            {/* 할인율 표시 */}
            {discountPercent !== null && (
              <p className="text-sm font-semibold text-red-500">
                {discountPercent}% 할인
              </p>
            )}

            {errors.pricing && (
              <p className="text-xs text-red-500">{errors.pricing}</p>
            )}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 6. 톤앤매너 */}
      {/* ---------------------------------------------------------------- */}
      <ToneSelector />

      {/* ---------------------------------------------------------------- */}
      {/* 7. 생성 버튼 + 진행 상태 */}
      {/* ---------------------------------------------------------------- */}
      <div className="space-y-3 pt-2">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={generating}
          onClick={handleSubmit}
        >
          {generating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              AI 컨텐츠 생성
            </>
          )}
        </Button>

        {/* 생성 진행 상태 */}
        {generating && (
          <div className="space-y-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#1F2937]">
                {GENERATION_STEP_MESSAGES[generationStep]}
              </span>
              <span className="text-xs text-[#6B7280]">
                {STEP_PROGRESS[generationStep]}%
              </span>
            </div>
            <Progress value={STEP_PROGRESS[generationStep]} />
          </div>
        )}

        {/* 생성 에러 */}
        {generationStep === 'error' && generationError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{generationError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
