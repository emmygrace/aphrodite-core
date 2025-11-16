import { VisualConfig } from '../types/index.js';

export const defaultVisualConfig: VisualConfig = {
  ringWidth: 30,
  ringSpacing: 10,
  signColors: [
    '#FF6B6B', // Aries
    '#FFA07A', // Taurus
    '#FFD700', // Gemini
    '#98D8C8', // Cancer
    '#FF6347', // Leo
    '#F0E68C', // Virgo
    '#87CEEB', // Libra
    '#9370DB', // Scorpio
    '#FFA500', // Sagittarius
    '#2F4F4F', // Capricorn
    '#00CED1', // Aquarius
    '#FF69B4', // Pisces
  ],
  houseColors: [
    '#E8E8E8',
    '#D3D3D3',
    '#C0C0C0',
    '#A9A9A9',
    '#808080',
    '#696969',
    '#E8E8E8',
    '#D3D3D3',
    '#C0C0C0',
    '#A9A9A9',
    '#808080',
    '#696969',
  ],
  planetColors: [
    '#FFD700', // Sun
    '#C0C0C0', // Moon
    '#FF6347', // Mercury
    '#FFA500', // Venus
    '#FF4500', // Mars
    '#FFD700', // Jupiter
    '#9370DB', // Saturn
    '#00CED1', // Uranus
    '#4169E1', // Neptune
    '#8B4513', // Pluto
  ],
  aspectColors: {
    conjunction: '#FF0000',
    opposition: '#0000FF',
    trine: '#00FF00',
    square: '#FF0000',
    sextile: '#FFFF00',
    semisextile: '#FFA500',
    semisquare: '#FF6347',
    sesquiquadrate: '#FF6347',
    quincunx: '#9370DB',
  },
  aspectStrokeWidth: 2,
  backgroundColor: '#FFFFFF',
  strokeColor: '#000000',
  strokeWidth: 1,
};

export function mergeVisualConfig(
  config?: Partial<VisualConfig>
): VisualConfig {
  return {
    ...defaultVisualConfig,
    ...config,
    aspectColors: {
      ...defaultVisualConfig.aspectColors,
      ...config?.aspectColors,
    },
  };
}

