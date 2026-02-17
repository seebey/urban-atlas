// tests/renderers/axonometric.test.ts
import { renderAxonometric } from '../../src/renderers/axonometric.js';
import { generateBarcelonaBlock, barcelonaConfig } from '../../src/generators/barcelona.js';

describe('Axonometric Renderer', () => {
  test('renders SVG string', () => {
    const block = generateBarcelonaBlock();
    const svg = renderAxonometric(block, barcelonaConfig);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  test('uses accent color for buildings', () => {
    const block = generateBarcelonaBlock();
    const svg = renderAxonometric(block, barcelonaConfig);
    expect(svg).toContain(barcelonaConfig.accentColor);
  });

  test('renders building faces (polygons)', () => {
    const block = generateBarcelonaBlock();
    const svg = renderAxonometric(block, barcelonaConfig);
    expect(svg).toContain('<polygon');
  });
});
