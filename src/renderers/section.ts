// src/renderers/section.ts
import { Block, BlockConfig, Point, Building } from '../core/types.js';
import { svg, rect, line, polygon, text, defs, path } from '../core/svg.js';
import { getPalette } from '../styles/palettes.js';
import { lineWeights } from '../styles/line-weights.js';

const DRAWING_WIDTH = 300;
const DRAWING_HEIGHT = 150;
const MARGIN = 20;
const GROUND_Y = DRAWING_HEIGHT - 30; // Ground line position

/**
 * Check if a horizontal line intersects a polygon
 * Returns the min and max x values of intersection
 */
function getPolygonIntersection(
  footprint: Point[],
  cutY: number
): { minX: number; maxX: number } | null {
  const intersections: number[] = [];

  for (let i = 0; i < footprint.length; i++) {
    const p1 = footprint[i];
    const p2 = footprint[(i + 1) % footprint.length];

    // Check if edge crosses the cut line
    if ((p1.y <= cutY && p2.y > cutY) || (p2.y <= cutY && p1.y > cutY)) {
      // Calculate intersection x
      const t = (cutY - p1.y) / (p2.y - p1.y);
      const x = p1.x + t * (p2.x - p1.x);
      intersections.push(x);
    }
  }

  // Also check if the cut line passes through a point
  for (const p of footprint) {
    if (Math.abs(p.y - cutY) < 0.001) {
      intersections.push(p.x);
    }
  }

  if (intersections.length === 0) {
    // Check if cut line is entirely inside polygon
    if (isPointInPolygon({ x: footprint[0].x, y: cutY }, footprint)) {
      const xs = footprint.map((p) => p.x);
      return { minX: Math.min(...xs), maxX: Math.max(...xs) };
    }
    return null;
  }

  return {
    minX: Math.min(...intersections),
    maxX: Math.max(...intersections),
  };
}

/**
 * Point in polygon test using ray casting
 */
function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const pi = polygon[i];
    const pj = polygon[j];

    if (
      pi.y > point.y !== pj.y > point.y &&
      point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x
    ) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Find buildings that intersect with a horizontal cut line
 */
function findCutBuildings(
  buildings: Building[],
  cutY: number
): Array<{ building: Building; minX: number; maxX: number }> {
  const result: Array<{ building: Building; minX: number; maxX: number }> = [];

  for (const building of buildings) {
    const intersection = getPolygonIntersection(building.footprint, cutY);
    if (intersection) {
      result.push({
        building,
        minX: intersection.minX,
        maxX: intersection.maxX,
      });
    }
  }

  return result;
}

/**
 * Draw a simple human figure silhouette at given position
 * Human figure is 1.7m tall
 */
function drawHumanFigure(x: number, groundY: number, scale: number, fill: string): string {
  const humanHeight = 1.7; // meters
  const scaledHeight = humanHeight * scale;
  const headRadius = scaledHeight * 0.12;
  const bodyHeight = scaledHeight * 0.88;

  // Simple stick figure with filled body
  const headCy = groundY - scaledHeight + headRadius;
  const bodyTop = groundY - bodyHeight;
  const bodyBottom = groundY;

  // Create a simple human silhouette path
  const hw = scaledHeight * 0.15; // half width of body

  const pathD = [
    // Head (circle approximation)
    `M ${x - headRadius} ${headCy}`,
    `A ${headRadius} ${headRadius} 0 1 1 ${x + headRadius} ${headCy}`,
    `A ${headRadius} ${headRadius} 0 1 1 ${x - headRadius} ${headCy}`,
    // Body
    `M ${x - hw} ${bodyTop + headRadius * 2}`,
    `L ${x + hw} ${bodyTop + headRadius * 2}`,
    `L ${x + hw * 0.8} ${bodyBottom}`,
    `L ${x - hw * 0.8} ${bodyBottom}`,
    `Z`,
  ].join(' ');

  return path(pathD, { fill });
}

/**
 * Create diagonal hatch pattern for ground
 */
function createGroundHatchPattern(): string {
  const patternContent = `
    <pattern id="groundHatch" patternUnits="userSpaceOnUse" width="6" height="6">
      <line x1="0" y1="6" x2="6" y2="0" stroke="#1A1A1A" stroke-width="${lineWeights.hatch}"/>
    </pattern>
  `;
  return patternContent;
}

export function renderSection(block: Block, config: BlockConfig): string {
  const palette = getPalette(config.name);
  const { bounds, buildings } = block;

  // Calculate cut line position (horizontal line through center of block)
  const cutY = (bounds.minY + bounds.maxY) / 2;

  // Find buildings that are cut
  const cutBuildings = findCutBuildings(buildings, cutY);

  // Calculate view bounds
  const blockWidth = bounds.maxX - bounds.minX;
  const streetWidth = (config.parameters.streetWidth as number) || 20;
  const viewWidth = blockWidth + streetWidth * 2;

  // Get max building height for vertical scaling
  const maxHeight = Math.max(...buildings.map((b) => b.height), 24);
  const viewHeight = maxHeight + 5; // Add some headroom

  // Calculate scale (fit both width and height)
  const availableWidth = DRAWING_WIDTH - MARGIN * 2;
  const availableHeight = GROUND_Y - MARGIN;
  const scaleX = availableWidth / viewWidth;
  const scaleY = availableHeight / viewHeight;
  const scale = Math.min(scaleX, scaleY);

  // Calculate offsets
  const offsetX = MARGIN + streetWidth * scale;

  function toScreenX(x: number): number {
    return offsetX + (x - bounds.minX) * scale;
  }

  function toScreenY(height: number): number {
    return GROUND_Y - height * scale;
  }

  const elements: string[] = [];

  // Add defs for patterns
  elements.push(defs(createGroundHatchPattern()));

  // Background
  elements.push(rect(0, 0, DRAWING_WIDTH, DRAWING_HEIGHT, { fill: palette.background }));

  // Ground fill with hatch (below ground line)
  const groundFillHeight = DRAWING_HEIGHT - GROUND_Y;
  elements.push(
    rect(0, GROUND_Y, DRAWING_WIDTH, groundFillHeight, {
      fill: 'url(#groundHatch)',
    })
  );

  // Draw cut buildings as solid black (poché)
  for (const { building, minX, maxX } of cutBuildings) {
    const screenMinX = toScreenX(minX);
    const screenMaxX = toScreenX(maxX);
    const screenTop = toScreenY(building.height);
    const buildingWidth = screenMaxX - screenMinX;
    const buildingHeight = GROUND_Y - screenTop;

    // Draw building as solid black rectangle (poché)
    elements.push(
      rect(screenMinX, screenTop, buildingWidth, buildingHeight, {
        fill: palette.foreground,
        stroke: palette.foreground,
        strokeWidth: lineWeights.wallCut,
      })
    );
  }

  // Ground line
  elements.push(
    line(0, GROUND_Y, DRAWING_WIDTH, GROUND_Y, {
      stroke: palette.foreground,
      strokeWidth: lineWeights.heavy,
    })
  );

  // Human figures for scale (place at edges of block)
  const humanX1 = toScreenX(-streetWidth / 2);
  const humanX2 = toScreenX(blockWidth + streetWidth / 2);
  elements.push(drawHumanFigure(humanX1, GROUND_Y, scale, palette.gray));
  elements.push(drawHumanFigure(humanX2, GROUND_Y, scale, palette.gray));

  // Height dimension on right side
  const dimX = DRAWING_WIDTH - MARGIN / 2;
  const dimTopY = toScreenY(maxHeight);
  const dimBottomY = GROUND_Y;

  // Dimension line
  elements.push(
    line(dimX, dimTopY, dimX, dimBottomY, {
      stroke: palette.gray,
      strokeWidth: lineWeights.dimension,
    })
  );

  // Dimension ticks
  elements.push(
    line(dimX - 3, dimTopY, dimX + 3, dimTopY, {
      stroke: palette.gray,
      strokeWidth: lineWeights.dimension,
    })
  );
  elements.push(
    line(dimX - 3, dimBottomY, dimX + 3, dimBottomY, {
      stroke: palette.gray,
      strokeWidth: lineWeights.dimension,
    })
  );

  // Dimension text
  elements.push(
    text(dimX, (dimTopY + dimBottomY) / 2, `${maxHeight}m`, {
      fontSize: 6,
      fill: palette.gray,
      textAnchor: 'middle',
    })
  );

  return svg(DRAWING_WIDTH, DRAWING_HEIGHT, elements.join('\n'));
}
