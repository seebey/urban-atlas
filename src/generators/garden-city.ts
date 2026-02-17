// src/generators/garden-city.ts
import { Block, Building, Street, BlockConfig, Point } from '../core/types.js';
import { rectToPolygon, rotatePoint } from '../core/geometry.js';

export const gardenCityConfig: BlockConfig = {
  name: 'garden-city',
  displayName: 'GARDEN CITY',
  subtitle: 'Howard & Unwin, 1898',
  accentColor: '#7D9969',
  parameters: {
    siteSize: 200,
    numLots: 12,
    lotSize: 1000,
    buildingSize: 180,
    setbackFront: 12,
    setbackSide: 8,
    buildingHeight: 7,
    coverageRatio: 0.18,
  },
};

export function generateGardenCityBlock(): Block {
  const p = gardenCityConfig.parameters;
  const size = p.siteSize as number;

  const buildings: Building[] = [];
  const numLots = p.numLots as number;

  // Curvilinear lot arrangement
  const rows = 3;
  const cols = Math.ceil(numLots / rows);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Curved row offset
      const curve = Math.sin((col / cols) * Math.PI) * 15;
      const x = 30 + col * (size - 60) / cols + (row % 2) * 10;
      const y = 30 + row * (size - 60) / rows + curve;

      const buildingW = 12 + Math.random() * 6;
      const buildingH = 10 + Math.random() * 5;
      const rotation = (Math.random() - 0.5) * 15;

      const corners = [
        { x: -buildingW / 2, y: -buildingH / 2 },
        { x: buildingW / 2, y: -buildingH / 2 },
        { x: buildingW / 2, y: buildingH / 2 },
        { x: -buildingW / 2, y: buildingH / 2 },
      ].map(pt => {
        const rotated = rotatePoint(pt, rotation);
        return { x: x + rotated.x, y: y + rotated.y };
      });

      buildings.push({
        footprint: corners,
        height: p.buildingHeight as number,
        stories: 2,
      });
    }
  }

  // Curving streets
  const streets: Street[] = [
    {
      centerline: [
        { x: 0, y: size * 0.3 },
        { x: size * 0.25, y: size * 0.25 },
        { x: size * 0.5, y: size * 0.22 },
        { x: size * 0.75, y: size * 0.28 },
        { x: size, y: size * 0.35 },
      ],
      width: 8,
      hierarchy: 'local',
    },
    {
      centerline: [
        { x: 0, y: size * 0.7 },
        { x: size * 0.3, y: size * 0.75 },
        { x: size * 0.6, y: size * 0.72 },
        { x: size, y: size * 0.68 },
      ],
      width: 8,
      hierarchy: 'local',
    },
  ];

  return {
    buildings,
    streets,
    bounds: { minX: 0, minY: 0, maxX: size, maxY: size },
  };
}
