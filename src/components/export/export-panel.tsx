'use client';

import { useState } from 'react';
import { Download, FileJson, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageStore } from '@/stores/page-store';
import { downloadFigmaJSON } from './figma-converter';
import type { FigmaExportJSON } from '@/lib/figma/figma-types';
import type { ExportStatus } from '@/types/generated';

/**
 * 내보내기 패널
 *
 * Figma JSON, HTML 다운로드 기능을 제공합니다.
 */
export default function ExportPanel() {
  const generatedPage = usePageStore((s) => s.generatedPage);
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isDisabled = !generatedPage || generatedPage.sections.length === 0;

  const handleFigmaExport = async () => {
    if (!generatedPage) return;

    setExportStatus('converting');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/export-figma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: generatedPage.sections,
          pageName: generatedPage.input.productName || '상세페이지',
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Figma 변환에 실패했습니다.');
      }

      const figmaJSON: FigmaExportJSON = await response.json();

      setExportStatus('downloading');
      downloadFigmaJSON(figmaJSON, `${generatedPage.input.productName}-figma.json`);

      setExportStatus('complete');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      console.error('[ExportPanel] Figma export error:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Figma 내보내기 중 오류가 발생했습니다.',
      );
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 5000);
    }
  };

  const handleHTMLExport = () => {
    if (!generatedPage) return;

    // 미리보기 영역의 HTML을 가져와 독립 실행형 HTML로 내보내기
    const previewElement = document.querySelector('[data-preview-content]');
    const html = previewElement?.innerHTML || '<p>미리보기 콘텐츠를 찾을 수 없습니다.</p>';

    const fullHTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${generatedPage.input.productName} - 상세페이지</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 860px; margin: 0 auto; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${html}
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedPage.input.productName}-상세페이지.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">내보내기</h3>

      {/* Figma JSON 내보내기 */}
      <Button
        onClick={handleFigmaExport}
        disabled={isDisabled || exportStatus === 'converting' || exportStatus === 'downloading'}
        className="w-full justify-start gap-2"
        variant="outline"
      >
        {exportStatus === 'converting' || exportStatus === 'downloading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : exportStatus === 'complete' ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : exportStatus === 'error' ? (
          <AlertCircle className="h-4 w-4 text-red-500" />
        ) : (
          <FileJson className="h-4 w-4" />
        )}
        <span>
          {exportStatus === 'converting'
            ? '변환 중...'
            : exportStatus === 'downloading'
              ? '다운로드 중...'
              : exportStatus === 'complete'
                ? '다운로드 완료!'
                : 'Figma JSON 내보내기'}
        </span>
      </Button>

      {/* HTML 내보내기 */}
      <Button
        onClick={handleHTMLExport}
        disabled={isDisabled}
        className="w-full justify-start gap-2"
        variant="outline"
      >
        <FileText className="h-4 w-4" />
        <span>HTML 내보내기</span>
      </Button>

      {/* 에러 메시지 */}
      {errorMessage && (
        <p className="text-xs text-red-500">{errorMessage}</p>
      )}

      {/* 안내 문구 */}
      <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
        <p className="font-medium">Figma 내보내기 안내</p>
        <ul className="mt-1 space-y-0.5">
          <li>• JSON 파일을 다운로드 후 Figma 플러그인에서 임포트</li>
          <li>• 레이아웃, 텍스트 스타일, 색상이 보존됩니다</li>
          <li>• 그라데이션, 애니메이션은 미지원</li>
        </ul>
      </div>
    </div>
  );
}
