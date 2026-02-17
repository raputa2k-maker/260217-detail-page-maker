import { create } from 'zustand';

import type { ProductInput } from '@/types/product';
import type { PageSection, SectionContent } from '@/types/section';
import type {
  GenerationStep,
  DeviceType,
  GeneratedPage,
  HistoryItem,
} from '@/types/generated';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** localStorage 키 — 히스토리 저장/복원에 사용 */
const HISTORY_STORAGE_KEY = 'detail-page-maker:history';

/** 히스토리 최대 보관 개수 */
const MAX_HISTORY_ITEMS = 20;

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------

/** ProductInput 기본값 */
const DEFAULT_INPUT: ProductInput = {
  productName: '',
  category: 'beauty',
  targetAudience: {
    ageGroups: [],
    gender: '무관',
    keywords: [],
  },
  features: '',
  toneManner: 'trendy',
};

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

/** 페이지 스토어 상태 */
interface PageState {
  /** 상품 입력 데이터 */
  input: ProductInput;
  /** AI가 생성한 상세페이지 결과 */
  generatedPage: GeneratedPage | null;
  /** 현재 생성 진행 단계 */
  generationStep: GenerationStep;
  /** 생성 중 발생한 에러 메시지 */
  generationError: string | null;
  /** 미리보기 디바이스 유형 */
  deviceType: DeviceType;
  /** 미리보기 확대/축소 비율 (%) */
  zoomLevel: number;
  /** 이전 생성 히스토리 목록 */
  history: HistoryItem[];
}

/** 페이지 스토어 액션 */
interface PageActions {
  // -- Input 관련 ----------------------------------------------------------

  /**
   * 상품 입력 데이터를 통째로 교체한다.
   * @param input - 새 ProductInput 값
   */
  setInput: (input: ProductInput) => void;

  /**
   * 상품 입력 데이터를 부분적으로 업데이트한다.
   * @param partial - 변경할 필드만 포함한 Partial<ProductInput>
   */
  updateInput: (partial: Partial<ProductInput>) => void;

  // -- Generated page 관련 -------------------------------------------------

  /**
   * 생성된 페이지 데이터를 설정한다.
   * @param page - 생성된 페이지 또는 null (초기화)
   */
  setGeneratedPage: (page: GeneratedPage | null) => void;

  // -- Generation progress 관련 --------------------------------------------

  /**
   * 생성 진행 단계를 변경한다.
   * @param step - 새 GenerationStep 값
   */
  setGenerationStep: (step: GenerationStep) => void;

  /**
   * 생성 에러 메시지를 설정한다.
   * @param error - 에러 메시지 문자열 또는 null (초기화)
   */
  setGenerationError: (error: string | null) => void;

  // -- Preview 관련 --------------------------------------------------------

  /**
   * 미리보기 디바이스 유형을 변경한다.
   * @param device - 'mobile' | 'tablet' | 'desktop'
   */
  setDeviceType: (device: DeviceType) => void;

  /**
   * 미리보기 확대/축소 비율을 변경한다.
   * @param level - 백분율 (예: 100 = 100%)
   */
  setZoomLevel: (level: number) => void;

  // -- Section 조작 --------------------------------------------------------

  /**
   * 특정 섹션의 콘텐츠를 업데이트한다.
   * 해당 섹션의 `isEdited` 플래그가 자동으로 true 로 설정된다.
   *
   * @param sectionId - 업데이트할 섹션의 고유 ID
   * @param content   - 새 SectionContent 값
   */
  updateSection: (sectionId: string, content: SectionContent) => void;

  /**
   * 섹션 순서를 재배열한다.
   * 전달된 ID 배열 순서대로 각 섹션의 `order` 가 재할당된다.
   *
   * @param orderedIds - 새 순서대로 정렬된 섹션 ID 배열
   */
  reorderSections: (orderedIds: string[]) => void;

  // -- History 관련 --------------------------------------------------------

  /**
   * 현재 생성된 페이지를 히스토리에 저장하고 localStorage 에도 동기화한다.
   * `generatedPage` 가 null 이면 아무 동작도 하지 않는다.
   */
  saveToHistory: () => void;

  /**
   * localStorage 에서 히스토리를 불러와 스토어에 반영한다.
   * 앱 초기화 시 호출하는 용도이다.
   */
  loadHistory: () => void;

  /**
   * 히스토리 항목을 선택하여 `input`, `generatedPage` 상태를 복원한다.
   *
   * @param id - 복원할 HistoryItem 의 고유 ID
   */
  loadFromHistory: (id: string) => void;

  /**
   * 전체 히스토리를 삭제하고 localStorage 에서도 제거한다.
   */
  clearHistory: () => void;
}

/** 페이지 스토어 전체 타입 (상태 + 액션) */
export type PageStore = PageState & PageActions;

// ---------------------------------------------------------------------------
// Helper – localStorage 안전 래퍼
// ---------------------------------------------------------------------------

/**
 * localStorage 에서 히스토리를 읽어 파싱한다.
 * 파싱에 실패하면 빈 배열을 반환한다.
 */
function readHistoryFromStorage(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryItem[];
  } catch {
    return [];
  }
}

/**
 * 히스토리 배열을 localStorage 에 직렬화하여 저장한다.
 */
function writeHistoryToStorage(items: HistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage 용량 초과 등 — 조용히 무시
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

/**
 * 상세페이지 생성기 핵심 Zustand 스토어.
 *
 * 관리 영역:
 * - 상품 입력 상태 (`input`)
 * - AI 생성 결과 (`generatedPage`)
 * - 생성 진행 상태 (`generationStep`, `generationError`)
 * - 미리보기 설정 (`deviceType`, `zoomLevel`)
 * - 섹션 편집/재배열
 * - 히스토리 저장·복원·삭제
 */
export const usePageStore = create<PageStore>((set, get) => ({
  // -----------------------------------------------------------------------
  // State
  // -----------------------------------------------------------------------

  input: { ...DEFAULT_INPUT },
  generatedPage: null,
  generationStep: 'idle',
  generationError: null,
  deviceType: 'mobile',
  zoomLevel: 100,
  history: [],

  // -----------------------------------------------------------------------
  // Actions – Input
  // -----------------------------------------------------------------------

  setInput: (input) => {
    set({ input });
  },

  updateInput: (partial) => {
    set((state) => ({
      input: { ...state.input, ...partial },
    }));
  },

  // -----------------------------------------------------------------------
  // Actions – Generated page
  // -----------------------------------------------------------------------

  setGeneratedPage: (page) => {
    set({ generatedPage: page });
  },

  // -----------------------------------------------------------------------
  // Actions – Generation progress
  // -----------------------------------------------------------------------

  setGenerationStep: (step) => {
    set({ generationStep: step });
  },

  setGenerationError: (error) => {
    set({ generationError: error });
  },

  // -----------------------------------------------------------------------
  // Actions – Preview
  // -----------------------------------------------------------------------

  setDeviceType: (device) => {
    set({ deviceType: device });
  },

  setZoomLevel: (level) => {
    set({ zoomLevel: level });
  },

  // -----------------------------------------------------------------------
  // Actions – Section operations
  // -----------------------------------------------------------------------

  updateSection: (sectionId, content) => {
    set((state) => {
      if (!state.generatedPage) return state;

      const updatedSections: PageSection[] = state.generatedPage.sections.map(
        (section) =>
          section.id === sectionId
            ? { ...section, content, isEdited: true }
            : section,
      );

      return {
        generatedPage: {
          ...state.generatedPage,
          sections: updatedSections,
        },
      };
    });
  },

  reorderSections: (orderedIds) => {
    set((state) => {
      if (!state.generatedPage) return state;

      // ID → section 매핑을 만들어 순서를 재배정
      const sectionMap = new Map<string, PageSection>(
        state.generatedPage.sections.map((s) => [s.id, s]),
      );

      const reordered: PageSection[] = orderedIds
        .map((id, index) => {
          const section = sectionMap.get(id);
          if (!section) return null;
          return { ...section, order: index };
        })
        .filter((s): s is PageSection => s !== null);

      return {
        generatedPage: {
          ...state.generatedPage,
          sections: reordered,
        },
      };
    });
  },

  // -----------------------------------------------------------------------
  // Actions – History
  // -----------------------------------------------------------------------

  saveToHistory: () => {
    const { generatedPage, history } = get();
    if (!generatedPage) return;

    const newItem: HistoryItem = {
      id: generatedPage.id,
      productName: generatedPage.input.productName,
      createdAt: generatedPage.metadata.createdAt,
      page: generatedPage,
    };

    // 같은 ID 가 이미 존재하면 교체, 아니면 맨 앞에 추가
    const filtered = history.filter((item) => item.id !== newItem.id);
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

    set({ history: updated });
    writeHistoryToStorage(updated);
  },

  loadHistory: () => {
    const items = readHistoryFromStorage();
    set({ history: items });
  },

  loadFromHistory: (id) => {
    const { history } = get();
    const item = history.find((h) => h.id === id);
    if (!item) return;

    set({
      input: { ...item.page.input },
      generatedPage: item.page,
      generationStep: 'complete',
      generationError: null,
    });
  },

  clearHistory: () => {
    set({ history: [] });
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // 조용히 무시
    }
  },
}));
