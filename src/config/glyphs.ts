import { GlyphConfig } from '../types/index.js';

export const defaultGlyphConfig: GlyphConfig = {
  signGlyphs: {
    0: '♈', // Aries
    1: '♉', // Taurus
    2: '♊', // Gemini
    3: '♋', // Cancer
    4: '♌', // Leo
    5: '♍', // Virgo
    6: '♎', // Libra
    7: '♏', // Scorpio
    8: '♐', // Sagittarius
    9: '♑', // Capricorn
    10: '♒', // Aquarius
    11: '♓', // Pisces
  },
  planetGlyphs: {
    0: '☉', // Sun
    1: '☽', // Moon
    2: '☿', // Mercury
    3: '♀', // Venus
    4: '♂', // Mars
    5: '♃', // Jupiter
    6: '♄', // Saturn
    7: '♅', // Uranus
    8: '♆', // Neptune
    9: '♇', // Pluto
  },
  aspectGlyphs: {
    conjunction: '☌',
    opposition: '☍',
    trine: '△',
    square: '□',
    sextile: '⚹',
    semisextile: '⚺',
    semisquare: '∠',
    sesquiquadrate: '⚻',
    quincunx: '⚼',
  },
  glyphSize: 12,
  glyphFont: 'Arial',
};

export function mergeGlyphConfig(config?: Partial<GlyphConfig>): GlyphConfig {
  return {
    ...defaultGlyphConfig,
    ...config,
    signGlyphs: {
      ...defaultGlyphConfig.signGlyphs,
      ...config?.signGlyphs,
    },
    planetGlyphs: {
      ...defaultGlyphConfig.planetGlyphs,
      ...config?.planetGlyphs,
    },
    aspectGlyphs: {
      ...defaultGlyphConfig.aspectGlyphs,
      ...config?.aspectGlyphs,
    },
  };
}

