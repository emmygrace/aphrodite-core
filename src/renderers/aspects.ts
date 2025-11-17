import { D3Selection, AspectData, PlanetData, VisualConfig, GlyphConfig, ChartOptions } from '../types/index.js';
import { longitudeToScreenAngle, polarToCartesian } from '../utils/angles.js';
import { getRingCenterRadius } from '../utils/rings.js';
import { type ChartDataForOrientation } from '../utils/viewFrame.js';

interface RenderOptions extends ChartOptions {
  visualConfig: VisualConfig;
  glyphConfig: GlyphConfig;
  chartData?: ChartDataForOrientation;
}

export function renderAspectsRing(
  container: D3Selection,
  aspects: AspectData[],
  options: RenderOptions,
  planets?: PlanetData[]
): void {
  const { visualConfig, glyphConfig } = options;
  const ringIndex = 2; // Aspects use the same ring as planets
  const centerRadius = getRingCenterRadius(ringIndex, visualConfig);

  // Create a group for aspects
  const aspectsGroup = container.append('g').attr('class', 'aspects-ring');

  if (!planets || planets.length === 0) {
    return; // Can't draw aspects without planet positions
  }

  // Create a map of planet index to position
  const planetPositions = new Map<number, { x: number; y: number }>();
  planets.forEach((planet) => {
    const angle = longitudeToScreenAngle(planet.degree, {
      rotationOffset: options.rotationOffset,
      viewFrame: options.viewFrame,
      chartData: options.chartData,
    });
    const pos = polarToCartesian(angle, centerRadius);
    planetPositions.set(planet.planet, pos);
  });

  aspects.forEach((aspect) => {
    const planet1Pos = planetPositions.get(aspect.planet1);
    const planet2Pos = planetPositions.get(aspect.planet2);

    if (!planet1Pos || !planet2Pos) {
      return; // Skip if we don't have positions for both planets
    }

    // Get aspect color
    const aspectColor =
      visualConfig.aspectColors?.[aspect.aspect] ?? visualConfig.strokeColor ?? '#000000';
    const strokeWidth = visualConfig.aspectStrokeWidth ?? 2;

    // Draw aspect line
    aspectsGroup
      .append('line')
      .attr('x1', planet1Pos.x)
      .attr('y1', planet1Pos.y)
      .attr('x2', planet2Pos.x)
      .attr('y2', planet2Pos.y)
      .attr('stroke', aspectColor)
      .attr('stroke-width', strokeWidth)
      .attr('opacity', 0.6)
      .attr('class', `aspect-line aspect-${aspect.aspect}`);

    // Draw aspect glyph at midpoint if available
    if (glyphConfig.aspectGlyphs?.[aspect.aspect]) {
      const midX = (planet1Pos.x + planet2Pos.x) / 2;
      const midY = (planet1Pos.y + planet2Pos.y) / 2;
      aspectsGroup
        .append('text')
        .attr('x', midX)
        .attr('y', midY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', (glyphConfig.glyphSize ?? 12) * 0.8)
        .attr('font-family', glyphConfig.glyphFont ?? 'Arial')
        .attr('fill', aspectColor)
        .attr('opacity', 0.8)
        .attr('class', `aspect aspect-${aspect.aspect}`)
        .text(glyphConfig.aspectGlyphs[aspect.aspect]);
    }
  });
}

/**
 * Helper function to render aspect lines between two planets
 * This should be called with actual planet positions
 */
export function renderAspectLine(
  container: D3Selection,
  planet1Pos: { x: number; y: number },
  planet2Pos: { x: number; y: number },
  aspect: AspectData,
  visualConfig: VisualConfig
): void {
  const aspectColor =
    visualConfig.aspectColors?.[aspect.aspect] ?? visualConfig.strokeColor ?? '#000000';
  const strokeWidth = visualConfig.aspectStrokeWidth ?? 2;

  container
    .append('line')
    .attr('x1', planet1Pos.x)
    .attr('y1', planet1Pos.y)
    .attr('x2', planet2Pos.x)
    .attr('y2', planet2Pos.y)
    .attr('stroke', aspectColor)
    .attr('stroke-width', strokeWidth)
    .attr('opacity', 0.6)
    .attr('class', `aspect-line aspect-${aspect.aspect}`);
}

