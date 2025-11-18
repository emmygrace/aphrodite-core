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
  OrientationProgram,
  OrientationRule,
  OrientationRuntimeState,
  ChartSnapshot,
} from '@gaia-tools/aphrodite-shared/orientation';
import { getAnchorLongitude, worldToScreenAngle, lockRuleApplies, normalizeDeg } from '@gaia-tools/aphrodite-shared/orientation';

/**
 * Normalize angle to 0-360
 * Uses normalizeDeg from shared module
 */
const normalizeAngle = normalizeDeg;

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

/**
 * Get which house (1-12) a longitude falls in based on house cusps
 */
function getHouseForLongitude(
  longitude: number,
  houseCusps: Map<HouseNumber, number>
): number | null {
  if (!houseCusps || houseCusps.size === 0) {
    return null;
  }

  const normalizedLon = normalizeAngle(longitude);
  
  // Sort house cusps by longitude
  const sortedHouses = Array.from(houseCusps.entries())
    .map(([houseNum, cusp]) => ({ houseNum, cusp: normalizeAngle(cusp) }))
    .sort((a, b) => a.cusp - b.cusp);

  // Find which house contains this longitude
  for (let i = 0; i < sortedHouses.length; i++) {
    const current = sortedHouses[i];
    const next = sortedHouses[(i + 1) % sortedHouses.length];
    
    // Handle wrap-around case (house 12 to house 1)
    if (next.cusp < current.cusp) {
      // This is the last house before wrap
      if (normalizedLon >= current.cusp || normalizedLon < next.cusp) {
        return current.houseNum;
      }
    } else {
      // Normal case
      if (normalizedLon >= current.cusp && normalizedLon < next.cusp) {
        return current.houseNum;
      }
    }
  }

  // Fallback: return first house if we can't determine
  return sortedHouses[0]?.houseNum ?? null;
}

/**
 * Check if a rule should be triggered based on chart state
 */
function ruleTriggered(
  rule: OrientationRule,
  chart: ChartSnapshot,
  state: OrientationRuntimeState
): boolean {
  const { trigger } = rule;

  switch (trigger.type) {
    case 'ascLeavesHouse': {
      const ascLon = chart.angleLongitudes?.get('ASC');
      if (ascLon === undefined || !chart.houseCusps) {
        return false;
      }

      const currentHouse = getHouseForLongitude(ascLon, chart.houseCusps);
      const targetHouse = trigger.house;

      if (currentHouse === null) {
        return false;
      }

      // Check if we've already applied this rule (for one-time transitions)
      if (state.appliedRuleIds.has(rule.id)) {
        return false;
      }

      // Get previous ASC house from state
      // Key "ASC" stores the house number directly
      const previousAscHouse = state.previousHousePositions?.get('ASC');

      // Trigger condition: previousAscHouse === targetHouse AND currentAscHouse !== targetHouse
      // This detects the moment ASC transitions from the target house to another house
      if (previousAscHouse === targetHouse && currentHouse !== targetHouse) {
        return true;
      }

      // Don't trigger on first frame (when previousAscHouse is undefined)
      // Don't trigger if ASC is still in target house
      // Don't trigger if ASC was never in target house
      return false;
    }

    case 'planetCrossesHouse': {
      const planetLon = chart.planetLongitudes?.get(trigger.planet);
      if (planetLon === undefined || !chart.houseCusps) {
        return false;
      }

      const currentHouse = getHouseForLongitude(planetLon, chart.houseCusps);
      const targetHouse = trigger.house as HouseNumber;

      if (currentHouse === null) {
        return false;
      }

      // Check if planet just crossed into target house
      // Key format: planet ID (string) -> house number
      const prevHouse = state.previousHousePositions?.get(String(trigger.planet));
      
      // Trigger when: previous house !== target house AND current house === target house
      if (currentHouse === targetHouse && prevHouse !== undefined && prevHouse !== targetHouse) {
        return true;
      }

      return false;
    }

    case 'planetCrossesAngle': {
      const planetLon = chart.planetLongitudes?.get(trigger.planet);
      const angleLon = chart.angleLongitudes?.get(trigger.angle);
      
      if (planetLon === undefined || angleLon === undefined) {
        return false;
      }

      // Check if planet is within a small orb of the angle (e.g., 1 degree)
      const orb = 1; // degrees
      const diff = Math.abs(normalizeDeg(planetLon - angleLon));
      const minDiff = Math.min(diff, 360 - diff);
      
      return minDiff <= orb;
    }

    case 'custom':
      // Custom triggers are handled by the application
      return false;

    default:
      return false;
  }
}

/**
 * Apply a rule's effect to the current frame
 */
function applyRule(
  rule: OrientationRule,
  frame: ViewFrame,
  locks: LockRule[],
  chart: ChartSnapshot,
  state: OrientationRuntimeState
): { frame: ViewFrame; extraLocks: LockRule[]; newState: OrientationRuntimeState } {
  const { effect } = rule;
  let newFrame = { ...frame };
  const extraLocks: LockRule[] = [];
  const newState: OrientationRuntimeState = {
    appliedRuleIds: new Set(state.appliedRuleIds),
    previousHousePositions: new Map(state.previousHousePositions),
  };

  // Mark rule as applied
  newState.appliedRuleIds.add(rule.id);

  // Update previous house positions
  if (!newState.previousHousePositions) {
    newState.previousHousePositions = new Map();
  }

  // Track current positions for next evaluation
  if (chart.houseCusps) {
    // Track ASC position (using "ASC" key for consistency)
    const ascLon = chart.angleLongitudes?.get('ASC');
    if (ascLon !== undefined) {
      const ascHouse = getHouseForLongitude(ascLon, chart.houseCusps);
      if (ascHouse !== null) {
        newState.previousHousePositions.set('ASC', ascHouse);
      }
    }

    // Track planet positions
    if (chart.planetLongitudes) {
      for (const [planetId, lon] of chart.planetLongitudes.entries()) {
        const house = getHouseForLongitude(lon, chart.houseCusps);
        if (house !== null) {
          newState.previousHousePositions.set(String(planetId), house);
        }
      }
    }
  }

  switch (effect.type) {
    case 'rotate': {
      const delta = effect.delta;
      
      // Apply rotation by adjusting screenZero
      if (newFrame.worldZero !== undefined && newFrame.screenZero !== undefined) {
        // New model: adjust screenZero
        newFrame.screenZero = normalizeDeg(newFrame.screenZero + delta);
      } else {
        // Legacy model: adjust screenAngleDeg
        newFrame.screenAngleDeg = normalizeDeg(newFrame.screenAngleDeg + delta);
      }
      break;
    }

    case 'setViewFrame': {
      newFrame = effect.viewFrame;
      break;
    }

    case 'mirror': {
      // Toggle direction between 1 and -1
      if (newFrame.worldZero !== undefined && newFrame.screenZero !== undefined) {
        // New model: toggle direction
        newFrame.direction = (newFrame.direction === -1 ? 1 : -1) as 1 | -1;
      } else {
        // Legacy model: toggle between 'cw' and 'ccw'
        newFrame.direction = newFrame.direction === 'cw' ? 'ccw' : 'cw';
      }
      break;
    }

    case 'snapHouseToAngle': {
      // Snap a house cusp to a specific screen angle
      const houseCusp = chart.houseCusps?.get(effect.house);
      if (houseCusp !== undefined) {
        // Use worldZero/screenZero model for direct mapping
        newFrame.worldZero = normalizeAngle(houseCusp);
        newFrame.screenZero = normalizeAngle(effect.screenAngle);
        // Preserve existing direction and scale if present
        if (newFrame.direction === undefined) {
          newFrame.direction = 1; // Default direction
        }
        if (newFrame.scale === undefined) {
          newFrame.scale = 1; // Default scale
        }
      }
      break;
    }

    case 'snapAnchorToAngle': {
      // Snap an angle (ASC, MC, etc.) to a specific screen angle
      const anchorLon = chart.angleLongitudes?.get(effect.anchor);
      if (anchorLon !== undefined) {
        // Use worldZero/screenZero model for direct mapping
        newFrame.worldZero = normalizeAngle(anchorLon);
        newFrame.screenZero = normalizeAngle(effect.screenAngle);
        // Preserve existing direction and scale if present
        if (newFrame.direction === undefined) {
          newFrame.direction = 1; // Default direction
        }
        if (newFrame.scale === undefined) {
          newFrame.scale = 1; // Default scale
        }
      }
      break;
    }
  }

  // Add rule-specific locks
  if (rule.locks) {
    extraLocks.push(...rule.locks);
  }

  return { frame: newFrame, extraLocks, newState };
}

/**
 * Evaluate an orientation program and return the resulting frame and locks
 */
export function evalOrientationProgram(
  program: OrientationProgram,
  chart: ChartSnapshot,
  previousState?: OrientationRuntimeState
): { frame: ViewFrame; locks: LockRule[]; state: OrientationRuntimeState } {
  const { baseFrame, locks = [], rules = [] } = program;
  
  let frame = baseFrame;
  let extraLocks: LockRule[] = [];
  let state: OrientationRuntimeState = previousState ?? {
    appliedRuleIds: new Set<string>(),
    previousHousePositions: new Map(),
  };

  // Ensure previousHousePositions map exists
  if (!state.previousHousePositions) {
    state.previousHousePositions = new Map();
  }

  // Evaluate each rule in order (using previous state to detect transitions)
  for (const rule of rules) {
    if (ruleTriggered(rule, chart, state)) {
      const result = applyRule(rule, frame, locks, chart, state);
      frame = result.frame;
      extraLocks.push(...result.extraLocks);
      state = result.newState;
    }
  }

  // Update state with current positions AFTER rule evaluation
  // This ensures next frame can compare against current positions
  if (chart.houseCusps && chart.angleLongitudes) {
    const ascLon = chart.angleLongitudes.get('ASC');
    if (ascLon !== undefined) {
      const ascHouse = getHouseForLongitude(ascLon, chart.houseCusps);
      if (ascHouse !== null) {
        // Store current ASC house as "ASC" key for easy lookup
        state.previousHousePositions.set('ASC', ascHouse);
      }
    }

    // Track current planet positions
    if (chart.planetLongitudes) {
      for (const [planetId, lon] of chart.planetLongitudes.entries()) {
        const house = getHouseForLongitude(lon, chart.houseCusps);
        if (house !== null) {
          state.previousHousePositions.set(String(planetId), house);
        }
      }
    }
  }

  return {
    frame,
    locks: locks.concat(extraLocks),
    state,
  };
}

