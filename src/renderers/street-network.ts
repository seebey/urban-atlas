// src/renderers/street-network.ts
import { Block, BlockConfig, Point, Street } from '../core/types.js';
import { svg, line, circle, rect } from '../core/svg.js';
import { getPalette } from '../styles/palettes.js';

const DRAWING_SIZE = 150; // pixels
const MARGIN = 10;

// Line weights based on street hierarchy
const HIERARCHY_WEIGHTS: Record<Street['hierarchy'], number> = {
  arterial: 2.0,
  collector: 1.5,
  local: 0.75,
  pedestrian: 0.5,
};

// Dash pattern for pedestrian streets
const PEDESTRIAN_DASH = '2,2';

interface Intersection {
  x: number;
  y: number;
}

function findIntersections(streets: Street[], toScreen: (p: Point) => Point): Intersection[] {
  const intersections: Intersection[] = [];
  const tolerance = 15; // pixels - endpoints within this distance are considered same intersection

  // Collect all endpoints
  const endpoints: Point[] = [];
  for (const street of streets) {
    endpoints.push(toScreen(street.centerline[0]));
    endpoints.push(toScreen(street.centerline[street.centerline.length - 1]));
  }

  // Find clusters of endpoints (intersections)
  const visited = new Set<number>();
  for (let i = 0; i < endpoints.length; i++) {
    if (visited.has(i)) continue;

    const cluster: Point[] = [endpoints[i]];
    visited.add(i);

    for (let j = i + 1; j < endpoints.length; j++) {
      if (visited.has(j)) continue;
      const dx = endpoints[i].x - endpoints[j].x;
      const dy = endpoints[i].y - endpoints[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < tolerance) {
        cluster.push(endpoints[j]);
        visited.add(j);
      }
    }

    // Only mark as intersection if 2+ streets meet
    if (cluster.length >= 2) {
      const avgX = cluster.reduce((sum, p) => sum + p.x, 0) / cluster.length;
      const avgY = cluster.reduce((sum, p) => sum + p.y, 0) / cluster.length;
      intersections.push({ x: avgX, y: avgY });
    }
  }

  return intersections;
}

export function renderStreetNetwork(block: Block, config: BlockConfig): string {
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

  // Render streets with hierarchy-based styling
  for (const street of block.streets) {
    const start = toScreen(street.centerline[0]);
    const end = toScreen(street.centerline[street.centerline.length - 1]);
    const weight = HIERARCHY_WEIGHTS[street.hierarchy];

    const lineStyle: {
      stroke: string;
      strokeWidth: number;
      opacity: number;
      strokeDasharray?: string;
    } = {
      stroke: palette.accent,
      strokeWidth: weight,
      opacity: 0.6,
    };

    // Add dashed pattern for pedestrian streets
    if (street.hierarchy === 'pedestrian') {
      lineStyle.strokeDasharray = PEDESTRIAN_DASH;
    }

    elements.push(line(start.x, start.y, end.x, end.y, lineStyle));
  }

  // Render intersection nodes as circles
  const intersections = findIntersections(block.streets, toScreen);
  for (const intersection of intersections) {
    elements.push(
      circle(intersection.x, intersection.y, 2.5, {
        fill: palette.accent,
        opacity: 0.6,
      })
    );
  }

  return svg(DRAWING_SIZE, DRAWING_SIZE, elements.join('\n'));
}
