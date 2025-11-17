// d3 is expected to be available as a global variable (loaded from CDN)
declare const d3: any;
import { D3Selection, HouseData, HouseIndex, VisualConfig, GlyphConfig, ChartOptions } from '../types/index.js';
import { longitudeToScreenAngle, polarToCartesian } from '../utils/angles.js';
import { getRingRadii, getRingCenterRadius } from '../utils/rings.js';
import { type ChartDataForOrientation } from '../utils/viewFrame.js';

interface RenderOptions extends ChartOptions {
  visualConfig: VisualConfig;
  glyphConfig: GlyphConfig;
  chartData?: ChartDataForOrientation;
}

export function renderHousesRing(
  container: D3Selection,
  houses: HouseData[],
  indexes: HouseIndex[],
  options: RenderOptions
): void {
  const { visualConfig, glyphConfig } = options;
  const ringIndex = 1; // Houses are typically the second ring
  const { innerRadius, outerRadius } = getRingRadii(ringIndex, visualConfig);
  const centerRadius = getRingCenterRadius(ringIndex, visualConfig);

  // Create a group for houses
  const housesGroup = container.append('g').attr('class', 'houses-ring');

  // Render each house segment
  houses.forEach((houseData, idx) => {
    const houseIndex = indexes[idx] ?? (houseData.house as HouseIndex);
    const startDegree = houseData.cuspDegree;
    
    // Calculate end degree (next house cusp or 30 degrees if not available)
    let endDegree: number;
    if (idx < houses.length - 1) {
      endDegree = houses[idx + 1].cuspDegree;
    } else {
      endDegree = (houses[0].cuspDegree + 360) % 360;
    }
    // Handle wrap-around
    if (endDegree < startDegree) {
      endDegree += 360;
    }

    const startAngle = longitudeToScreenAngle(startDegree, {
      rotationOffset: options.rotationOffset,
      viewFrame: options.viewFrame,
      chartData: options.chartData,
    });
    const endAngle = longitudeToScreenAngle(endDegree, {
      rotationOffset: options.rotationOffset,
      viewFrame: options.viewFrame,
      chartData: options.chartData,
    });

    // Create arc path
    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle((startAngle * Math.PI) / 180)
      .endAngle((endAngle * Math.PI) / 180);

    // Get color for this house
    const color =
      visualConfig.houseColors?.[houseIndex] ?? visualConfig.strokeColor ?? '#000000';

    // Draw house segment
    housesGroup
      .append('path')
      .attr('d', arc as any)
      .attr('fill', color)
      .attr('stroke', visualConfig.strokeColor ?? '#000000')
      .attr('stroke-width', visualConfig.strokeWidth ?? 1)
      .attr('class', `house house-${houseIndex}`);

    // Add house number at center of segment
    const midAngle = (startAngle + endAngle) / 2;
    const { x, y } = polarToCartesian(midAngle, centerRadius);
    housesGroup
      .append('text')
      .attr('x', x)
      .attr('y', y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', (glyphConfig.glyphSize ?? 12) * 0.8)
      .attr('font-family', glyphConfig.glyphFont ?? 'Arial')
      .attr('fill', visualConfig.strokeColor ?? '#000000')
      .text((houseIndex + 1).toString());
  });
}

