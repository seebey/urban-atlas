// src/index.ts
import { blockTypes, allBlockNames } from './generators/index.js';
import { renderFigureGround } from './renderers/figure-ground.js';
import { renderAxonometric } from './renderers/axonometric.js';
import { renderSection } from './renderers/section.js';
import { renderStreetNetwork } from './renderers/street-network.js';
import { renderDensityGradient } from './renderers/density-gradient.js';
import { composeBoard } from './composer/board.js';
import { exportToPdf, exportToSvg } from './core/pdf.js';
import { DrawingSet } from './core/types.js';

async function generateBlock(name: string): Promise<void> {
  const blockType = blockTypes[name];
  if (!blockType) {
    console.error(`Unknown block type: ${name}`);
    console.error(`Available types: ${allBlockNames.join(', ')}`);
    process.exit(1);
  }

  console.log(`Generating ${blockType.config.displayName}...`);

  const block = blockType.generate();
  const config = blockType.config;

  console.log('  Rendering figure-ground...');
  const figureGround = renderFigureGround(block, config);

  console.log('  Rendering axonometric...');
  const axonometric = renderAxonometric(block, config);

  console.log('  Rendering section...');
  const section = renderSection(block, config);

  console.log('  Rendering street network...');
  const streetNetwork = renderStreetNetwork(block, config);

  console.log('  Rendering density gradient...');
  const densityGradient = renderDensityGradient(block, config);

  const drawings: DrawingSet = {
    figureGround,
    axonometric,
    section,
    streetNetwork,
    densityGradient,
  };

  console.log('  Composing board...');
  const board = composeBoard(drawings, config);

  console.log('  Exporting to PDF...');
  await exportToSvg(board, `output/${name}-board.svg`);
  await exportToPdf(board, `output/${name}-board.pdf`, { width: 841, height: 594 });

  console.log(`  Done! Output: output/${name}-board.pdf`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Generate all
    console.log('Generating all block types...\n');
    for (const name of allBlockNames) {
      await generateBlock(name);
      console.log('');
    }
    console.log('All boards generated!');
  } else {
    // Generate specific block(s)
    for (const name of args) {
      await generateBlock(name);
    }
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
