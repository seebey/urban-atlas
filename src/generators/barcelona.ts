// src/generators/barcelona.ts
import { Block, Building, Street, BlockConfig, Point } from '../core/types.js';
import { chamferRect } from '../core/geometry.js';

export const barcelonaConfig: BlockConfig = {
  name: 'barcelona',
  displayName: 'BARCELONA EIXAMPLE',
  subtitle: 'Cerdà Grid, 1859',
  accentColor: '#D4726A',
  parameters: {
    blockSize: 113,
    chamfer: 20,
    perimeterDepth: 18,
    courtyardSize: 56,
    buildingHeight: 24,
    stories: 7,
    streetWidth: 20,
  },
};

export function generateBarcelonaBlock(): Block {
  const p = barcelonaConfig.parameters;
  const size = p.blockSize as number;
  const chamfer = p.chamfer as number;
  const depth = p.perimeterDepth as number;
  const stories = p.stories as number;
  const height = p.buildingHeight as number;
  const streetWidth = p.streetWidth as number;

  // Outer perimeter (chamfered octagon)
  const outer = chamferRect(0, 0, size, size, chamfer);

  // Inner courtyard (smaller chamfered octagon)
  const inner = chamferRect(depth, depth, size - 2 * depth, size - 2 * depth, chamfer * 0.6);

  // Create four perimeter buildings (one per side) + four corner buildings
  const buildings: Building[] = [];

  // North building
  buildings.push({
    footprint: [
      outer[0], outer[1],
      { x: inner[1].x, y: depth },
      { x: inner[0].x, y: depth },
    ],
    height,
    stories,
  });

  // East building
  buildings.push({
    footprint: [
      outer[2], outer[3],
      { x: size - depth, y: inner[3].y },
      { x: size - depth, y: inner[2].y },
    ],
    height,
    stories,
  });

  // South building
  buildings.push({
    footprint: [
      outer[4], outer[5],
      { x: inner[5].x, y: size - depth },
      { x: inner[4].x, y: size - depth },
    ],
    height,
    stories,
  });

  // West building
  buildings.push({
    footprint: [
      outer[6], outer[7],
      { x: depth, y: inner[7].y },
      { x: depth, y: inner[6].y },
    ],
    height,
    stories,
  });

  // Corner buildings (chamfer zones)
  // NE corner
  buildings.push({
    footprint: [
      outer[1], outer[2],
      { x: size - depth, y: inner[2].y },
      { x: inner[1].x, y: depth },
    ],
    height,
    stories,
  });

  // SE corner
  buildings.push({
    footprint: [
      outer[3], outer[4],
      { x: inner[4].x, y: size - depth },
      { x: size - depth, y: inner[3].y },
    ],
    height,
    stories,
  });

  // SW corner
  buildings.push({
    footprint: [
      outer[5], outer[6],
      { x: depth, y: inner[6].y },
      { x: inner[5].x, y: size - depth },
    ],
    height,
    stories,
  });

  // NW corner
  buildings.push({
    footprint: [
      outer[7], outer[0],
      { x: inner[0].x, y: depth },
      { x: depth, y: inner[7].y },
    ],
    height,
    stories,
  });

  // Streets (4 surrounding streets)
  const streets: Street[] = [
    {
      centerline: [{ x: -streetWidth, y: -streetWidth / 2 }, { x: size + streetWidth, y: -streetWidth / 2 }],
      width: streetWidth,
      hierarchy: 'arterial',
    },
    {
      centerline: [{ x: -streetWidth, y: size + streetWidth / 2 }, { x: size + streetWidth, y: size + streetWidth / 2 }],
      width: streetWidth,
      hierarchy: 'arterial',
    },
    {
      centerline: [{ x: -streetWidth / 2, y: -streetWidth }, { x: -streetWidth / 2, y: size + streetWidth }],
      width: streetWidth,
      hierarchy: 'arterial',
    },
    {
      centerline: [{ x: size + streetWidth / 2, y: -streetWidth }, { x: size + streetWidth / 2, y: size + streetWidth }],
      width: streetWidth,
      hierarchy: 'arterial',
    },
  ];

  return {
    buildings,
    streets,
    bounds: { minX: 0, minY: 0, maxX: size, maxY: size },
    courtyards: [{ points: inner }],
  };
}
