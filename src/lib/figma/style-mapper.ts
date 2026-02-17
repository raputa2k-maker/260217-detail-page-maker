/**
 * CSS 스타일 → Figma 스타일 매핑 유틸리티
 */

import type { FigmaColor, FigmaSolidFill, FigmaTextStyle } from './figma-types';

/** HEX 색상을 Figma Color (0-1 범위)로 변환 */
export function hexToFigmaColor(hex: string): FigmaColor {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const a = clean.length === 8 ? parseInt(clean.substring(6, 8), 16) / 255 : 1;
  return { r: Math.round(r * 100) / 100, g: Math.round(g * 100) / 100, b: Math.round(b * 100) / 100, a };
}

/** RGB/RGBA 문자열을 Figma Color로 변환 */
export function rgbToFigmaColor(rgb: string): FigmaColor {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return { r: 0, g: 0, b: 0 };
  return {
    r: Math.round((parseInt(match[1]) / 255) * 100) / 100,
    g: Math.round((parseInt(match[2]) / 255) * 100) / 100,
    b: Math.round((parseInt(match[3]) / 255) * 100) / 100,
    a: match[4] ? parseFloat(match[4]) : 1,
  };
}

/** CSS 색상 문자열을 Figma Color로 변환 */
export function cssColorToFigma(color: string): FigmaColor {
  if (color.startsWith('#')) return hexToFigmaColor(color);
  if (color.startsWith('rgb')) return rgbToFigmaColor(color);
  // 기본 색상 이름 매핑
  const named: Record<string, string> = {
    white: '#FFFFFF',
    black: '#000000',
    red: '#FF0000',
    transparent: '#00000000',
  };
  if (named[color.toLowerCase()]) return hexToFigmaColor(named[color.toLowerCase()]);
  return { r: 0, g: 0, b: 0 };
}

/** 단색 Figma Fill 생성 */
export function createSolidFill(color: string, opacity?: number): FigmaSolidFill {
  return {
    type: 'SOLID',
    color: cssColorToFigma(color),
    opacity,
  };
}

/** CSS font-weight를 숫자로 변환 */
export function fontWeightToNumber(weight: string | number): number {
  if (typeof weight === 'number') return weight;
  const map: Record<string, number> = {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  };
  return map[weight.toLowerCase()] || parseInt(weight) || 400;
}

/** CSS 텍스트 스타일을 Figma TextStyle로 변환 */
export function cssToFigmaTextStyle(css: {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: string;
  textDecoration?: string;
}): FigmaTextStyle {
  return {
    fontSize: css.fontSize || 16,
    fontFamily: css.fontFamily || 'Pretendard',
    fontWeight: fontWeightToNumber(css.fontWeight || 400),
    ...(css.lineHeight && {
      lineHeight: { value: css.lineHeight, unit: 'PIXELS' as const },
    }),
    ...(css.letterSpacing && {
      letterSpacing: { value: css.letterSpacing, unit: 'PIXELS' as const },
    }),
    ...(css.textAlign && {
      textAlignHorizontal: (
        { left: 'LEFT', center: 'CENTER', right: 'RIGHT' } as const
      )[css.textAlign] || 'LEFT',
    }),
    ...(css.textDecoration && {
      textDecoration: (
        {
          none: 'NONE',
          underline: 'UNDERLINE',
          'line-through': 'STRIKETHROUGH',
        } as const
      )[css.textDecoration] || 'NONE',
    }),
  };
}

/** px 문자열에서 숫자 추출 */
export function parsePx(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return parseFloat(value) || 0;
}

/** border-radius 문자열 파싱 */
export function parseBorderRadius(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  // 단일 값만 처리 (ex: "8px")
  return parseFloat(value) || 0;
}
