// tests/core/svg.test.ts
import { svg, rect, line, polygon, text, group, path } from '../../src/core/svg.js';

describe('SVG Primitives', () => {
  test('svg creates root element with viewBox', () => {
    const result = svg(800, 600, '<rect/>');
    expect(result).toContain('viewBox="0 0 800 600"');
    expect(result).toContain('<rect/>');
  });

  test('rect creates rectangle element', () => {
    const result = rect(10, 20, 100, 50, { fill: '#000' });
    expect(result).toContain('x="10"');
    expect(result).toContain('y="20"');
    expect(result).toContain('width="100"');
    expect(result).toContain('height="50"');
    expect(result).toContain('fill="#000"');
  });

  test('line creates line element', () => {
    const result = line(0, 0, 100, 100, { stroke: '#000', strokeWidth: 2 });
    expect(result).toContain('x1="0"');
    expect(result).toContain('y2="100"');
    expect(result).toContain('stroke="#000"');
  });

  test('polygon creates polygon from points', () => {
    const points = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
    const result = polygon(points, { fill: '#000' });
    expect(result).toContain('points="0,0 10,0 10,10"');
  });

  test('text creates text element', () => {
    const result = text(50, 50, 'Hello', { fontSize: 12 });
    expect(result).toContain('x="50"');
    expect(result).toContain('y="50"');
    expect(result).toContain('Hello');
  });

  test('group wraps content with transform', () => {
    const result = group('<rect/>', { translate: { x: 10, y: 20 } });
    expect(result).toContain('transform="translate(10, 20)"');
    expect(result).toContain('<rect/>');
  });
});
