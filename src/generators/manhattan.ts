// src/generators/manhattan.ts
import { Block, Building, Street, BlockConfig } from '../core/types.js';
import { rectToPolygon } from '../core/geometry.js';

export const manhattanConfig: BlockConfig = {
  name: 'manhattan',
  displayName: 'MANHATTAN MIDTOWN',
  subtitle: 'New York Grid, 1811',
  accentColor: '#E8B84A',
  parameters: {
    blockWidth: 80,
    blockLength: 270,
    lotWidthMin: 15,
    lotWidthMax: 25,
    baseHeight: 20,
    towerHeightMin: 60,
    towerHeightMax: 150,
    towerCoverage: 0.4,
    streetWidth: 18,
    avenueWidth: 30,
  },
};

export function generateManhattanBlock(): Block {
  const p = manhattanConfig.parameters;
  const width = p.blockWidth as number;
  const length = p.blockLength as number;
  const baseHeight = p.baseHeight as number;
  const towerMin = p.towerHeightMin as number;
  const towerMax = p.towerHeightMax as number;

  const buildings: Building[] = [];

  // Subdivide into lots along the length
  let x = 0;
  while (x < length) {
    const lotWidth = p.lotWidthMin as number + Math.random() * ((p.lotWidthMax as number) - (p.lotWidthMin as number));
    const actualWidth = Math.min(lotWidth, length - x);

    if (actualWidth < 10) break;

    // Base building (full lot)
    const baseStories = 6;
    buildings.push({
      footprint: rectToPolygon(x, 0, actualWidth, width),
      height: baseHeight,
      stories: baseStories,
    });

    // Tower (random chance, setback)
    if (Math.random() > 0.3) {
      const towerHeight = towerMin + Math.random() * (towerMax - towerMin);
      const towerStories = Math.round(towerHeight / 3.3);
      const setback = 5;
      const towerWidth = actualWidth - setback * 2;
      const towerDepth = width * (p.towerCoverage as number);

      if (towerWidth > 8 && towerDepth > 8) {
        buildings.push({
          footprint: rectToPolygon(x + setback, (width - towerDepth) / 2, towerWidth, towerDepth),
          height: towerHeight,
          stories: towerStories,
        });
      }
    }

    x += actualWidth;
  }

  const streets: Street[] = [
    { centerline: [{ x: -20, y: -9 }, { x: length + 20, y: -9 }], width: 18, hierarchy: 'local' },
    { centerline: [{ x: -20, y: width + 9 }, { x: length + 20, y: width + 9 }], width: 18, hierarchy: 'local' },
    { centerline: [{ x: -15, y: -20 }, { x: -15, y: width + 20 }], width: 30, hierarchy: 'arterial' },
    { centerline: [{ x: length + 15, y: -20 }, { x: length + 15, y: width + 20 }], width: 30, hierarchy: 'arterial' },
  ];

  return {
    buildings,
    streets,
    bounds: { minX: 0, minY: 0, maxX: length, maxY: width },
  };
}
