'use client';

import { usePageStore } from '@/stores/page-store';
import { Label } from '@/components/ui/label';
import { Select, SelectOption } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  CATEGORY_LABELS,
  type CategoryType,
} from '@/types/product';

/** 카테고리 선택 드롭다운 + 기타 직접 입력 */
export default function CategorySelect() {
  const category = usePageStore((s) => s.input.category);
  const customCategory = usePageStore((s) => s.input.customCategory);
  const updateInput = usePageStore((s) => s.updateInput);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as CategoryType;
    updateInput({ category: value });
    // 기타가 아니면 customCategory 초기화
    if (value !== 'other') {
      updateInput({ customCategory: undefined });
    }
  };

  const handleCustomCategoryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    updateInput({ customCategory: e.target.value });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="category">카테고리</Label>
      <Select
        id="category"
        value={category}
        onChange={handleCategoryChange}
      >
        {(Object.entries(CATEGORY_LABELS) as [CategoryType, string][]).map(
          ([value, label]) => (
            <SelectOption key={value} value={value}>
              {label}
            </SelectOption>
          ),
        )}
      </Select>

      {category === 'other' && (
        <div className="mt-2">
          <Input
            placeholder="카테고리를 직접 입력하세요"
            value={customCategory ?? ''}
            onChange={handleCustomCategoryChange}
          />
        </div>
      )}
    </div>
  );
}
