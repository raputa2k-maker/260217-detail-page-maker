/**
 * 클라이언트 사이드 Figma JSON 다운로드 헬퍼
 */

import type { FigmaExportJSON } from '@/lib/figma/figma-types';

/**
 * Figma JSON 데이터를 .json 파일로 다운로드합니다.
 */
export function downloadFigmaJSON(data: FigmaExportJSON, filename?: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${data.name || '상세페이지'}-figma.json`;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * HTML 콘텐츠를 다운로드합니다.
 */
export function downloadHTML(html: string, filename?: string) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename || '상세페이지.html';
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
