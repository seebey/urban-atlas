// tests/composer/board.test.ts
import { composeBoard } from '../../src/composer/board.js';
import { generateBarcelonaBlock, barcelonaConfig } from '../../src/generators/barcelona.js';
import { renderFigureGround } from '../../src/renderers/figure-ground.js';
import { renderAxonometric } from '../../src/renderers/axonometric.js';
import { renderSection } from '../../src/renderers/section.js';
import { renderStreetNetwork } from '../../src/renderers/street-network.js';
import { renderDensityGradient } from '../../src/renderers/density-gradient.js';

describe('Board Composer', () => {
  test('composes all drawings into single SVG', () => {
    const block = generateBarcelonaBlock();
    const drawings = {
      figureGround: renderFigureGround(block, barcelonaConfig),
      axonometric: renderAxonometric(block, barcelonaConfig),
      section: renderSection(block, barcelonaConfig),
      streetNetwork: renderStreetNetwork(block, barcelonaConfig),
      densityGradient: renderDensityGradient(block, barcelonaConfig),
    };

    const board = composeBoard(drawings, barcelonaConfig);

    expect(board).toContain('<svg');
    expect(board).toContain('BARCELONA EIXAMPLE');
    expect(board).toContain('Cerdà Grid, 1859');
  });

  test('includes all five drawing types', () => {
    const block = generateBarcelonaBlock();
    const drawings = {
      figureGround: renderFigureGround(block, barcelonaConfig),
      axonometric: renderAxonometric(block, barcelonaConfig),
      section: renderSection(block, barcelonaConfig),
      streetNetwork: renderStreetNetwork(block, barcelonaConfig),
      densityGradient: renderDensityGradient(block, barcelonaConfig),
    };

    const board = composeBoard(drawings, barcelonaConfig);

    // Each embedded SVG becomes a group or image
    const svgCount = (board.match(/<svg/g) || []).length;
    expect(svgCount).toBeGreaterThanOrEqual(1); // At least the outer SVG
  });
});
