// tests/core/types.test.ts
import {
  Point,
  Building,
  Block,
  BlockConfig,
  DrawingSet,
} from '../../src/core/types.js';

describe('Core Types', () => {
  test('Point has x and y coordinates', () => {
    const p: Point = { x: 10, y: 20 };
    expect(p.x).toBe(10);
    expect(p.y).toBe(20);
  });

  test('Building has footprint, height, and optional properties', () => {
    const b: Building = {
      footprint: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
      height: 24,
      stories: 7,
    };
    expect(b.footprint).toHaveLength(4);
    expect(b.height).toBe(24);
  });

  test('Block contains buildings and streets', () => {
    const block: Block = {
      buildings: [],
      streets: [],
      bounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
    };
    expect(block.buildings).toEqual([]);
  });
});
