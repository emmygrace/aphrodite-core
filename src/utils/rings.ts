import { VisualConfig } from '../types/index.js';

/**
 * Calculates the radius for a specific ring index
 */
export function getRingRadius(
  ringIndex: number,
  visualConfig: VisualConfig,
  baseRadius: number = 0
): number {
  const { ringWidth = 30, ringSpacing = 10 } = visualConfig;
  let radius = baseRadius;
  for (let i = 0; i < ringIndex; i++) {
    radius += ringWidth + ringSpacing;
  }
  return radius;
}

/**
 * Calculates the inner and outer radii for a ring
 */
export function getRingRadii(
  ringIndex: number,
  visualConfig: VisualConfig,
  baseRadius: number = 0
): { innerRadius: number; outerRadius: number } {
  const { ringWidth = 30 } = visualConfig;
  const innerRadius = getRingRadius(ringIndex, visualConfig, baseRadius);
  const outerRadius = innerRadius + ringWidth;
  return { innerRadius, outerRadius };
}

/**
 * Gets the center radius of a ring (for placing glyphs)
 */
export function getRingCenterRadius(
  ringIndex: number,
  visualConfig: VisualConfig,
  baseRadius: number = 0
): number {
  const { innerRadius, outerRadius } = getRingRadii(
    ringIndex,
    visualConfig,
    baseRadius
  );
  return (innerRadius + outerRadius) / 2;
}

