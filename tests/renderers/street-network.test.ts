// tests/renderers/street-network.test.ts
import { renderStreetNetwork } from '../../src/renderers/street-network.js';
import { generateBarcelonaBlock, barcelonaConfig } from '../../src/generators/barcelona.js';

describe('Street Network Renderer', () => {
  test('renders SVG string', () => {
    const block = generateBarcelonaBlock();
    const svg = renderStreetNetwork(block, barcelonaConfig);
    expect(svg).toContain('<svg');
  });

  test('renders street lines', () => {
    const block = generateBarcelonaBlock();
    const svg = renderStreetNetwork(block, barcelonaConfig);
    expect(svg).toContain('<line');
  });

  test('renders intersection nodes as circles', () => {
    const block = generateBarcelonaBlock();
    const svg = renderStreetNetwork(block, barcelonaConfig);
    expect(svg).toContain('<circle');
  });
});
