// tests/core/geometry.test.ts
import {
  toIsometric,
  rotatePoint,
  translatePolygon,
  scalePolygon,
  chamferRect,
  polygonArea,
  polygonCentroid,
} from '../../src/core/geometry.js';

describe('Geometry Utilities', () => {
  test('toIsometric projects 3D point to 2D isometric', () => {
    const result = toIsometric(10, 10, 0);
    expect(result.x).toBeCloseTo(0); // x and y cancel at 45°
    // After 45° rotation: ry = 10*sin(45) + 10*cos(45) = 14.14
    // After 30° tilt: y = 14.14 * sin(30) = 7.07
    const expectedY = (10 * Math.sin(Math.PI / 4) + 10 * Math.cos(Math.PI / 4)) * Math.sin(Math.PI / 6);
    expect(result.y).toBeCloseTo(expectedY);
  });

  test('rotatePoint rotates around origin', () => {
    const result = rotatePoint({ x: 10, y: 0 }, 90);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(10);
  });

  test('translatePolygon moves all points', () => {
    const poly = [{ x: 0, y: 0 }, { x: 10, y: 10 }];
    const result = translatePolygon(poly, 5, 5);
    expect(result[0]).toEqual({ x: 5, y: 5 });
    expect(result[1]).toEqual({ x: 15, y: 15 });
  });

  test('chamferRect creates octagon from rectangle', () => {
    const result = chamferRect(0, 0, 100, 100, 10);
    expect(result).toHaveLength(8); // octagon
  });

  test('polygonArea calculates area', () => {
    const square = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    expect(polygonArea(square)).toBeCloseTo(100);
  });

  test('polygonCentroid finds center', () => {
    const square = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    const center = polygonCentroid(square);
    expect(center.x).toBeCloseTo(5);
    expect(center.y).toBeCloseTo(5);
  });
});
