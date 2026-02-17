'use client';

import { usePageStore } from '@/stores/page-store';
import { Label } from '@/components/ui/label';
import { TONE_LABELS, type ToneManner } from '@/types/product';
import { cn } from '@/lib/utils';

/** 톤앤매너 아이콘 매핑 (이모지 대신 텍스트 기호 사용) */
const TONE_ICONS: Record<ToneManner, string> = {
  trendy: '\u2728',     // sparkles
  professional: '\uD83D\uDCBC', // briefcase
  warm: '\u2600\uFE0F', // sun
  impact: '\u26A1',     // lightning
};

/** 톤앤매너 설명 */
const TONE_DESCRIPTIONS: Record<ToneManner, string> = {
  trendy: 'MZ세대 감성의 세련된 톤',
  professional: '신뢰감을 주는 전문적 톤',
  warm: '공감과 감성을 담은 톤',
  impact: '시선을 사로잡는 강렬한 톤',
};

/** 톤앤매너 라디오 타일 선택기 */
export default function ToneSelector() {
  const toneManner = usePageStore((s) => s.input.toneManner);
  const updateInput = usePageStore((s) => s.updateInput);

  const handleSelect = (tone: ToneManner) => {
    updateInput({ toneManner: tone });
  };

  return (
    <div className="space-y-2">
      <Label>톤앤매너</Label>
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(TONE_LABELS) as ToneManner[]).map((tone) => {
          const isSelected = toneManner === tone;
          return (
            <button
              key={tone}
              type="button"
              onClick={() => handleSelect(tone)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-4 text-center transition-all',
                'hover:border-[#6366F1]/50 hover:bg-[#F5F3FF]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2',
                isSelected
                  ? 'border-[#6366F1] bg-[#F5F3FF] shadow-sm'
                  : 'border-[#E5E7EB] bg-white',
              )}
            >
              <span className="text-2xl" aria-hidden="true">
                {TONE_ICONS[tone]}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold',
                  isSelected ? 'text-[#6366F1]' : 'text-[#1F2937]',
                )}
              >
                {TONE_LABELS[tone]}
              </span>
              <span className="text-xs text-[#6B7280]">
                {TONE_DESCRIPTIONS[tone]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
