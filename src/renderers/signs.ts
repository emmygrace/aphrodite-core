// d3 is expected to be available as a global variable (loaded from CDN)
declare const d3: any;
import { D3Selection, SignData, SignIndex, VisualConfig, GlyphConfig } from '../types/index.js';
import { astroToSvgAngle, polarToCartesian } from '../utils/angles.js';
import { getRingRadii, getRingCenterRadius } from '../utils/rings.js';

interface RenderOptions {
  visualConfig: VisualConfig;
  glyphConfig: GlyphConfig;
  rotationOffset: number;
  centerX: number;
  centerY: number;
}

export function renderSignsRing(
  container: D3Selection,
  signs: SignData[],
  indexes: SignIndex[],
  options: RenderOptions
): void {
  const { visualConfig, glyphConfig, rotationOffset = 0 } = options;
  const ringIndex = 0; // Signs are typically the outermost or first ring
  const { innerRadius, outerRadius } = getRingRadii(ringIndex, visualConfig);
  const centerRadius = getRingCenterRadius(ringIndex, visualConfig);

  // Create a group for signs
  const signsGroup = container.append('g').attr('class', 'signs-ring');

  // Render each sign segment
  signs.forEach((signData, idx) => {
    const signIndex = indexes[idx] ?? (signData.sign as SignIndex);
    const startDegree = signData.degree;
    const endDegree = (startDegree + 30) % 360; // Each sign is 30 degrees

    const startAngle = astroToSvgAngle(startDegree, rotationOffset);
    const endAngle = astroToSvgAngle(endDegree, rotationOffset);

    // Create arc path
    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle((startAngle * Math.PI) / 180)
      .endAngle((endAngle * Math.PI) / 180);

    // Get color for this sign
    const color =
      visualConfig.signColors?.[signIndex] ?? visualConfig.strokeColor ?? '#000000';

    // Draw sign segment
    signsGroup
      .append('path')
      .attr('d', arc as any)
      .attr('fill', color)
      .attr('stroke', visualConfig.strokeColor ?? '#000000')
      .attr('stroke-width', visualConfig.strokeWidth ?? 1)
      .attr('class', `sign sign-${signIndex}`);

    // Add glyph at center of segment
    if (glyphConfig.signGlyphs?.[signIndex]) {
      const midAngle = (startAngle + endAngle) / 2;
      const { x, y } = polarToCartesian(midAngle, centerRadius);
      signsGroup
        .append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', glyphConfig.glyphSize ?? 12)
        .attr('font-family', glyphConfig.glyphFont ?? 'Arial')
        .attr('fill', visualConfig.strokeColor ?? '#000000')
        .text(glyphConfig.signGlyphs[signIndex]);
    }
  });
}

