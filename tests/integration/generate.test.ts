// tests/integration/generate.test.ts
import { blockTypes, allBlockNames } from '../../src/generators/index.js';
import { renderFigureGround } from '../../src/renderers/figure-ground.js';
import { renderAxonometric } from '../../src/renderers/axonometric.js';
import { renderSection } from '../../src/renderers/section.js';
import { renderStreetNetwork } from '../../src/renderers/street-network.js';
import { renderDensityGradient } from '../../src/renderers/density-gradient.js';
import { composeBoard } from '../../src/composer/board.js';

describe('Integration: Full generation pipeline', () => {
  test.each(allBlockNames)('generates complete board for %s', (name) => {
    const { generate, config } = blockTypes[name];

    const block = generate();
    expect(block.buildings.length).toBeGreaterThan(0);

    const figureGround = renderFigureGround(block, config);
    expect(figureGround).toContain('<svg');

    const axonometric = renderAxonometric(block, config);
    expect(axonometric).toContain('<svg');

    const section = renderSection(block, config);
    expect(section).toContain('<svg');

    const streetNetwork = renderStreetNetwork(block, config);
    expect(streetNetwork).toContain('<svg');

    const densityGradient = renderDensityGradient(block, config);
    expect(densityGradient).toContain('<svg');

    const board = composeBoard({
      figureGround,
      axonometric,
      section,
      streetNetwork,
      densityGradient,
    }, config);

    expect(board).toContain(config.displayName);
    expect(board).toContain(config.subtitle);
  });
});
