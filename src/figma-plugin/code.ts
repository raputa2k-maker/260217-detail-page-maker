/**
 * Figma 상세페이지 임포터 플러그인
 *
 * AI 상세페이지 생성 도구에서 내보낸 JSON 파일을 읽어
 * Figma 노드로 재구성합니다.
 *
 * 사용법:
 * 1. 이 플러그인을 Figma에 설치
 * 2. Plugins → 상세페이지 임포터 실행
 * 3. 내보낸 JSON 파일을 업로드
 * 4. "임포트" 버튼 클릭
 */

// UI 표시
figma.showUI(__html__, { width: 400, height: 300 });

// -- Types ------------------------------------------------------------------

interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

interface FigmaSolidFill {
  type: 'SOLID';
  color: FigmaColor;
  opacity?: number;
}

interface FigmaImageFill {
  type: 'IMAGE';
  imageRef: string;
  scaleMode?: string;
}

type FigmaFill = FigmaSolidFill | FigmaImageFill;

interface FigmaTextStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  lineHeight?: { value: number; unit: string };
  letterSpacing?: { value: number; unit: string };
  textAlignHorizontal?: string;
}

interface NodeJSON {
  type: string;
  name: string;
  width?: number;
  height?: number;
  fills?: FigmaFill[];
  cornerRadius?: number;
  layoutMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  layoutSizingHorizontal?: string;
  layoutSizingVertical?: string;
  children?: NodeJSON[];
  characters?: string;
  style?: FigmaTextStyle;
  imageRef?: string;
}

interface ExportJSON {
  version: string;
  name: string;
  root: NodeJSON;
  images: Record<string, string>;
}

// -- Node creation ----------------------------------------------------------

async function loadFont(family: string, weight: number): Promise<FontName> {
  const styleMap: Record<number, string> = {
    100: 'Thin',
    200: 'ExtraLight',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'SemiBold',
    700: 'Bold',
    800: 'ExtraBold',
    900: 'Black',
  };

  const style = styleMap[weight] || 'Regular';
  const fontName: FontName = { family, style };

  try {
    await figma.loadFontAsync(fontName);
    return fontName;
  } catch {
    // 폰트가 없으면 기본 폰트로 대체
    const fallback: FontName = { family: 'Inter', style: 'Regular' };
    await figma.loadFontAsync(fallback);
    return fallback;
  }
}

function applyFills(node: GeometryMixin, fills?: FigmaFill[]) {
  if (!fills || fills.length === 0) return;

  const paintFills: Paint[] = [];
  for (const fill of fills) {
    if (fill.type === 'SOLID') {
      paintFills.push({
        type: 'SOLID',
        color: { r: fill.color.r, g: fill.color.g, b: fill.color.b },
        opacity: fill.opacity ?? fill.color.a ?? 1,
      });
    }
  }

  if (paintFills.length > 0) {
    node.fills = paintFills;
  }
}

async function createNode(json: NodeJSON): Promise<SceneNode | null> {
  switch (json.type) {
    case 'FRAME': {
      const frame = figma.createFrame();
      frame.name = json.name || 'Frame';

      if (json.width) frame.resize(json.width, json.height || 100);

      // Auto Layout
      if (json.layoutMode === 'VERTICAL' || json.layoutMode === 'HORIZONTAL') {
        frame.layoutMode = json.layoutMode;
        if (json.primaryAxisAlignItems) {
          frame.primaryAxisAlignItems = json.primaryAxisAlignItems as
            | 'MIN'
            | 'CENTER'
            | 'MAX'
            | 'SPACE_BETWEEN';
        }
        if (json.counterAxisAlignItems) {
          frame.counterAxisAlignItems = json.counterAxisAlignItems as
            | 'MIN'
            | 'CENTER'
            | 'MAX';
        }
        if (json.paddingLeft !== undefined) frame.paddingLeft = json.paddingLeft;
        if (json.paddingRight !== undefined) frame.paddingRight = json.paddingRight;
        if (json.paddingTop !== undefined) frame.paddingTop = json.paddingTop;
        if (json.paddingBottom !== undefined) frame.paddingBottom = json.paddingBottom;
        if (json.itemSpacing !== undefined) frame.itemSpacing = json.itemSpacing;
        if (json.layoutSizingHorizontal === 'HUG') {
          frame.primaryAxisSizingMode = 'AUTO';
        }
        if (json.layoutSizingVertical === 'HUG') {
          frame.counterAxisSizingMode = 'AUTO';
        }
      }

      if (json.cornerRadius) frame.cornerRadius = json.cornerRadius;
      applyFills(frame, json.fills);

      // Children
      if (json.children) {
        for (const child of json.children) {
          const childNode = await createNode(child);
          if (childNode) {
            frame.appendChild(childNode);
          }
        }
      }

      return frame;
    }

    case 'TEXT': {
      const text = figma.createText();
      text.name = json.name || 'Text';

      const style = json.style || { fontSize: 16, fontFamily: 'Inter', fontWeight: 400 };
      const fontName = await loadFont(style.fontFamily || 'Inter', style.fontWeight || 400);

      text.fontName = fontName;
      text.fontSize = style.fontSize || 16;
      text.characters = json.characters || '';

      if (style.textAlignHorizontal) {
        text.textAlignHorizontal = style.textAlignHorizontal as
          | 'LEFT'
          | 'CENTER'
          | 'RIGHT'
          | 'JUSTIFIED';
      }

      if (json.width) {
        text.resize(json.width, text.height);
        text.textAutoResize = 'HEIGHT';
      }

      applyFills(text, json.fills);

      return text;
    }

    case 'RECTANGLE': {
      const rect = figma.createRectangle();
      rect.name = json.name || 'Rectangle';
      if (json.width && json.height) rect.resize(json.width, json.height);
      if (json.cornerRadius) rect.cornerRadius = json.cornerRadius;
      applyFills(rect, json.fills);
      return rect;
    }

    case 'IMAGE': {
      // 이미지는 RECTANGLE + 이미지 fill로 표현
      const rect = figma.createRectangle();
      rect.name = json.name || 'Image';
      rect.resize(json.width || 860, json.height || 400);

      // 이미지 URL은 실제 Figma에서는 별도 처리 필요
      // 플레이스홀더로 회색 배경 설정
      rect.fills = [
        {
          type: 'SOLID',
          color: { r: 0.9, g: 0.9, b: 0.92 },
        },
      ];

      return rect;
    }

    default:
      return null;
  }
}

// -- Message handler --------------------------------------------------------

figma.ui.onmessage = async (msg: { type: string; data?: ExportJSON }) => {
  if (msg.type === 'import' && msg.data) {
    try {
      figma.ui.postMessage({ type: 'status', message: '임포트 시작...' });

      const rootNode = await createNode(msg.data.root);

      if (rootNode) {
        // 현재 페이지에 추가
        figma.currentPage.appendChild(rootNode);

        // 뷰포트 맞춤
        figma.viewport.scrollAndZoomIntoView([rootNode]);

        figma.ui.postMessage({ type: 'status', message: '임포트 완료!' });
        figma.notify('상세페이지가 성공적으로 임포트되었습니다! 🎉');
      } else {
        figma.ui.postMessage({ type: 'error', message: '노드 생성에 실패했습니다.' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      figma.ui.postMessage({ type: 'error', message });
      figma.notify(`오류: ${message}`, { error: true });
    }
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
