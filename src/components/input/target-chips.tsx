'use client';

import { usePageStore } from '@/stores/page-store';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AGE_GROUP_OPTIONS,
  GENDER_OPTIONS,
  TARGET_KEYWORD_OPTIONS,
  type AgeGroup,
  type Gender,
  type TargetKeyword,
} from '@/types/product';

/** 타겟 고객 칩 선택 (연령대 / 성별 / 키워드) */
export default function TargetChips() {
  const targetAudience = usePageStore((s) => s.input.targetAudience);
  const updateInput = usePageStore((s) => s.updateInput);

  // ---------------------------------------------------------------------------
  // 연령대 (multi-select toggle)
  // ---------------------------------------------------------------------------
  const toggleAgeGroup = (age: AgeGroup) => {
    const current = targetAudience.ageGroups;
    const next = current.includes(age)
      ? current.filter((a) => a !== age)
      : [...current, age];

    updateInput({
      targetAudience: { ...targetAudience, ageGroups: next },
    });
  };

  // ---------------------------------------------------------------------------
  // 성별 (single-select / radio behavior)
  // ---------------------------------------------------------------------------
  const selectGender = (gender: Gender) => {
    updateInput({
      targetAudience: { ...targetAudience, gender },
    });
  };

  // ---------------------------------------------------------------------------
  // 키워드 (multi-select toggle)
  // ---------------------------------------------------------------------------
  const toggleKeyword = (keyword: TargetKeyword) => {
    const current = targetAudience.keywords;
    const next = current.includes(keyword)
      ? current.filter((k) => k !== keyword)
      : [...current, keyword];

    updateInput({
      targetAudience: { ...targetAudience, keywords: next },
    });
  };

  return (
    <div className="space-y-4">
      {/* 연령대 */}
      <div className="space-y-2">
        <Label>연령대</Label>
        <div className="flex flex-wrap gap-2">
          {AGE_GROUP_OPTIONS.map((age) => {
            const isSelected = targetAudience.ageGroups.includes(age);
            return (
              <Badge
                key={age}
                variant={isSelected ? 'active' : 'outline'}
                className="cursor-pointer select-none"
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => toggleAgeGroup(age)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleAgeGroup(age);
                  }
                }}
              >
                {age}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* 성별 */}
      <div className="space-y-2">
        <Label>성별</Label>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((gender) => {
            const isSelected = targetAudience.gender === gender;
            return (
              <Badge
                key={gender}
                variant={isSelected ? 'active' : 'outline'}
                className="cursor-pointer select-none"
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => selectGender(gender)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectGender(gender);
                  }
                }}
              >
                {gender}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* 키워드 */}
      <div className="space-y-2">
        <Label>키워드</Label>
        <div className="flex flex-wrap gap-2">
          {TARGET_KEYWORD_OPTIONS.map((keyword) => {
            const isSelected = targetAudience.keywords.includes(keyword);
            return (
              <Badge
                key={keyword}
                variant={isSelected ? 'active' : 'outline'}
                className="cursor-pointer select-none"
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => toggleKeyword(keyword)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleKeyword(keyword);
                  }
                }}
              >
                {keyword}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
