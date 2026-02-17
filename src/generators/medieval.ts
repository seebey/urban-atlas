// src/generators/medieval.ts
import { Block, Building, Street, BlockConfig, Point } from '../core/types.js';
import { polygonCentroid } from '../core/geometry.js';

export const medievalConfig: BlockConfig = {
  name: 'medieval',
  displayName: 'MEDIEVAL ORGANIC',
  subtitle: 'European Historic Center',
  accentColor: '#8B7355',
  parameters: {
    siteSize: 150,
    numSeeds: 25,
    minHeight: 6,
    maxHeight: 18,
    streetWidthMin: 3,
    streetWidthMax: 8,
    infillDensity: 0.85,
  },
};

// Simple Voronoi approximation using nearest-neighbor regions
function generateVoronoiLots(size: number, numSeeds: number): Point[][] {
  // Random seed points
  const seeds: Point[] = [];
  for (let i = 0; i < numSeeds; i++) {
    seeds.push({
      x: 10 + Math.random() * (size - 20),
      y: 10 + Math.random() * (size - 20),
    });
  }

  // Create rectangular lots around seeds (simplified)
  const lots: Point[][] = [];
  const gridSize = Math.ceil(Math.sqrt(numSeeds));
  const cellSize = size / gridSize;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cx = (i + 0.3 + Math.random() * 0.4) * cellSize;
      const cy = (j + 0.3 + Math.random() * 0.4) * cellSize;
      const w = cellSize * (0.5 + Math.random() * 0.3);
      const h = cellSize * (0.5 + Math.random() * 0.3);

      // Slight rotation for organic feel
      const angle = (Math.random() - 0.5) * 0.2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const corners = [
        { x: -w / 2, y: -h / 2 },
        { x: w / 2, y: -h / 2 },
        { x: w / 2, y: h / 2 },
        { x: -w / 2, y: h / 2 },
      ].map(p => ({
        x: cx + p.x * cos - p.y * sin,
        y: cy + p.x * sin + p.y * cos,
      }));

      lots.push(corners);
    }
  }

  return lots;
}

export function generateMedievalBlock(): Block {
  const p = medievalConfig.parameters;
  const size = p.siteSize as number;
  const lots = generateVoronoiLots(size, p.numSeeds as number);

  const buildings: Building[] = [];

  for (const lot of lots) {
    if (Math.random() > (p.infillDensity as number)) continue;

    const height = (p.minHeight as number) + Math.random() * ((p.maxHeight as number) - (p.minHeight as number));
    const stories = Math.round(height / 3.5);

    buildings.push({
      footprint: lot,
      height,
      stories,
    });
  }

  // Organic streets (paths between lot centroids)
  const streets: Street[] = [];
  const streetWidth = p.streetWidthMin as number + Math.random() * ((p.streetWidthMax as number) - (p.streetWidthMin as number));

  // Main through-street
  streets.push({
    centerline: [
      { x: 0, y: size * 0.3 },
      { x: size * 0.3, y: size * 0.4 },
      { x: size * 0.7, y: size * 0.5 },
      { x: size, y: size * 0.45 },
    ],
    width: 6,
    hierarchy: 'collector',
  });

  streets.push({
    centerline: [
      { x: size * 0.4, y: 0 },
      { x: size * 0.5, y: size * 0.5 },
      { x: size * 0.55, y: size },
    ],
    width: 5,
    hierarchy: 'local',
  });

  return {
    buildings,
    streets,
    bounds: { minX: 0, minY: 0, maxX: size, maxY: size },
  };
}
