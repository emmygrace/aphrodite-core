import type { ViewFrame } from '@gaia-tools/aphrodite-shared/orientation';
import type { ChartDataForOrientation } from './viewFrame.js';
import { convertToScreenAngle } from './viewFrame.js';

/**
 * Converts degrees to radians
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts radians to degrees
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Normalizes an angle to 0-360 degrees
 */
export function normalizeAngle(degrees: number): number {
  let normalized = degrees % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
}

/**
 * Converts an astrological degree (0-360) to an angle for SVG rendering
 * SVG uses 0 degrees at 3 o'clock (right), increasing clockwise
 * Astrology uses 0 degrees at 9 o'clock (left), increasing counterclockwise
 * This function also applies a rotation offset
 */
export function astroToSvgAngle(
  astroDegrees: number,
  rotationOffset: number = 0
): number {
  // Convert astrology angle (0° = left, counterclockwise) to SVG angle (0° = right, clockwise)
  // First, flip horizontally: 0° becomes 180°, then invert direction
  let svgAngle = 180 - astroDegrees;
  // Apply rotation offset
  svgAngle += rotationOffset;
  // Normalize to 0-360
  return normalizeAngle(svgAngle);
}

/**
 * Calculates the start and end angles for a sign/house segment
 */
export function getSegmentAngles(
  startDegree: number,
  endDegree: number,
  rotationOffset: number = 0
): { startAngle: number; endAngle: number } {
  const startAngle = astroToSvgAngle(startDegree, rotationOffset);
  const endAngle = astroToSvgAngle(endDegree, rotationOffset);
  return { startAngle, endAngle };
}

/**
 * Converts polar coordinates (angle in degrees, radius) to Cartesian (x, y)
 */
export function polarToCartesian(
  angleDegrees: number,
  radius: number,
  centerX: number = 0,
  centerY: number = 0
): { x: number; y: number } {
  const angleRad = degToRad(angleDegrees);
  const x = centerX + radius * Math.cos(angleRad);
  const y = centerY + radius * Math.sin(angleRad);
  return { x, y };
}

/**
 * Unified function to convert astrological longitude to SVG screen angle.
 * Supports both legacy rotationOffset and new ViewFrame system.
 */
export function longitudeToScreenAngle(
  longitude: number,
  options: {
    rotationOffset?: number;
    viewFrame?: ViewFrame;
    chartData?: ChartDataForOrientation;
  }
): number {
  // Use ViewFrame if provided
  if (options.viewFrame && options.chartData) {
    return convertToScreenAngle(longitude, options.viewFrame, options.chartData);
  }

  // Fallback to legacy rotationOffset
  return astroToSvgAngle(longitude, options.rotationOffset ?? 0);
}

