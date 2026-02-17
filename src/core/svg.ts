// src/core/svg.ts
import { Point } from './types.js';

interface StyleProps {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  opacity?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  textAnchor?: 'start' | 'middle' | 'end';
}

interface TransformProps {
  translate?: Point;
  rotate?: number;
  scale?: number | Point;
}

function styleToAttr(style: StyleProps): string {
  const attrs: string[] = [];
  if (style.fill !== undefined) attrs.push(`fill="${style.fill}"`);
  if (style.stroke !== undefined) attrs.push(`stroke="${style.stroke}"`);
  if (style.strokeWidth !== undefined) attrs.push(`stroke-width="${style.strokeWidth}"`);
  if (style.strokeDasharray !== undefined) attrs.push(`stroke-dasharray="${style.strokeDasharray}"`);
  if (style.opacity !== undefined) attrs.push(`opacity="${style.opacity}"`);
  if (style.fontSize !== undefined) attrs.push(`font-size="${style.fontSize}"`);
  if (style.fontFamily !== undefined) attrs.push(`font-family="${style.fontFamily}"`);
  if (style.fontWeight !== undefined) attrs.push(`font-weight="${style.fontWeight}"`);
  if (style.textAnchor !== undefined) attrs.push(`text-anchor="${style.textAnchor}"`);
  return attrs.join(' ');
}

function transformToAttr(transform: TransformProps): string {
  const parts: string[] = [];
  if (transform.translate) {
    parts.push(`translate(${transform.translate.x}, ${transform.translate.y})`);
  }
  if (transform.rotate !== undefined) {
    parts.push(`rotate(${transform.rotate})`);
  }
  if (transform.scale !== undefined) {
    if (typeof transform.scale === 'number') {
      parts.push(`scale(${transform.scale})`);
    } else {
      parts.push(`scale(${transform.scale.x}, ${transform.scale.y})`);
    }
  }
  return parts.length ? `transform="${parts.join(' ')}"` : '';
}

export function svg(width: number, height: number, content: string, background?: string): string {
  const bg = background ? `<rect width="100%" height="100%" fill="${background}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${bg}${content}</svg>`;
}

export function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  style: StyleProps = {}
): string {
  const s = styleToAttr(style);
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" ${s}/>`;
}

export function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  style: StyleProps = {}
): string {
  const s = styleToAttr(style);
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${s}/>`;
}

export function polygon(points: Point[], style: StyleProps = {}): string {
  const pts = points.map((p) => `${p.x},${p.y}`).join(' ');
  const s = styleToAttr(style);
  return `<polygon points="${pts}" ${s}/>`;
}

export function polyline(points: Point[], style: StyleProps = {}): string {
  const pts = points.map((p) => `${p.x},${p.y}`).join(' ');
  const s = styleToAttr(style);
  return `<polyline points="${pts}" fill="none" ${s}/>`;
}

export function path(d: string, style: StyleProps = {}): string {
  const s = styleToAttr(style);
  return `<path d="${d}" ${s}/>`;
}

export function circle(cx: number, cy: number, r: number, style: StyleProps = {}): string {
  const s = styleToAttr(style);
  return `<circle cx="${cx}" cy="${cy}" r="${r}" ${s}/>`;
}

export function text(
  x: number,
  y: number,
  content: string,
  style: StyleProps = {}
): string {
  const s = styleToAttr(style);
  return `<text x="${x}" y="${y}" ${s}>${content}</text>`;
}

export function group(content: string, transform: TransformProps = {}): string {
  const t = transformToAttr(transform);
  return `<g ${t}>${content}</g>`;
}

export function defs(content: string): string {
  return `<defs>${content}</defs>`;
}

export function clipPath(id: string, content: string): string {
  return `<clipPath id="${id}">${content}</clipPath>`;
}

export function use(href: string, x: number, y: number): string {
  return `<use href="#${href}" x="${x}" y="${y}"/>`;
}
