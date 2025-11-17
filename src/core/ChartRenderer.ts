import {
  RenderData,
  Indexes,
  ChartOptions,
  RingType,
  D3Selection,
  VisualConfig,
  GlyphConfig,
} from '../types/index.js';
import { mergeVisualConfig } from '../config/visual.js';
import { mergeGlyphConfig } from '../config/glyphs.js';
import { renderSignsRing } from '../renderers/signs.js';
import { renderHousesRing } from '../renderers/houses.js';
import { renderPlanetsRing } from '../renderers/planets.js';
import { renderAspectsRing } from '../renderers/aspects.js';
import { buildChartDataFromRenderData } from '../utils/viewFrame.js';

interface RenderOptions extends Omit<ChartOptions, 'visualConfig' | 'glyphConfig'> {
  visualConfig: VisualConfig;
  glyphConfig: GlyphConfig;
}

export class ChartRenderer {
  private container: D3Selection;

  constructor(container: D3Selection) {
    this.container = container;
  }

  /**
   * Render a complete chart
   */
  render(
    renderData: RenderData,
    indexes: Indexes,
    options: ChartOptions
  ): void {
    // Build chart data for orientation if ViewFrame is used
    const chartData = options.viewFrame
      ? buildChartDataFromRenderData(renderData)
      : undefined;

    // Merge configs are done in renderRing

    // Create a layer group if layerId is specified
    let layerGroup = this.container;
    if (options.layerId) {
      // Remove existing layer if it exists
      this.container.select(`g.layer-${options.layerId}`).remove();
      layerGroup = this.container
        .append('g')
        .attr('class', `layer-${options.layerId}`);
    }

    // Apply transform for center and rotation
    layerGroup.attr(
      'transform',
      `translate(${options.centerX}, ${options.centerY})`
    );

    // Render each ring type
    if (renderData.signs && indexes.signs) {
      this.renderRing('signs', renderData, indexes, options, chartData);
    }
    if (renderData.houses && indexes.houses) {
      this.renderRing('houses', renderData, indexes, options, chartData);
    }
    if (renderData.planets && indexes.planets) {
      this.renderRing('planets', renderData, indexes, options, chartData);
    }
    if (renderData.aspects && renderData.planets) {
      this.renderRing('aspects', renderData, indexes, options, chartData);
    }
  }

  /**
   * Render a single ring
   */
  renderRing(
    ring: RingType,
    renderData: RenderData,
    indexes: Indexes,
    options: ChartOptions,
    chartData?: ReturnType<typeof buildChartDataFromRenderData>
  ): void {
    const visualConfig = mergeVisualConfig(options.visualConfig);
    const glyphConfig = mergeGlyphConfig(options.glyphConfig);

    // Get the layer group
    let layerGroup = this.container;
    if (options.layerId) {
      layerGroup = this.container.select(`g.layer-${options.layerId}`);
    }

    // Apply transform if not already applied
    if (!options.layerId) {
      layerGroup.attr(
        'transform',
        `translate(${options.centerX}, ${options.centerY})`
      );
    }

    const renderOptions: RenderOptions = {
      ...options,
      visualConfig,
      glyphConfig,
      chartData,
    };

    switch (ring) {
      case 'signs':
        if (renderData.signs && indexes.signs) {
          renderSignsRing(layerGroup, renderData.signs, indexes.signs, renderOptions);
        }
        break;
      case 'houses':
        if (renderData.houses && indexes.houses) {
          renderHousesRing(layerGroup, renderData.houses, indexes.houses, renderOptions);
        }
        break;
      case 'planets':
        if (renderData.planets && indexes.planets) {
          renderPlanetsRing(layerGroup, renderData.planets, indexes.planets, renderOptions);
        }
        break;
      case 'aspects':
        if (renderData.aspects) {
          renderAspectsRing(
            layerGroup,
            renderData.aspects,
            renderOptions,
            renderData.planets
          );
        }
        break;
      default:
        console.warn(`Unknown ring type: ${ring}`);
    }
  }

  /**
   * Clear the container
   */
  clear(): void {
    this.container.selectAll('*').remove();
  }
}

