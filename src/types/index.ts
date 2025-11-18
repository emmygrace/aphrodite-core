import type { Selection } from 'd3-selection';

// Re-export VisualConfig and GlyphConfig from aphrodite-shared
export type { VisualConfig, GlyphConfig } from '@gaia-tools/aphrodite-shared/configs';

// Re-export orientation types
export type {
  ViewFrame,
  LockRule,
  OrientationPreset,
  OrientationProgram,
  OrientationRule,
  OrientationRuntimeState,
  ChartSnapshot,
} from '@gaia-tools/aphrodite-shared/orientation';

// Export chart data type (matches ChartSnapshot but defined here for core)
export type { ChartDataForOrientation } from '../utils/viewFrame.js';

export type D3Selection = Selection<SVGGElement, unknown, null, undefined>;

