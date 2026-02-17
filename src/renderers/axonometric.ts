// src/renderers/axonometric.ts
import { Block, BlockConfig, Point, Building } from '../core/types.js';
import { svg, polygon, line, rect } from '../core/svg.js';
import { toIsometric, polygonCentroid } from '../core/geometry.js';
import { getPalette } from '../styles/palettes.js';
import { lineWeights } from '../styles/line-weights.js';

const DRAWING_SIZE = 300; // pixels
const MARGIN = 30;

interface Face {
  points: Point[];
  fill: string;
  depth: number; // for painter's algorithm sorting
}

/**
 * Adjust a hex color by a percentage.
 * Positive percentage lightens, negative darkens.
 */
function adjustColor(hex: string, percent: number): string {
  // Parse hex color
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Adjust
  const adjust = (c: number): number => {
    if (percent > 0) {
      // Lighten: move toward 255
      return Math.min(255, Math.round(c + (255 - c) * (percent / 100)));
    } else {
      // Darken: move toward 0
      return Math.max(0, Math.round(c * (1 + percent / 100)));
    }
  };

  const newR = adjust(r);
  const newG = adjust(g);
  const newB = adjust(b);

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Generate building faces (top, left side, right side) for axonometric view
 */
function generateBuildingFaces(building: Building, accentColor: string): Face[] {
  const faces: Face[] = [];
  const { footprint, height } = building;
  const n = footprint.length;

  // Calculate centroid for depth sorting
  const centroid = polygonCentroid(footprint);
  const baseDepth = centroid.x + centroid.y; // simple depth heuristic

  // Top face (lighter)
  const topPoints = footprint.map((p) => toIsometric(p.x, p.y, height));
  faces.push({
    points: topPoints,
    fill: adjustColor(accentColor, 30), // lighter for top
    depth: baseDepth + height, // top is at height level
  });

  // Generate side faces
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const p1 = footprint[i];
    const p2 = footprint[j];

    // Determine edge direction to decide left vs right face shading
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    // Project all four corners of this wall
    const bottomLeft = toIsometric(p1.x, p1.y, 0);
    const bottomRight = toIsometric(p2.x, p2.y, 0);
    const topRight = toIsometric(p2.x, p2.y, height);
    const topLeft = toIsometric(p1.x, p1.y, height);

    // Skip faces that would be back-facing (simple culling)
    // Cross product to determine winding
    const v1x = bottomRight.x - bottomLeft.x;
    const v1y = bottomRight.y - bottomLeft.y;
    const v2x = topLeft.x - bottomLeft.x;
    const v2y = topLeft.y - bottomLeft.y;
    const cross = v1x * v2y - v1y * v2x;

    if (cross <= 0) continue; // Back-facing, skip

    // Determine shade based on edge orientation
    // In isometric: edges going right (dx > 0) face left in view (accent color)
    // Edges going down (dy > 0) face right in view (darker)
    let fill: string;
    if (dx > 0) {
      // Left-facing wall in isometric view - use accent color
      fill = accentColor;
    } else if (dy > 0) {
      // Right-facing wall in isometric view - darker
      fill = adjustColor(accentColor, -25);
    } else {
      // Default for other orientations
      fill = adjustColor(accentColor, -15);
    }

    const edgeCentroid = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
    const faceDepth = edgeCentroid.x + edgeCentroid.y + height / 2;

    faces.push({
      points: [bottomLeft, bottomRight, topRight, topLeft],
      fill,
      depth: faceDepth,
    });
  }

  return faces;
}

export function renderAxonometric(block: Block, config: BlockConfig): string {
  const palette = getPalette(config.name);
  const accentColor = config.accentColor;
  const { bounds } = block;

  const blockWidth = bounds.maxX - bounds.minX;
  const blockHeight = bounds.maxY - bounds.minY;

  // Calculate the isometric bounds for proper scaling
  // Get corner points in isometric space
  const corners3D = [
    { x: bounds.minX, y: bounds.minY, z: 0 },
    { x: bounds.maxX, y: bounds.minY, z: 0 },
    { x: bounds.maxX, y: bounds.maxY, z: 0 },
    { x: bounds.minX, y: bounds.maxY, z: 0 },
  ];

  // Find max building height
  const maxHeight = Math.max(...block.buildings.map((b) => b.height));

  // Add top corners
  corners3D.push(
    { x: bounds.minX, y: bounds.minY, z: maxHeight },
    { x: bounds.maxX, y: bounds.minY, z: maxHeight },
    { x: bounds.maxX, y: bounds.maxY, z: maxHeight },
    { x: bounds.minX, y: bounds.maxY, z: maxHeight }
  );

  const isoCorners = corners3D.map((c) => toIsometric(c.x, c.y, c.z));
  const isoMinX = Math.min(...isoCorners.map((c) => c.x));
  const isoMaxX = Math.max(...isoCorners.map((c) => c.x));
  const isoMinY = Math.min(...isoCorners.map((c) => c.y));
  const isoMaxY = Math.max(...isoCorners.map((c) => c.y));

  const isoWidth = isoMaxX - isoMinX;
  const isoHeight = isoMaxY - isoMinY;
  const maxIsoDim = Math.max(isoWidth, isoHeight);

  const scale = (DRAWING_SIZE - MARGIN * 2) / maxIsoDim;
  const offsetX = MARGIN + (DRAWING_SIZE - MARGIN * 2 - isoWidth * scale) / 2 - isoMinX * scale;
  const offsetY = MARGIN + (DRAWING_SIZE - MARGIN * 2 - isoHeight * scale) / 2 - isoMinY * scale;

  function toScreen(isoPoint: Point): Point {
    return {
      x: offsetX + isoPoint.x * scale,
      y: offsetY + isoPoint.y * scale,
    };
  }

  const elements: string[] = [];

  // Background
  elements.push(rect(0, 0, DRAWING_SIZE, DRAWING_SIZE, { fill: palette.background }));

  // Ground plane with grid (10m spacing)
  const gridSpacing = 10;
  const gridLines: string[] = [];

  // Draw grid lines
  for (let x = bounds.minX; x <= bounds.maxX; x += gridSpacing) {
    const start = toScreen(toIsometric(x, bounds.minY, 0));
    const end = toScreen(toIsometric(x, bounds.maxY, 0));
    gridLines.push(
      line(start.x, start.y, end.x, end.y, {
        stroke: palette.grayLight,
        strokeWidth: lineWeights.grid,
      })
    );
  }

  for (let y = bounds.minY; y <= bounds.maxY; y += gridSpacing) {
    const start = toScreen(toIsometric(bounds.minX, y, 0));
    const end = toScreen(toIsometric(bounds.maxX, y, 0));
    gridLines.push(
      line(start.x, start.y, end.x, end.y, {
        stroke: palette.grayLight,
        strokeWidth: lineWeights.grid,
      })
    );
  }

  elements.push(...gridLines);

  // Collect all faces from all buildings
  const allFaces: Face[] = [];

  for (const building of block.buildings) {
    const faces = generateBuildingFaces(building, accentColor);
    allFaces.push(...faces);
  }

  // Sort faces by depth (painter's algorithm - back to front)
  allFaces.sort((a, b) => a.depth - b.depth);

  // Render faces
  for (const face of allFaces) {
    const screenPoints = face.points.map(toScreen);
    elements.push(
      polygon(screenPoints, {
        fill: face.fill,
        stroke: palette.foreground,
        strokeWidth: lineWeights.light,
      })
    );
  }

  return svg(DRAWING_SIZE, DRAWING_SIZE, elements.join('\n'));
}
