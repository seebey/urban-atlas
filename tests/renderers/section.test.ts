// tests/renderers/section.test.ts
import { renderSection } from '../../src/renderers/section.js';
import { generateBarcelonaBlock, barcelonaConfig } from '../../src/generators/barcelona.js';

describe('Section Renderer', () => {
  test('renders SVG string', () => {
    const block = generateBarcelonaBlock();
    const svg = renderSection(block, barcelonaConfig);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  test('renders cut buildings as solid black (poché)', () => {
    const block = generateBarcelonaBlock();
    const svg = renderSection(block, barcelonaConfig);
    expect(svg).toContain('fill="#1A1A1A"');
  });

  test('includes ground line', () => {
    const block = generateBarcelonaBlock();
    const svg = renderSection(block, barcelonaConfig);
    expect(svg).toContain('<line');
  });
});
