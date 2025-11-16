import { mergeVisualConfig, defaultVisualConfig } from './visual';
import { VisualConfig } from '../types';

describe('visual config', () => {
  describe('defaultVisualConfig', () => {
    it('should have default values', () => {
      expect(defaultVisualConfig.ringWidth).toBe(30);
      expect(defaultVisualConfig.ringSpacing).toBe(10);
      expect(defaultVisualConfig.signColors).toHaveLength(12);
      expect(defaultVisualConfig.houseColors).toHaveLength(12);
      expect(defaultVisualConfig.planetColors).toHaveLength(10);
      expect(defaultVisualConfig.aspectColors).toBeDefined();
    });
  });

  describe('mergeVisualConfig', () => {
    it('should return default config when no config provided', () => {
      const merged = mergeVisualConfig();
      expect(merged).toEqual(defaultVisualConfig);
    });

    it('should merge provided config with defaults', () => {
      const customConfig: Partial<VisualConfig> = {
        ringWidth: 50,
        backgroundColor: '#000000',
      };
      const merged = mergeVisualConfig(customConfig);
      expect(merged.ringWidth).toBe(50);
      expect(merged.backgroundColor).toBe('#000000');
      expect(merged.ringSpacing).toBe(defaultVisualConfig.ringSpacing);
    });

    it('should deep merge aspectColors', () => {
      const customConfig: Partial<VisualConfig> = {
        aspectColors: {
          conjunction: '#FF00FF',
        },
      };
      const merged = mergeVisualConfig(customConfig);
      expect(merged.aspectColors?.conjunction).toBe('#FF00FF');
      expect(merged.aspectColors?.opposition).toBe(
        defaultVisualConfig.aspectColors?.opposition
      );
    });
  });
});

