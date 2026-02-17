// src/styles/line-weights.ts

export const lineWeights = {
  // Drawing line weights (in points for SVG stroke-width)
  heavy: 2.0,      // Cut lines, section poche outlines
  medium: 1.0,     // Building outlines, primary edges
  light: 0.5,      // Secondary edges, surface lines
  hairline: 0.25,  // Texture, grid lines, annotations

  // Specific uses
  wallCut: 2.0,
  wallElevation: 0.75,
  window: 0.35,
  dimension: 0.25,
  grid: 0.15,
  hatch: 0.15,
};

export const dashPatterns = {
  solid: undefined,
  dashed: '4,4',
  dotted: '1,3',
  centerline: '8,3,2,3',
  hidden: '3,3',
};
