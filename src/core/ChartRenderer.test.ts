import { ChartRenderer } from './ChartRenderer';
import { RenderData, Indexes, ChartOptions } from '../types';
import { Selection } from 'd3-selection';

// Mock D3 selection
function createMockSelection(): Selection<SVGGElement, unknown, null, undefined> {
  const selection = {
    append: jest.fn().mockReturnThis(),
    attr: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    selectAll: jest.fn().mockReturnValue({
      remove: jest.fn(),
    }),
  } as any;
  return selection;
}

describe('ChartRenderer', () => {
  let renderer: ChartRenderer;
  let mockContainer: Selection<SVGGElement, unknown, null, undefined>;

  beforeEach(() => {
    mockContainer = createMockSelection();
    renderer = new ChartRenderer(mockContainer);
  });

  describe('constructor', () => {
    it('should create a ChartRenderer with a container', () => {
      expect(renderer).toBeInstanceOf(ChartRenderer);
    });
  });

  describe('clear', () => {
    it('should clear the container', () => {
      renderer.clear();
      expect(mockContainer.selectAll).toHaveBeenCalledWith('*');
    });
  });

  describe('render', () => {
    const mockRenderData: RenderData = {
      signs: [
        { sign: 0, degree: 0 },
        { sign: 1, degree: 30 },
      ],
      houses: [
        { house: 0, cuspDegree: 0 },
        { house: 1, cuspDegree: 30 },
      ],
      planets: [
        { planet: 0, sign: 0, degree: 15 },
        { planet: 1, sign: 1, degree: 45 },
      ],
      aspects: [
        { planet1: 0, planet2: 1, aspect: 'conjunction', orb: 5 },
      ],
    };

    const mockIndexes: Indexes = {
      signs: [0, 1],
      houses: [0, 1],
      planets: [0, 1],
    };

    const mockOptions: ChartOptions = {
      centerX: 400,
      centerY: 400,
      rotationOffset: 0,
    };

    it('should render a complete chart', () => {
      renderer.render(mockRenderData, mockIndexes, mockOptions);
      // Verify that the container methods were called
      expect(mockContainer.append).toHaveBeenCalled();
      expect(mockContainer.attr).toHaveBeenCalled();
    });

    it('should create a layer group when layerId is provided', () => {
      const optionsWithLayer: ChartOptions = {
        ...mockOptions,
        layerId: 'natal',
      };
      renderer.render(mockRenderData, mockIndexes, optionsWithLayer);
      expect(mockContainer.select).toHaveBeenCalledWith('g.layer-natal');
      expect(mockContainer.append).toHaveBeenCalled();
    });
  });

  describe('renderRing', () => {
    const mockRenderData: RenderData = {
      signs: [{ sign: 0, degree: 0 }],
    };
    const mockIndexes: Indexes = {
      signs: [0],
    };
    const mockOptions: ChartOptions = {
      centerX: 400,
      centerY: 400,
      rotationOffset: 0,
    };

    it('should render a signs ring', () => {
      renderer.renderRing('signs', mockRenderData, mockIndexes, mockOptions);
      expect(mockContainer.append).toHaveBeenCalled();
    });

    it('should handle unknown ring types', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      renderer.renderRing('outer' as any, mockRenderData, mockIndexes, mockOptions);
      expect(consoleSpy).toHaveBeenCalledWith('Unknown ring type: outer');
      consoleSpy.mockRestore();
    });
  });
});

