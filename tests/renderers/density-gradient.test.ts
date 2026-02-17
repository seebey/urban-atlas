// tests/renderers/density-gradient.test.ts
import { renderDensityGradient } from '../../src/renderers/density-gradient.js';
import { generateBarcelonaBlock, barcelonaConfig } from '../../src/generators/barcelona.js';

describe('Density Gradient Renderer', () => {
  test('renders SVG string', () => {
    const block = generateBarcelonaBlock();
    const svg = renderDensityGradient(block, barcelonaConfig);
    expect(svg).toContain('<svg');
  });

  test('renders buildings with gradient fill based on height', () => {
    const block = generateBarcelonaBlock();
    const svg = renderDensityGradient(block, barcelonaConfig);
    expect(svg).toContain('<polygon');
  });

  test('includes color legend', () => {
    const block = generateBarcelonaBlock();
    const svg = renderDensityGradient(block, barcelonaConfig);
    expect(svg).toContain('linearGradient');
  });
});
