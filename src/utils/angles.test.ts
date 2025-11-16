import {
  degToRad,
  radToDeg,
  normalizeAngle,
  astroToSvgAngle,
  polarToCartesian,
} from './angles';

describe('angles', () => {
  describe('degToRad', () => {
    it('should convert degrees to radians', () => {
      expect(degToRad(0)).toBe(0);
      expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
      expect(degToRad(180)).toBeCloseTo(Math.PI);
      expect(degToRad(360)).toBeCloseTo(2 * Math.PI);
    });
  });

  describe('radToDeg', () => {
    it('should convert radians to degrees', () => {
      expect(radToDeg(0)).toBe(0);
      expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
      expect(radToDeg(Math.PI)).toBeCloseTo(180);
      expect(radToDeg(2 * Math.PI)).toBeCloseTo(360);
    });
  });

  describe('normalizeAngle', () => {
    it('should normalize angles to 0-360 range', () => {
      expect(normalizeAngle(0)).toBe(0);
      expect(normalizeAngle(360)).toBe(0);
      expect(normalizeAngle(90)).toBe(90);
      expect(normalizeAngle(-90)).toBe(270);
      expect(normalizeAngle(450)).toBe(90);
    });
  });

  describe('astroToSvgAngle', () => {
    it('should convert astrology angle to SVG angle', () => {
      // 0° in astrology (left) should become 180° in SVG (left)
      expect(astroToSvgAngle(0, 0)).toBe(180);
      // 90° in astrology (top) should become 90° in SVG (top)
      expect(astroToSvgAngle(90, 0)).toBe(90);
      // 180° in astrology (right) should become 0° in SVG (right)
      expect(astroToSvgAngle(180, 0)).toBe(0);
      // 270° in astrology (bottom) should become 270° in SVG (bottom)
      expect(astroToSvgAngle(270, 0)).toBe(270);
    });

    it('should apply rotation offset', () => {
      expect(astroToSvgAngle(0, 90)).toBe(270);
      expect(astroToSvgAngle(90, 90)).toBe(0);
    });
  });

  describe('polarToCartesian', () => {
    it('should convert polar coordinates to Cartesian', () => {
      const { x, y } = polarToCartesian(0, 100);
      expect(x).toBeCloseTo(100);
      expect(y).toBeCloseTo(0);

      const { x: x2, y: y2 } = polarToCartesian(90, 100);
      expect(x2).toBeCloseTo(0);
      expect(y2).toBeCloseTo(100);

      const { x: x3, y: y3 } = polarToCartesian(180, 100);
      expect(x3).toBeCloseTo(-100);
      expect(y3).toBeCloseTo(0);
    });

    it('should apply center offset', () => {
      const { x, y } = polarToCartesian(0, 100, 50, 50);
      expect(x).toBeCloseTo(150);
      expect(y).toBeCloseTo(50);
    });
  });
});

