# Test Page Instructions

This directory contains a test HTML page (`test.html`) that demonstrates the Aphrodite chart library with 4 different chart examples.

## Running the Test Page

The test page uses ES modules, so it must be served via an HTTP server (not opened directly as a file).

### Option 1: Using the provided script

```bash
./test-server.sh
```

Then open http://localhost:8000/test.html in your browser.

### Option 2: Using Python

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/test.html in your browser.

### Option 3: Using Node.js (npx serve)

```bash
npx serve -p 8000
```

Then open http://localhost:8000/test.html in your browser.

## What's on the Test Page

The test page displays 4 different charts:

1. **Chart 1: Basic Natal Chart** - Shows signs, houses, and planets
2. **Chart 2: Houses Only** - Displays only the house divisions
3. **Chart 3: Planets & Aspects** - Shows planets with aspect lines connecting them
4. **Chart 4: Full Chart with Rotation** - Complete chart with a 45-degree rotation offset

## Prerequisites

- The library must be built first: `npm run build`
- D3.js is loaded from CDN (no local installation needed)
- A modern browser with ES module support

## Using with JPL Ephemeris

The test page can work with charts rendered from JPL ephemeris data. The data structure is identical to Swiss Ephemeris, so no changes are needed in the frontend code.

To test with JPL ephemeris:

1. Start the backend API with JPL adapter:
   ```bash
   cd ../coeus-api
   export EPHEMERIS_ADAPTER=jpl
   uvicorn app.main:app --reload --port 8000
   ```

2. Use `iris-core` to fetch data from the API and render with `aphrodite-d3`:
   ```typescript
   import { createApiClient, convertEphemerisToRender, buildIndexes } from '@gaia-tools/iris-core';
   import { ChartWheel } from '@gaia-tools/aphrodite-d3';
   
   const api = createApiClient('http://localhost:8000/api');
   const ephemerisResponse = await api.render.render({...});
   const renderData = convertEphemerisToRender(ephemerisResponse);
   const indexes = buildIndexes(renderData);
   
   const chart = new ChartWheel(container, { renderData, indexes, ... });
   ```

The chart will render identically whether using Swiss or JPL ephemeris data.

