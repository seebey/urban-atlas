// src/renderers/density-gradient.ts
import { Block, BlockConfig, Point } from '../core/types.js';
import { svg, polygon, rect, text, defs } from '../core/svg.js';
import { getPalette } from '../styles/palettes.js';
import { lineWeights } from '../styles/line-weights.js';

const DRAWING_SIZE = 150; // pixels
const MARGIN = 15;
const LEGEND_WIDTH = 10;
const LEGEND_MARGIN = 5;

/**
 * Interpolates between two hex colors based on a factor (0-1)
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
  // Parse hex colors
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 255;
  const g1 = (c1 >> 8) & 255;
  const b1 = c1 & 255;

  const r2 = (c2 >> 16) & 255;
  const g2 = (c2 >> 8) & 255;
  const b2 = c2 & 255;

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function renderDensityGradient(block: Block, config: BlockConfig): string {
  const palette = getPalette(config.name);
  const { bounds } = block;

  const blockWidth = bounds.maxX - bounds.minX;
  const blockHeight = bounds.maxY - bounds.minY;
  const maxDim = Math.max(blockWidth, blockHeight);

  // Include streets in view
  const streetWidth = (config.parameters.streetWidth as number) || 20;
  const viewSize = maxDim + streetWidth * 2;

  // Account for legend in available drawing space
  const drawingWidth = DRAWING_SIZE - LEGEND_WIDTH - LEGEND_MARGIN * 2;
  const scale = (drawingWidth - MARGIN * 2) / viewSize;
  const offsetX = MARGIN + streetWidth * scale;
  const offsetY = MARGIN + streetWidth * scale;

  function toScreen(p: Point): Point {
    return {
      x: offsetX + (p.x - bounds.minX) * scale,
      y: offsetY + (p.y - bounds.minY) * scale,
    };
  }

  // Find min and max building heights for normalization
  const heights = block.buildings.map((b) => b.stories);
  const minHeight = Math.min(...heights);
  const maxHeight = Math.max(...heights);

  const elements: string[] = [];

  // Define gradient for legend
  const gradientId = 'densityGradient';
  const gradientDef = `
    <linearGradient id="${gradientId}" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="${palette.accent}"/>
    </linearGradient>
  `;
  elements.push(defs(gradientDef));

  // Background
  elements.push(rect(0, 0, DRAWING_SIZE, DRAWING_SIZE, { fill: palette.background }));

  // Buildings colored by height
  for (const building of block.buildings) {
    const screenPoints = building.footprint.map(toScreen);

    // Normalize height to 0-1 range
    const heightFactor = maxHeight > minHeight
      ? (building.stories - minHeight) / (maxHeight - minHeight)
      : 1;

    const fillColor = interpolateColor('#FFFFFF', palette.accent, heightFactor);

    elements.push(
      polygon(screenPoints, {
        fill: fillColor,
        stroke: palette.foreground,
        strokeWidth: lineWeights.hairline,
      })
    );
  }

  // Legend bar
  const legendX = DRAWING_SIZE - MARGIN - LEGEND_WIDTH;
  const legendY = MARGIN;
  const legendHeight = DRAWING_SIZE - MARGIN * 2;

  // Legend background with gradient
  elements.push(
    `<rect x="${legendX}" y="${legendY}" width="${LEGEND_WIDTH}" height="${legendHeight}" fill="url(#${gradientId})" stroke="${palette.foreground}" stroke-width="${lineWeights.hairline}"/>`
  );

  // Legend labels
  elements.push(
    text(legendX + LEGEND_WIDTH / 2, legendY - 3, `${maxHeight}`, {
      fontSize: 5,
      fill: palette.foreground,
      textAnchor: 'middle',
    })
  );
  elements.push(
    text(legendX + LEGEND_WIDTH / 2, legendY + legendHeight + 6, `${minHeight}`, {
      fontSize: 5,
      fill: palette.foreground,
      textAnchor: 'middle',
    })
  );

  // Legend title
  elements.push(
    text(legendX + LEGEND_WIDTH / 2, DRAWING_SIZE - 3, 'stories', {
      fontSize: 4,
      fill: palette.gray,
      textAnchor: 'middle',
    })
  );

  return svg(DRAWING_SIZE, DRAWING_SIZE, elements.join('\n'));
}
