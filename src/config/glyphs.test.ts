import { mergeGlyphConfig, defaultGlyphConfig } from './glyphs';
import { GlyphConfig } from '../types';

describe('glyph config', () => {
  describe('defaultGlyphConfig', () => {
    it('should have default values', () => {
      expect(defaultGlyphConfig.glyphSize).toBe(12);
      expect(defaultGlyphConfig.glyphFont).toBe('Arial');
      expect(defaultGlyphConfig.signGlyphs).toBeDefined();
      expect(defaultGlyphConfig.planetGlyphs).toBeDefined();
      expect(defaultGlyphConfig.aspectGlyphs).toBeDefined();
    });

    it('should have glyphs for all 12 signs', () => {
      expect(Object.keys(defaultGlyphConfig.signGlyphs || {})).toHaveLength(12);
    });
  });

  describe('mergeGlyphConfig', () => {
    it('should return default config when no config provided', () => {
      const merged = mergeGlyphConfig();
      expect(merged).toEqual(defaultGlyphConfig);
    });

    it('should merge provided config with defaults', () => {
      const customConfig: Partial<GlyphConfig> = {
        glyphSize: 16,
        glyphFont: 'Times New Roman',
      };
      const merged = mergeGlyphConfig(customConfig);
      expect(merged.glyphSize).toBe(16);
      expect(merged.glyphFont).toBe('Times New Roman');
      expect(merged.signGlyphs).toEqual(defaultGlyphConfig.signGlyphs);
    });

    it('should deep merge glyph objects', () => {
      const customConfig: Partial<GlyphConfig> = {
        signGlyphs: {
          0: 'A',
        } as Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11, string>>,
      };
      const merged = mergeGlyphConfig(customConfig);
      expect(merged.signGlyphs?.[0]).toBe('A');
      expect(merged.signGlyphs?.[1]).toBe(defaultGlyphConfig.signGlyphs?.[1]);
    });
  });
});

