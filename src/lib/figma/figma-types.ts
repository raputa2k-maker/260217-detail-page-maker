/**
 * Figma Plugin API 호환 노드 타입 정의
 *
 * Figma 플러그인에서 createNodeFromJSON() 등으로 임포트할 수 있는
 * JSON 구조를 정의합니다.
 */

/** 색상 (0-1 범위) */
export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/** 단색 채우기 */
export interface FigmaSolidFill {
  type: 'SOLID';
  color: FigmaColor;
  opacity?: number;
}

/** 이미지 채우기 */
export interface FigmaImageFill {
  type: 'IMAGE';
  imageRef: string;
  scaleMode?: 'FILL' | 'FIT' | 'CROP' | 'TILE';
}

export type FigmaFill = FigmaSolidFill | FigmaImageFill;

/** 테두리 */
export interface FigmaStroke {
  type: 'SOLID';
  color: FigmaColor;
}

/** 그림자 효과 */
export interface FigmaDropShadow {
  type: 'DROP_SHADOW';
  color: FigmaColor;
  offset: { x: number; y: number };
  radius: number;
  visible: boolean;
}

export type FigmaEffect = FigmaDropShadow;

/** 텍스트 스타일 */
export interface FigmaTextStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  lineHeight?: { value: number; unit: 'PIXELS' | 'PERCENT' | 'AUTO' };
  letterSpacing?: { value: number; unit: 'PIXELS' | 'PERCENT' };
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT';
  textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
}

/** Auto Layout 속성 */
export interface FigmaAutoLayout {
  layoutMode: 'VERTICAL' | 'HORIZONTAL';
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  layoutSizingHorizontal?: 'FIXED' | 'HUG' | 'FILL';
  layoutSizingVertical?: 'FIXED' | 'HUG' | 'FILL';
}

/** 기본 노드 속성 */
interface FigmaBaseNode {
  name: string;
  width?: number;
  height?: number;
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  strokeWeight?: number;
  cornerRadius?: number;
  effects?: FigmaEffect[];
  opacity?: number;
  visible?: boolean;
}

/** FRAME 노드 */
export interface FigmaFrameNode extends FigmaBaseNode, Partial<FigmaAutoLayout> {
  type: 'FRAME';
  children: FigmaNode[];
  clipsContent?: boolean;
}

/** TEXT 노드 */
export interface FigmaTextNode extends FigmaBaseNode {
  type: 'TEXT';
  characters: string;
  style: FigmaTextStyle;
}

/** RECTANGLE 노드 */
export interface FigmaRectangleNode extends FigmaBaseNode {
  type: 'RECTANGLE';
}

/** IMAGE 노드 (RECTANGLE + 이미지 fill) */
export interface FigmaImageNode extends FigmaBaseNode {
  type: 'IMAGE';
  imageRef: string;
}

/** 노드 유니온 */
export type FigmaNode =
  | FigmaFrameNode
  | FigmaTextNode
  | FigmaRectangleNode
  | FigmaImageNode;

/** 전체 Figma 내보내기 JSON */
export interface FigmaExportJSON {
  version: string;
  name: string;
  root: FigmaFrameNode;
  images: Record<string, string>; // imageRef → URL 매핑
}
