import { D3Selection, PlanetData, PlanetIndex, VisualConfig, GlyphConfig } from '../types/index.js';
import { astroToSvgAngle, polarToCartesian } from '../utils/angles.js';
import { getRingCenterRadius } from '../utils/rings.js';

interface RenderOptions {
  visualConfig: VisualConfig;
  glyphConfig: GlyphConfig;
  rotationOffset: number;
  centerX: number;
  centerY: number;
}

export function renderPlanetsRing(
  container: D3Selection,
  planets: PlanetData[],
  indexes: PlanetIndex[],
  options: RenderOptions
): void {
  const { visualConfig, glyphConfig, rotationOffset = 0 } = options;
  const ringIndex = 2; // Planets are typically the third ring
  const centerRadius = getRingCenterRadius(ringIndex, visualConfig);

  // Create a group for planets
  const planetsGroup = container.append('g').attr('class', 'planets-ring');

  // Render each planet
  planets.forEach((planetData, idx) => {
    const planetIndex = indexes[idx] ?? planetData.planet;
    const angle = astroToSvgAngle(planetData.degree, rotationOffset);
    const { x, y } = polarToCartesian(angle, centerRadius);

    // Get color for this planet
    const color =
      visualConfig.planetColors?.[planetIndex] ?? visualConfig.strokeColor ?? '#000000';

    // Draw planet glyph
    if (glyphConfig.planetGlyphs?.[planetIndex]) {
      planetsGroup
        .append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', glyphConfig.glyphSize ?? 12)
        .attr('font-family', glyphConfig.glyphFont ?? 'Arial')
        .attr('fill', color)
        .attr('class', `planet planet-${planetIndex}`)
        .text(glyphConfig.planetGlyphs[planetIndex]);
    } else {
      // Fallback: draw a circle if no glyph
      planetsGroup
        .append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', (glyphConfig.glyphSize ?? 12) / 2)
        .attr('fill', color)
        .attr('stroke', visualConfig.strokeColor ?? '#000000')
        .attr('stroke-width', visualConfig.strokeWidth ?? 1)
        .attr('class', `planet planet-${planetIndex}`);
    }
  });
}

