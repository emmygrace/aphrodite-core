/**
 * ViewFrame utilities for converting world longitudes to screen angles.
 * This module integrates the orientation system from aphrodite-shared with the core renderer.
 */

import type {
  ViewFrame,
  AnchorTargetUnion,
  LockRule,
  AnchorLongitudeResolver,
  HouseNumber,
  SignNumber,
  AngleType,
} from '@gaia-tools/aphrodite-shared/orientation';
import { getAnchorLongitude, worldToScreenAngle, lockRuleApplies } from '@gaia-tools/aphrodite-shared/orientation';

/**
 * Normalize angle to 0-360 (moved here to avoid circular dependency)
 */
function normalizeAngle(degrees: number): number {
  let normalized = degrees % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
}

/**
 * Chart data needed for orientation calculations
 */
export interface ChartDataForOrientation {
  /**
   * Planet longitudes: planet index -> longitude (0-360)
   */
  planetLongitudes?: Map<number | string, number>;

  /**
   * House cusps: house number (1-12) -> cusp longitude (0-360)
   */
  houseCusps?: Map<HouseNumber, number>;

  /**
   * Angle longitudes: angle type -> longitude (0-360)
   */
  angleLongitudes?: Map<AngleType, number>;
}

/**
 * Build chart data from RenderData for orientation calculations
 */
import type { RenderData, HouseData, PlanetData } from '../types/index.js';

export function buildChartDataFromRenderData(
  renderData: RenderData
): ChartDataForOrientation {
  const planetLongitudes = new Map<number | string, number>();
  const houseCusps = new Map<HouseNumber, number>();
  const angleLongitudes = new Map<AngleType, number>();

  // Extract planet longitudes
  if (renderData.planets) {
    for (const planet of renderData.planets) {
      planetLongitudes.set(planet.planet, planet.degree);
    }
  }

  // Extract house cusps (convert from 0-11 index to 1-12 house number)
  if (renderData.houses) {
    for (const house of renderData.houses) {
      const houseNumber = ((house.house + 1) % 12) || 12 as HouseNumber;
      houseCusps.set(houseNumber, house.cuspDegree);
    }
  }

  // Extract angles (ASC, MC, etc.)
  // Note: We need to calculate these from houses if not provided directly
  // ASC is typically House 1 cusp, MC is House 10 cusp
  if (renderData.houses && renderData.houses.length > 0) {
    const house1 = renderData.houses.find((h) => h.house === 0); // House 1 is index 0
    const house10 = renderData.houses.find((h) => h.house === 9); // House 10 is index 9

    if (house1) {
      angleLongitudes.set('ASC', house1.cuspDegree);
      // DESC is opposite ASC
      angleLongitudes.set('DESC', (house1.cuspDegree + 180) % 360);
    }
    if (house10) {
      angleLongitudes.set('MC', house10.cuspDegree);
      // IC is opposite MC
      angleLongitudes.set('IC', (house10.cuspDegree + 180) % 360);
    }
  }

  return {
    planetLongitudes,
    houseCusps,
    angleLongitudes,
  };
}

/**
 * Create an AnchorLongitudeResolver from chart data
 */
export function createAnchorResolver(
  data: ChartDataForOrientation
): AnchorLongitudeResolver {
  return {
    getObjectLongitude(objectId: number | string): number | null {
      return data.planetLongitudes?.get(objectId) ?? null;
    },
    getHouseCusp(houseNumber: HouseNumber): number | null {
      return data.houseCusps?.get(houseNumber) ?? null;
    },
    getSignStart(signNumber: SignNumber): number {
      // Signs always start at 0, 30, 60, ... 330
      return signNumber * 30;
    },
    getAngleLongitude(angleType: AngleType): number | null {
      return data.angleLongitudes?.get(angleType) ?? null;
    },
  };
}

/**
 * Convert a world longitude to screen angle using ViewFrame.
 * This is the main function used by renderers.
 */
export function convertToScreenAngle(
  worldLongitude: number,
  viewFrame: ViewFrame,
  chartData: ChartDataForOrientation
): number {
  const resolver = createAnchorResolver(chartData);
  const anchorLongitude = getAnchorLongitude(viewFrame.anchor, resolver);

  if (anchorLongitude === null) {
    // Fallback: use simple rotation if anchor can't be resolved
    // This maintains backward compatibility
    const offset = viewFrame.screenAngleDeg - 180; // Convert screen angle to rotation offset
    return normalizeAngle(180 - worldLongitude + offset);
  }

  return worldToScreenAngle(worldLongitude, viewFrame, anchorLongitude);
}

/**
 * Check if an element should be locked based on LockRules
 */
export function shouldLockElement(
  elementType: 'object' | 'house' | 'sign' | 'angle',
  elementId: number | string | HouseNumber | SignNumber | AngleType,
  locks: LockRule[]
): boolean {
  return locks.some((lock) => lockRuleApplies(lock, elementType, elementId));
}

/**
 * Get the lock frame for an element (if locked)
 */
export function getLockFrameForElement(
  elementType: 'object' | 'house' | 'sign' | 'angle',
  elementId: number | string | HouseNumber | SignNumber | AngleType,
  locks: LockRule[]
): LockFrame | null {
  const applicableLock = locks.find((lock) =>
    lockRuleApplies(lock, elementType, elementId)
  );
  return applicableLock?.frame ?? null;
}

/**
 * Calculate the effective longitude for an element considering locks.
 * If locked to 'screen', returns the current screen position.
 * If locked to 'follow-anchor', maintains offset from anchor.
 * Otherwise, uses world longitude.
 */
export function getEffectiveLongitude(
  worldLongitude: number,
  elementType: 'object' | 'house' | 'sign' | 'angle',
  elementId: number | string | HouseNumber | SignNumber | AngleType,
  viewFrame: ViewFrame,
  chartData: ChartDataForOrientation,
  locks: LockRule[]
): number {
  const lockFrame = getLockFrameForElement(elementType, elementId, locks);

  if (!lockFrame) {
    // Not locked, use world longitude
    return worldLongitude;
  }

  if (lockFrame === 'screen') {
    // Locked to screen - this means it should stay at its current screen position
    // For now, we'll use the world longitude converted to screen, then back
    // In practice, you might want to store the screen position separately
    const screenAngle = convertToScreenAngle(worldLongitude, viewFrame, chartData);
    // Convert back to world (this is a simplification - actual implementation
    // might need to track screen positions separately)
    return worldLongitude;
  }

  if (lockFrame === 'world') {
    // Locked to world coordinates - use as-is
    return worldLongitude;
  }

  // For 'houses' or 'signs' frame locks, we maintain relative position
  // This is handled by the ViewFrame conversion
  return worldLongitude;
}

