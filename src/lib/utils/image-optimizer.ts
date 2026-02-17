/**
 * 클라이언트 사이드 이미지 최적화 유틸리티
 *
 * WebP 변환, 리사이즈, 용량 최적화를 처리합니다.
 */

/** 이미지 최적화 옵션 */
interface OptimizeOptions {
  /** 최대 너비 (px) */
  maxWidth?: number;
  /** 최대 높이 (px) */
  maxHeight?: number;
  /** 출력 품질 (0-1) */
  quality?: number;
  /** 출력 포맷 */
  format?: 'webp' | 'jpeg' | 'png';
}

const DEFAULT_OPTIONS: Required<OptimizeOptions> = {
  maxWidth: 1000,
  maxHeight: 2000,
  quality: 0.85,
  format: 'webp',
};

/**
 * 이미지 URL 또는 base64를 최적화된 Blob으로 변환합니다.
 */
export async function optimizeImage(
  src: string,
  options: OptimizeOptions = {},
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context is not available'));
        return;
      }

      // 비율 유지하면서 리사이즈
      let { width, height } = img;

      if (width > opts.maxWidth) {
        height = Math.round((height / width) * opts.maxWidth);
        width = opts.maxWidth;
      }
      if (height > opts.maxHeight) {
        width = Math.round((width / height) * opts.maxHeight);
        height = opts.maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType =
        opts.format === 'webp'
          ? 'image/webp'
          : opts.format === 'jpeg'
            ? 'image/jpeg'
            : 'image/png';

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        mimeType,
        opts.quality,
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

/**
 * Blob을 base64 Data URL로 변환합니다.
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 이미지 파일 크기를 사람이 읽기 쉬운 형태로 변환합니다.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
