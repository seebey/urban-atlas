// tests/renderers/figure-ground.test.ts
import { renderFigureGround } from '../../src/renderers/figure-ground.js';
import { generateBarcelonaBlock, barcelonaConfig } from '../../src/generators/barcelona.js';

describe('Figure-Ground Renderer', () => {
  test('renders SVG string', () => {
    const block = generateBarcelonaBlock();
    const svg = renderFigureGround(block, barcelonaConfig);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  test('renders building polygons in black', () => {
    const block = generateBarcelonaBlock();
    const svg = renderFigureGround(block, barcelonaConfig);
    expect(svg).toContain('fill="#1A1A1A"');
  });

  test('includes street centerlines', () => {
    const block = generateBarcelonaBlock();
    const svg = renderFigureGround(block, barcelonaConfig);
    expect(svg).toContain('<line');
  });
});
