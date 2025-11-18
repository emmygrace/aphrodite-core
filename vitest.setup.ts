// Vitest setup file for DOM testing
// Mock D3 if needed
if (typeof (globalThis as any).d3 === 'undefined') {
  // D3 will be loaded via script tag in test.html or via import
  // For unit tests, we may need to mock it or load it differently
}

