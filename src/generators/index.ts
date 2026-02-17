// src/generators/index.ts
export { generateBarcelonaBlock, barcelonaConfig } from './barcelona.js';
export { generateManhattanBlock, manhattanConfig } from './manhattan.js';
export { generateMedievalBlock, medievalConfig } from './medieval.js';
export { generateGardenCityBlock, gardenCityConfig } from './garden-city.js';
export { generateSuperblockBlock, superblockConfig } from './superblock.js';
export { generateSeaRanchBlock, seaRanchConfig } from './sea-ranch.js';

import { Block, BlockConfig } from '../core/types.js';
import { generateBarcelonaBlock, barcelonaConfig } from './barcelona.js';
import { generateManhattanBlock, manhattanConfig } from './manhattan.js';
import { generateMedievalBlock, medievalConfig } from './medieval.js';
import { generateGardenCityBlock, gardenCityConfig } from './garden-city.js';
import { generateSuperblockBlock, superblockConfig } from './superblock.js';
import { generateSeaRanchBlock, seaRanchConfig } from './sea-ranch.js';

export const blockTypes: Record<string, { generate: () => Block; config: BlockConfig }> = {
  barcelona: { generate: generateBarcelonaBlock, config: barcelonaConfig },
  manhattan: { generate: generateManhattanBlock, config: manhattanConfig },
  medieval: { generate: generateMedievalBlock, config: medievalConfig },
  'garden-city': { generate: generateGardenCityBlock, config: gardenCityConfig },
  superblock: { generate: generateSuperblockBlock, config: superblockConfig },
  'sea-ranch': { generate: generateSeaRanchBlock, config: seaRanchConfig },
};

export const allBlockNames = Object.keys(blockTypes);
