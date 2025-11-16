import { getRingRadius, getRingRadii, getRingCenterRadius } from './rings';
import { VisualConfig } from '../types';

describe('rings', () => {
  const defaultConfig: VisualConfig = {
    ringWidth: 30,
    ringSpacing: 10,
  };

  describe('getRingRadius', () => {
    it('should calculate radius for first ring', () => {
      expect(getRingRadius(0, defaultConfig)).toBe(0);
      expect(getRingRadius(0, defaultConfig, 100)).toBe(100);
    });

    it('should calculate radius for subsequent rings', () => {
      // Ring 0: 0
      // Ring 1: 0 + 30 + 10 = 40
      expect(getRingRadius(1, defaultConfig)).toBe(40);
      // Ring 2: 40 + 30 + 10 = 80
      expect(getRingRadius(2, defaultConfig)).toBe(80);
    });
  });

  describe('getRingRadii', () => {
    it('should calculate inner and outer radii', () => {
      const { innerRadius, outerRadius } = getRingRadii(0, defaultConfig);
      expect(innerRadius).toBe(0);
      expect(outerRadius).toBe(30);

      const { innerRadius: ir2, outerRadius: or2 } = getRingRadii(
        1,
        defaultConfig
      );
      expect(ir2).toBe(40);
      expect(or2).toBe(70);
    });
  });

  describe('getRingCenterRadius', () => {
    it('should calculate center radius', () => {
      const center = getRingCenterRadius(0, defaultConfig);
      expect(center).toBe(15); // (0 + 30) / 2

      const center2 = getRingCenterRadius(1, defaultConfig);
      expect(center2).toBe(55); // (40 + 70) / 2
    });
  });
});

