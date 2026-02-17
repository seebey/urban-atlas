// src/composer/board.ts
import { DrawingSet, BlockConfig } from '../core/types.js';
import { svg, rect, text, line } from '../core/svg.js';
import { getPalette } from '../styles/palettes.js';
import { typography } from '../styles/typography.js';
import { lineWeights } from '../styles/line-weights.js';

// A1 landscape in mm, we'll use proportional units
const BOARD_WIDTH = 841;
const BOARD_HEIGHT = 594;
const MARGIN = 40;

function embedSvg(svgString: string, x: number, y: number, width: number, height: number): string {
  // Extract inner content from SVG
  const match = svgString.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  const inner = match ? match[1] : svgString;

  // Extract viewBox
  const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 300 300';

  return `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${viewBox}">${inner}</svg>`;
}

export function composeBoard(drawings: DrawingSet, config: BlockConfig): string {
  const palette = getPalette(config.name);
  const elements: string[] = [];

  // Background
  elements.push(rect(0, 0, BOARD_WIDTH, BOARD_HEIGHT, { fill: palette.background }));

  // Header area
  const headerY = MARGIN;
  elements.push(text(MARGIN, headerY + 24, config.displayName, {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    fontFamily: typography.fontFamily,
    fill: palette.foreground,
  }));
  elements.push(text(MARGIN, headerY + 44, config.subtitle, {
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    fontFamily: typography.fontFamily,
    fill: palette.gray,
  }));

  // Divider line
  elements.push(line(MARGIN, headerY + 55, BOARD_WIDTH - MARGIN, headerY + 55, {
    stroke: palette.grayLight,
    strokeWidth: lineWeights.hairline,
  }));

  // Drawing layout
  const contentTop = headerY + 70;
  const contentHeight = BOARD_HEIGHT - contentTop - MARGIN - 30; // Leave room for footer

  // Row 1: Figure-ground (left) + Axonometric (right)
  const row1Height = contentHeight * 0.6;
  const row1Y = contentTop;
  const col1Width = (BOARD_WIDTH - MARGIN * 3) / 2;

  elements.push(embedSvg(drawings.figureGround, MARGIN, row1Y, col1Width, row1Height));
  elements.push(embedSvg(drawings.axonometric, MARGIN * 2 + col1Width, row1Y, col1Width, row1Height));

  // Row 2: Section, Street Network, Density Gradient
  const row2Height = contentHeight * 0.35;
  const row2Y = row1Y + row1Height + 15;
  const col2Width = (BOARD_WIDTH - MARGIN * 4) / 3;

  elements.push(embedSvg(drawings.section, MARGIN, row2Y, col2Width * 1.2, row2Height));
  elements.push(embedSvg(drawings.streetNetwork, MARGIN + col2Width * 1.3, row2Y, col2Width * 0.8, row2Height));
  elements.push(embedSvg(drawings.densityGradient, MARGIN + col2Width * 2.2, row2Y, col2Width * 0.8, row2Height));

  // Footer
  const footerY = BOARD_HEIGHT - MARGIN;

  // Parameters
  const params = Object.entries(config.parameters)
    .map(([k, v]) => `${k}: ${v}`)
    .join('  |  ');

  elements.push(text(MARGIN, footerY, params, {
    fontSize: typography.label.fontSize,
    fontFamily: typography.fontFamily,
    fill: palette.gray,
  }));

  // Scale indicator
  elements.push(text(BOARD_WIDTH - MARGIN - 100, footerY, 'Scale 1:2500', {
    fontSize: typography.label.fontSize,
    fontFamily: typography.fontFamily,
    fill: palette.gray,
    textAnchor: 'end',
  }));

  // North arrow (simple)
  const arrowX = BOARD_WIDTH - MARGIN - 30;
  const arrowY = footerY - 8;
  elements.push(line(arrowX, arrowY + 10, arrowX, arrowY - 5, {
    stroke: palette.foreground,
    strokeWidth: lineWeights.light,
  }));
  elements.push(text(arrowX, arrowY - 8, 'N', {
    fontSize: 8,
    fontFamily: typography.fontFamily,
    fill: palette.foreground,
    textAnchor: 'middle',
  }));

  return svg(BOARD_WIDTH, BOARD_HEIGHT, elements.join('\n'), palette.background);
}
