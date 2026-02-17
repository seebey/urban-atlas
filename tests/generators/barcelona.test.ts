// tests/generators/barcelona.test.ts
import { generateBarcelonaBlock, barcelonaConfig } from '../../src/generators/barcelona.js';

describe('Barcelona Block Generator', () => {
  test('generates block with correct bounds', () => {
    const block = generateBarcelonaBlock();
    expect(block.bounds.maxX - block.bounds.minX).toBe(113);
    expect(block.bounds.maxY - block.bounds.minY).toBe(113);
  });

  test('generates 8 perimeter and corner buildings', () => {
    const block = generateBarcelonaBlock();
    expect(block.buildings.length).toBe(8);
  });

  test('all buildings have 7 stories', () => {
    const block = generateBarcelonaBlock();
    for (const building of block.buildings) {
      expect(building.stories).toBe(7);
    }
  });

  test('generates surrounding streets', () => {
    const block = generateBarcelonaBlock();
    expect(block.streets.length).toBe(4);
  });

  test('config has correct accent color', () => {
    expect(barcelonaConfig.accentColor).toBe('#D4726A');
  });
});
