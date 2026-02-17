// src/renderers/figure-ground.ts
import { Block, BlockConfig, Point } from '../core/types.js';
import { svg, polygon, line, rect, text } from '../core/svg.js';
import { getPalette } from '../styles/palettes.js';
import { lineWeights } from '../styles/line-weights.js';

const DRAWING_SIZE = 300; // pixels
const MARGIN = 20;

export function renderFigureGround(block: Block, config: BlockConfig): string {
  const palette = getPalette(config.name);
  const { bounds } = block;

  const blockWidth = bounds.maxX - bounds.minX;
  const blockHeight = bounds.maxY - bounds.minY;
  const maxDim = Math.max(blockWidth, blockHeight);

  // Include streets in view
  const streetWidth = (config.parameters.streetWidth as number) || 20;
  const viewSize = maxDim + streetWidth * 2;

  const scale = (DRAWING_SIZE - MARGIN * 2) / viewSize;
  const offsetX = MARGIN + streetWidth * scale;
  const offsetY = MARGIN + streetWidth * scale;

  function toScreen(p: Point): Point {
    return {
      x: offsetX + (p.x - bounds.minX) * scale,
      y: offsetY + (p.y - bounds.minY) * scale,
    };
  }

  const elements: string[] = [];

  // Background
  elements.push(rect(0, 0, DRAWING_SIZE, DRAWING_SIZE, { fill: palette.background }));

  // Street centerlines
  for (const street of block.streets) {
    const start = toScreen(street.centerline[0]);
    const end = toScreen(street.centerline[street.centerline.length - 1]);
    elements.push(
      line(start.x, start.y, end.x, end.y, {
        stroke: palette.gray,
        strokeWidth: lineWeights.hairline,
        opacity: 0.3,
      })
    );
  }

  // Buildings (solid black)
  for (const building of block.buildings) {
    const screenPoints = building.footprint.map(toScreen);
    elements.push(
      polygon(screenPoints, {
        fill: palette.foreground,
        stroke: palette.foreground,
        strokeWidth: lineWeights.light,
      })
    );
  }

  // Scale bar
  const scaleBarLength = 50 * scale; // 50 meters
  const scaleBarY = DRAWING_SIZE - MARGIN / 2;
  elements.push(
    line(MARGIN, scaleBarY, MARGIN + scaleBarLength, scaleBarY, {
      stroke: palette.foreground,
      strokeWidth: lineWeights.light,
    })
  );
  elements.push(
    text(MARGIN + scaleBarLength / 2, scaleBarY - 4, '50m', {
      fontSize: 6,
      fill: palette.foreground,
      textAnchor: 'middle',
    })
  );

  return svg(DRAWING_SIZE, DRAWING_SIZE, elements.join('\n'));
}
