// src/generators/superblock.ts
import { Block, Building, Street, BlockConfig } from '../core/types.js';
import { rectToPolygon } from '../core/geometry.js';

export const superblockConfig: BlockConfig = {
  name: 'superblock',
  displayName: 'SUPERBLOCK UTOPIAN',
  subtitle: 'Le Corbusier, Ville Radieuse',
  accentColor: '#4A90D9',
  parameters: {
    superblockSize: 400,
    towerGrid: 5,
    towerFootprint: 30,
    towerHeight: 50,
    towerSpacing: 80,
    groundCoverage: 0.14,
  },
};

export function generateSuperblockBlock(): Block {
  const p = superblockConfig.parameters;
  const size = p.superblockSize as number;
  const grid = p.towerGrid as number;
  const footprint = p.towerFootprint as number;
  const height = p.towerHeight as number;
  const spacing = p.towerSpacing as number;

  const buildings: Building[] = [];

  const startOffset = (size - (grid - 1) * spacing) / 2;

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const cx = startOffset + i * spacing;
      const cy = startOffset + j * spacing;

      buildings.push({
        footprint: rectToPolygon(cx - footprint / 2, cy - footprint / 2, footprint, footprint),
        height,
        stories: 15,
      });
    }
  }

  // Pedestrian paths through the park
  const streets: Street[] = [
    {
      centerline: [{ x: 0, y: size / 2 }, { x: size, y: size / 2 }],
      width: 6,
      hierarchy: 'pedestrian',
    },
    {
      centerline: [{ x: size / 2, y: 0 }, { x: size / 2, y: size }],
      width: 6,
      hierarchy: 'pedestrian',
    },
    // Perimeter road
    {
      centerline: [{ x: -10, y: -10 }, { x: size + 10, y: -10 }],
      width: 12,
      hierarchy: 'arterial',
    },
    {
      centerline: [{ x: -10, y: size + 10 }, { x: size + 10, y: size + 10 }],
      width: 12,
      hierarchy: 'arterial',
    },
  ];

  return {
    buildings,
    streets,
    bounds: { minX: 0, minY: 0, maxX: size, maxY: size },
  };
}
