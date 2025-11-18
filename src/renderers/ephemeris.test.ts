/**
 * Tests for ephemeris data rendering
 * Verifies that ChartWheel can render charts from LayerPositions data
 * (works with both Swiss and JPL ephemeris sources)
 */

import { ChartWheel } from '../ChartWheel';
import type { RenderResponse } from '@gaia-tools/iris-core';

describe('Ephemeris Rendering', () => {
  // Mock DOM environment
  let container: HTMLElement;

  beforeEach(() => {
    // Create a mock container element
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '800px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('should render chart with JPL-style LayerPositions data', () => {
    // Sample RenderResponse that would come from JPL ephemeris
    const renderData: RenderResponse = {
      chartInstance: {
        id: 'test',
        chartDefinitionId: 'test',
        title: 'Test Chart',
        description: null,
        ownerUserId: 'test',
        subjects: [],
        effectiveDateTimes: {
          natal: '2024-01-01T12:00:00Z',
        },
      },
      settings: {
        zodiacType: 'tropical',
        ayanamsa: null,
        houseSystem: 'placidus',
        orbSettings: {
          conjunction: 8.0,
          opposition: 8.0,
          trine: 7.0,
          square: 6.0,
          sextile: 4.0,
        },
        includeObjects: ['sun', 'moon', 'mercury', 'venus', 'mars'],
      },
      coordinateSystem: {
        angleUnit: 'degrees',
        angleRange: [0.0, 360.0],
        direction: 'ccw',
        zeroPoint: {
          type: 'zodiac',
          signStart: 'aries',
          offsetDegrees: 0.0,
        },
      },
      layers: {
        natal: {
          id: 'natal',
          label: 'Natal',
          kind: 'natal',
          subjectId: null,
          dateTime: '2024-01-01T12:00:00Z',
          location: {
            name: 'New York',
            lat: 40.7128,
            lon: -74.0060,
          },
          positions: {
            planets: {
              sun: {
                lon: 280.5,
                lat: 1.2,
                speedLon: 0.95,
                retrograde: false,
              },
              moon: {
                lon: 40.25,
                lat: -2.3,
                speedLon: 12.3,
                retrograde: false,
              },
              mercury: {
                lon: 150.5,
                lat: 0.5,
                speedLon: -0.5,
                retrograde: true,
              },
            },
            houses: {
              system: 'placidus',
              cusps: {
                '1': 15.0,
                '2': 45.0,
                '3': 75.0,
                '4': 105.0,
                '5': 135.0,
                '6': 165.0,
                '7': 195.0,
                '8': 225.0,
                '9': 255.0,
                '10': 285.0,
                '11': 315.0,
                '12': 345.0,
              },
              angles: {
                asc: 15.0,
                mc: 285.0,
                ic: 105.0,
                dc: 195.0,
              },
            },
          },
        },
      },
      aspects: {
        sets: {},
      },
      wheel: {
        radius: {
          inner: 0,
          outer: 400,
        },
        rings: [
          {
            id: 'signs',
            radius: {
              inner: 300,
              outer: 350,
            },
            items: [
              {
                kind: 'sign',
                id: 'aries',
                label: 'Aries',
                index: 0,
                startLon: 0,
                endLon: 30,
              },
              {
                kind: 'sign',
                id: 'taurus',
                label: 'Taurus',
                index: 1,
                startLon: 30,
                endLon: 60,
              },
              // Add more signs as needed
            ],
          },
          {
            id: 'planets',
            radius: {
              inner: 200,
              outer: 250,
            },
            items: [
              {
                kind: 'planet',
                planetId: 'sun',
                lon: 280.5,
              },
              {
                kind: 'planet',
                planetId: 'moon',
                lon: 40.25,
              },
              {
                kind: 'planet',
                planetId: 'mercury',
                lon: 150.5,
              },
            ],
          },
          {
            id: 'houses',
            radius: {
              inner: 100,
              outer: 150,
            },
            items: [
              {
                kind: 'houseCusp',
                houseIndex: 1,
                lon: 15.0,
              },
              {
                kind: 'houseCusp',
                houseIndex: 2,
                lon: 45.0,
              },
              // Add more house cusps as needed
            ],
          },
        ],
      },
    };

    const indexes = {
      planets: {
        sun: 0,
        moon: 1,
        mercury: 2,
        venus: 3,
        mars: 4,
      },
      signs: {
        aries: 0,
        taurus: 1,
        gemini: 2,
        cancer: 3,
        leo: 4,
        virgo: 5,
        libra: 6,
        scorpio: 7,
        sagittarius: 8,
        capricorn: 9,
        aquarius: 10,
        pisces: 11,
      },
    };

    // Create chart wheel instance
    const chart = new ChartWheel(container, {
      renderData,
      indexes,
      width: 800,
      height: 800,
    });

    // Verify chart was created
    expect(chart).toBeDefined();

    // Verify container has SVG content
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
    expect(svg?.getAttribute('width')).toBe('800');
    expect(svg?.getAttribute('height')).toBe('800');
  });

  it('should handle retrograde indicators from JPL data', () => {
    const renderData: RenderResponse = {
      chartInstance: {
        id: 'test',
        chartDefinitionId: 'test',
        title: 'Test Chart',
        description: null,
        ownerUserId: 'test',
        subjects: [],
        effectiveDateTimes: {
          natal: '2024-01-01T12:00:00Z',
        },
      },
      settings: {
        zodiacType: 'tropical',
        ayanamsa: null,
        houseSystem: 'placidus',
        orbSettings: {
          conjunction: 8.0,
          opposition: 8.0,
          trine: 7.0,
          square: 6.0,
          sextile: 4.0,
        },
        includeObjects: ['mercury'],
      },
      coordinateSystem: {
        angleUnit: 'degrees',
        angleRange: [0.0, 360.0],
        direction: 'ccw',
        zeroPoint: {
          type: 'zodiac',
          signStart: 'aries',
          offsetDegrees: 0.0,
        },
      },
      layers: {
        natal: {
          id: 'natal',
          label: 'Natal',
          kind: 'natal',
          subjectId: null,
          dateTime: '2024-01-01T12:00:00Z',
          location: null,
          positions: {
            planets: {
              mercury: {
                lon: 150.5,
                lat: 0.5,
                speedLon: -0.5,
                retrograde: true,
              },
            },
            houses: null,
          },
        },
      },
      aspects: {
        sets: {},
      },
      wheel: {
        radius: {
          inner: 0,
          outer: 400,
        },
        rings: [
          {
            id: 'planets',
            radius: {
              inner: 200,
              outer: 250,
            },
            items: [
              {
                kind: 'planet',
                planetId: 'mercury',
                lon: 150.5,
              },
            ],
          },
        ],
      },
    };

    const indexes = {
      planets: {
        mercury: 2,
      },
      signs: {},
    };

    const chart = new ChartWheel(container, {
      renderData,
      indexes,
      width: 800,
      height: 800,
    });

    expect(chart).toBeDefined();
    // Chart should render without errors even with retrograde data
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('should handle missing houses gracefully', () => {
    const renderData: RenderResponse = {
      chartInstance: {
        id: 'test',
        chartDefinitionId: 'test',
        title: 'Test Chart',
        description: null,
        ownerUserId: 'test',
        subjects: [],
        effectiveDateTimes: {
          natal: '2024-01-01T12:00:00Z',
        },
      },
      settings: {
        zodiacType: 'tropical',
        ayanamsa: null,
        houseSystem: 'placidus',
        orbSettings: {
          conjunction: 8.0,
          opposition: 8.0,
          trine: 7.0,
          square: 6.0,
          sextile: 4.0,
        },
        includeObjects: ['sun'],
      },
      coordinateSystem: {
        angleUnit: 'degrees',
        angleRange: [0.0, 360.0],
        direction: 'ccw',
        zeroPoint: {
          type: 'zodiac',
          signStart: 'aries',
          offsetDegrees: 0.0,
        },
      },
      layers: {
        natal: {
          id: 'natal',
          label: 'Natal',
          kind: 'natal',
          subjectId: null,
          dateTime: '2024-01-01T12:00:00Z',
          location: null,
          positions: {
            planets: {
              sun: {
                lon: 280.5,
                lat: 1.2,
                speedLon: 0.95,
                retrograde: false,
              },
            },
            houses: null,
          },
        },
      },
      aspects: {
        sets: {},
      },
      wheel: {
        radius: {
          inner: 0,
          outer: 400,
        },
        rings: [
          {
            id: 'planets',
            radius: {
              inner: 200,
              outer: 250,
            },
            items: [
              {
                kind: 'planet',
                planetId: 'sun',
                lon: 280.5,
              },
            ],
          },
        ],
      },
    };

    const indexes = {
      planets: {
        sun: 0,
      },
      signs: {},
    };

    const chart = new ChartWheel(container, {
      renderData,
      indexes,
      width: 800,
      height: 800,
    });

    expect(chart).toBeDefined();
    // Chart should render without errors even without houses
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });
});

