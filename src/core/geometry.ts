// src/core/geometry.ts
import { Point } from './types.js';

// Isometric projection: 45° rotation, then 30° tilt
export function toIsometric(x: number, y: number, z: number): Point {
  const angle = Math.PI / 4; // 45 degrees
  const tilt = Math.PI / 6; // 30 degrees

  // Rotate in XY plane
  const rx = x * Math.cos(angle) - y * Math.sin(angle);
  const ry = x * Math.sin(angle) + y * Math.cos(angle);

  // Project with tilt (y becomes screen y, z goes up)
  return {
    x: rx,
    y: ry * Math.sin(tilt) - z,
  };
}

export function rotatePoint(p: Point, degrees: number, origin: Point = { x: 0, y: 0 }): Point {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = p.x - origin.x;
  const dy = p.y - origin.y;
  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos,
  };
}

export function translatePolygon(points: Point[], dx: number, dy: number): Point[] {
  return points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
}

export function scalePolygon(points: Point[], scale: number, origin: Point = { x: 0, y: 0 }): Point[] {
  return points.map((p) => ({
    x: origin.x + (p.x - origin.x) * scale,
    y: origin.y + (p.y - origin.y) * scale,
  }));
}

export function chamferRect(
  x: number,
  y: number,
  width: number,
  height: number,
  chamfer: number
): Point[] {
  return [
    { x: x + chamfer, y: y },
    { x: x + width - chamfer, y: y },
    { x: x + width, y: y + chamfer },
    { x: x + width, y: y + height - chamfer },
    { x: x + width - chamfer, y: y + height },
    { x: x + chamfer, y: y + height },
    { x: x, y: y + height - chamfer },
    { x: x, y: y + chamfer },
  ];
}

export function rectToPolygon(x: number, y: number, width: number, height: number): Point[] {
  return [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ];
}

export function polygonArea(points: Point[]): number {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
}

export function polygonCentroid(points: Point[]): Point {
  let cx = 0;
  let cy = 0;
  const n = points.length;
  for (const p of points) {
    cx += p.x;
    cy += p.y;
  }
  return { x: cx / n, y: cy / n };
}

export function pointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    if (((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

export function offsetPolygon(points: Point[], offset: number): Point[] {
  const centroid = polygonCentroid(points);
  return points.map((p) => {
    const dx = p.x - centroid.x;
    const dy = p.y - centroid.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return p;
    const scale = (len - offset) / len;
    return {
      x: centroid.x + dx * scale,
      y: centroid.y + dy * scale,
    };
  });
}
