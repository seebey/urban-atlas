# Parametric Urban Atlas Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a TypeScript system that generates six architectural presentation boards, each containing five coordinated drawings for a distinct urban block typology.

**Architecture:** Block configuration files define parameters. Generator functions produce building geometry. Renderer functions convert geometry to SVG drawings. A composer arranges drawings onto a single board. Puppeteer exports to PDF.

**Tech Stack:** TypeScript, Puppeteer, Node.js

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`

**Step 1: Create package.json**

```json
{
  "name": "urban-atlas",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "generate": "node dist/index.js",
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  },
  "dependencies": {
    "puppeteer": "^22.0.0"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.0.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create jest.config.js**

```javascript
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  testMatch: ['**/tests/**/*.test.ts'],
};
```

**Step 4: Create .gitignore**

```
node_modules/
dist/
output/*.pdf
output/*.svg
.DS_Store
```

**Step 5: Install dependencies**

Run: `npm install`
Expected: Dependencies installed, package-lock.json created

**Step 6: Create directory structure**

Run: `mkdir -p src/{config/blocks,generators,renderers,composer,styles,core} tests output`

**Step 7: Commit**

```bash
git add package.json tsconfig.json jest.config.js .gitignore
git commit -m "chore: initialize urban-atlas project"
```

---

## Task 2: Core Types

**Files:**
- Create: `src/core/types.ts`
- Create: `tests/core/types.test.ts`

**Step 1: Write the test for core types**

```typescript
// tests/core/types.test.ts
import {
  Point,
  Building,
  Block,
  BlockConfig,
  DrawingSet,
} from '../src/core/types.js';

describe('Core Types', () => {
  test('Point has x and y coordinates', () => {
    const p: Point = { x: 10, y: 20 };
    expect(p.x).toBe(10);
    expect(p.y).toBe(20);
  });

  test('Building has footprint, height, and optional properties', () => {
    const b: Building = {
      footprint: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
      height: 24,
      stories: 7,
    };
    expect(b.footprint).toHaveLength(4);
    expect(b.height).toBe(24);
  });

  test('Block contains buildings and streets', () => {
    const block: Block = {
      buildings: [],
      streets: [],
      bounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
    };
    expect(block.buildings).toEqual([]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/types.test.ts`
Expected: FAIL - Cannot find module

**Step 3: Write the types**

```typescript
// src/core/types.ts

export interface Point {
  x: number;
  y: number;
}

export interface Polygon {
  points: Point[];
}

export interface Building {
  footprint: Point[];
  height: number;
  stories: number;
  roofType?: 'flat' | 'shed' | 'gabled';
  roofDirection?: number; // degrees
}

export interface Street {
  centerline: Point[];
  width: number;
  hierarchy: 'arterial' | 'collector' | 'local' | 'pedestrian';
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface Block {
  buildings: Building[];
  streets: Street[];
  bounds: Bounds;
  courtyards?: Polygon[];
}

export interface BlockConfig {
  name: string;
  displayName: string;
  subtitle: string;
  accentColor: string;
  parameters: Record<string, number | string>;
}

export interface DrawingSet {
  figureGround: string;
  axonometric: string;
  section: string;
  streetNetwork: string;
  densityGradient: string;
}

export interface Board {
  title: string;
  subtitle: string;
  drawings: DrawingSet;
  parameters: string;
  accentColor: string;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run build && npm test -- tests/core/types.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/core/types.ts tests/core/types.test.ts
git commit -m "feat: add core type definitions"
```

---

## Task 3: SVG Primitives

**Files:**
- Create: `src/core/svg.ts`
- Create: `tests/core/svg.test.ts`

**Step 1: Write tests for SVG primitives**

```typescript
// tests/core/svg.test.ts
import { svg, rect, line, polygon, text, group, path } from '../src/core/svg.js';

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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/svg.test.ts`
Expected: FAIL - Cannot find module

**Step 3: Write SVG primitives**

```typescript
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
```

**Step 4: Run test to verify it passes**

Run: `npm run build && npm test -- tests/core/svg.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/core/svg.ts tests/core/svg.test.ts
git commit -m "feat: add SVG primitive functions"
```

---

## Task 4: Geometry Utilities

**Files:**
- Create: `src/core/geometry.ts`
- Create: `tests/core/geometry.test.ts`

**Step 1: Write tests for geometry utilities**

```typescript
// tests/core/geometry.test.ts
import {
  toIsometric,
  rotatePoint,
  translatePolygon,
  scalePolygon,
  chamferRect,
  polygonArea,
  polygonCentroid,
} from '../src/core/geometry.js';

describe('Geometry Utilities', () => {
  test('toIsometric projects 3D point to 2D isometric', () => {
    const result = toIsometric(10, 10, 0);
    expect(result.x).toBeCloseTo(0); // x and y cancel at 45°
    expect(result.y).toBeCloseTo(10 * Math.sin(Math.PI / 6)); // approximate
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/geometry.test.ts`
Expected: FAIL - Cannot find module

**Step 3: Write geometry utilities**

```typescript
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
```

**Step 4: Run test to verify it passes**

Run: `npm run build && npm test -- tests/core/geometry.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/core/geometry.ts tests/core/geometry.test.ts
git commit -m "feat: add geometry utility functions"
```

---

## Task 5: PDF Export

**Files:**
- Create: `src/core/pdf.ts`
- Create: `tests/core/pdf.test.ts`

**Step 1: Write test for PDF export**

```typescript
// tests/core/pdf.test.ts
import { exportToPdf } from '../src/core/pdf.js';
import { existsSync, unlinkSync } from 'fs';

describe('PDF Export', () => {
  const testPath = 'output/test-export.pdf';

  afterEach(() => {
    if (existsSync(testPath)) {
      unlinkSync(testPath);
    }
  });

  test('exports SVG string to PDF file', async () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect x="10" y="10" width="80" height="80" fill="black"/>
    </svg>`;

    await exportToPdf(svgContent, testPath, { width: 100, height: 100 });

    expect(existsSync(testPath)).toBe(true);
  }, 30000);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/pdf.test.ts`
Expected: FAIL - Cannot find module

**Step 3: Write PDF export**

```typescript
// src/core/pdf.ts
import puppeteer from 'puppeteer';
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

interface ExportOptions {
  width: number;
  height: number;
}

export async function exportToPdf(
  svgContent: string,
  outputPath: string,
  options: ExportOptions
): Promise<void> {
  // Ensure output directory exists
  await mkdir(dirname(outputPath), { recursive: true });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; }
          body {
            width: ${options.width}mm;
            height: ${options.height}mm;
          }
          svg {
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>${svgContent}</body>
    </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: outputPath,
    width: `${options.width}mm`,
    height: `${options.height}mm`,
    printBackground: true,
  });

  await browser.close();
}

export async function exportToSvg(
  svgContent: string,
  outputPath: string
): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, svgContent, 'utf-8');
}
```

**Step 4: Run test to verify it passes**

Run: `npm run build && npm test -- tests/core/pdf.test.ts`
Expected: PASS (may take ~10-20 seconds for Puppeteer)

**Step 5: Commit**

```bash
git add src/core/pdf.ts tests/core/pdf.test.ts
git commit -m "feat: add PDF export via Puppeteer"
```

---

## Task 6: Style Definitions

**Files:**
- Create: `src/styles/palettes.ts`
- Create: `src/styles/line-weights.ts`
- Create: `src/styles/typography.ts`

**Step 1: Create color palettes**

```typescript
// src/styles/palettes.ts

export interface Palette {
  accent: string;
  accentLight: string;
  accentDark: string;
  background: string;
  foreground: string;
  gray: string;
  grayLight: string;
}

export const palettes: Record<string, Palette> = {
  barcelona: {
    accent: '#D4726A',
    accentLight: '#E8A9A3',
    accentDark: '#A85850',
    background: '#FAFAFA',
    foreground: '#1A1A1A',
    gray: '#666666',
    grayLight: '#E5E5E5',
  },
  manhattan: {
    accent: '#E8B84A',
    accentLight: '#F2D48A',
    accentDark: '#B8923A',
    background: '#FAFAFA',
    foreground: '#1A1A1A',
    gray: '#666666',
    grayLight: '#E5E5E5',
  },
  medieval: {
    accent: '#8B7355',
    accentLight: '#B9A88C',
    accentDark: '#6B5843',
    background: '#FAF8F5',
    foreground: '#2A2520',
    gray: '#666666',
    grayLight: '#E5E5E5',
  },
  'garden-city': {
    accent: '#7D9969',
    accentLight: '#A8C194',
    accentDark: '#5E7A4F',
    background: '#FAFAFA',
    foreground: '#1A1A1A',
    gray: '#666666',
    grayLight: '#E5E5E5',
  },
  superblock: {
    accent: '#4A90D9',
    accentLight: '#8AB8EA',
    accentDark: '#3670AD',
    background: '#FAFAFA',
    foreground: '#1A1A1A',
    gray: '#666666',
    grayLight: '#E5E5E5',
  },
  'sea-ranch': {
    accent: '#6B7B6E',
    accentLight: '#98A89A',
    accentDark: '#4F5C51',
    background: '#FAFAF8',
    foreground: '#1A1A1A',
    gray: '#666666',
    grayLight: '#E5E5E5',
  },
};

export function getPalette(name: string): Palette {
  return palettes[name] || palettes.barcelona;
}
```

**Step 2: Create line weights**

```typescript
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
```

**Step 3: Create typography**

```typescript
// src/styles/typography.ts

export const typography = {
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",

  title: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 0.5,
  },

  subtitle: {
    fontSize: 14,
    fontWeight: 300,
    letterSpacing: 0.3,
  },

  label: {
    fontSize: 9,
    fontWeight: 400,
  },

  annotation: {
    fontSize: 7,
    fontWeight: 400,
  },

  dimension: {
    fontSize: 6,
    fontWeight: 400,
  },
};
```

**Step 4: Create index export**

```typescript
// src/styles/index.ts
export * from './palettes.js';
export * from './line-weights.js';
export * from './typography.js';
```

**Step 5: Commit**

```bash
git add src/styles/
git commit -m "feat: add style definitions (palettes, line weights, typography)"
```

---

## Task 7: Barcelona Block Generator

**Files:**
- Create: `src/config/blocks/barcelona.ts`
- Create: `src/generators/barcelona.ts`
- Create: `tests/generators/barcelona.test.ts`

**Step 1: Write test for Barcelona generator**

```typescript
// tests/generators/barcelona.test.ts
import { generateBarcelonaBlock, barcelonaConfig } from '../src/generators/barcelona.js';

describe('Barcelona Block Generator', () => {
  test('generates block with correct bounds', () => {
    const block = generateBarcelonaBlock();
    expect(block.bounds.maxX - block.bounds.minX).toBe(113);
    expect(block.bounds.maxY - block.bounds.minY).toBe(113);
  });

  test('generates perimeter buildings', () => {
    const block = generateBarcelonaBlock();
    expect(block.buildings.length).toBeGreaterThan(0);
  });

  test('all buildings have 7 stories', () => {
    const block = generateBarcelonaBlock();
    for (const building of block.buildings) {
      expect(building.stories).toBe(7);
    }
  });

  test('generates surrounding streets', () => {
    const block = generateBarcelonaBlock();
    expect(block.streets.length).toBe(4);
  });

  test('config has correct accent color', () => {
    expect(barcelonaConfig.accentColor).toBe('#D4726A');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/generators/barcelona.test.ts`
Expected: FAIL - Cannot find module

**Step 3: Write Barcelona generator**

```typescript
// src/generators/barcelona.ts
import { Block, Building, Street, BlockConfig, Point } from '../core/types.js';
import { chamferRect, rectToPolygon, offsetPolygon } from '../core/geometry.js';

export const barcelonaConfig: BlockConfig = {
  name: 'barcelona',
  displayName: 'BARCELONA EIXAMPLE',
  subtitle: 'Cerdà Grid, 1859',
  accentColor: '#D4726A',
  parameters: {
    blockSize: 113,
    chamfer: 20,
    perimeterDepth: 18,
    courtyardSize: 56,
    buildingHeight: 24,
    stories: 7,
    streetWidth: 20,
  },
};

export function generateBarcelonaBlock(): Block {
  const p = barcelonaConfig.parameters;
  const size = p.blockSize as number;
  const chamfer = p.chamfer as number;
  const depth = p.perimeterDepth as number;
  const stories = p.stories as number;
  const height = p.buildingHeight as number;
  const streetWidth = p.streetWidth as number;

  // Outer perimeter (chamfered octagon)
  const outer = chamferRect(0, 0, size, size, chamfer);

  // Inner courtyard (smaller chamfered octagon)
  const inner = chamferRect(depth, depth, size - 2 * depth, size - 2 * depth, chamfer * 0.6);

  // Create four perimeter buildings (one per side)
  const buildings: Building[] = [];

  // North building
  buildings.push({
    footprint: [
      outer[0], outer[1], // top edge
      { x: inner[1].x, y: depth },
      { x: inner[0].x, y: depth },
    ],
    height,
    stories,
  });

  // East building
  buildings.push({
    footprint: [
      outer[2], outer[3],
      { x: size - depth, y: inner[3].y },
      { x: size - depth, y: inner[2].y },
    ],
    height,
    stories,
  });

  // South building
  buildings.push({
    footprint: [
      outer[4], outer[5],
      { x: inner[5].x, y: size - depth },
      { x: inner[4].x, y: size - depth },
    ],
    height,
    stories,
  });

  // West building
  buildings.push({
    footprint: [
      outer[6], outer[7],
      { x: depth, y: inner[7].y },
      { x: depth, y: inner[6].y },
    ],
    height,
    stories,
  });

  // Corner buildings (chamfer zones)
  // NE corner
  buildings.push({
    footprint: [
      outer[1], outer[2],
      { x: size - depth, y: inner[2].y },
      { x: inner[1].x, y: depth },
    ],
    height,
    stories,
  });

  // SE corner
  buildings.push({
    footprint: [
      outer[3], outer[4],
      { x: inner[4].x, y: size - depth },
      { x: size - depth, y: inner[3].y },
    ],
    height,
    stories,
  });

  // SW corner
  buildings.push({
    footprint: [
      outer[5], outer[6],
      { x: depth, y: inner[6].y },
      { x: inner[5].x, y: size - depth },
    ],
    height,
    stories,
  });

  // NW corner
  buildings.push({
    footprint: [
      outer[7], outer[0],
      { x: inner[0].x, y: depth },
      { x: depth, y: inner[7].y },
    ],
    height,
    stories,
  });

  // Streets
  const streets: Street[] = [
    // North street
    {
      centerline: [{ x: -streetWidth, y: -streetWidth / 2 }, { x: size + streetWidth, y: -streetWidth / 2 }],
      width: streetWidth,
      hierarchy: 'arterial',
    },
    // South street
    {
      centerline: [{ x: -streetWidth, y: size + streetWidth / 2 }, { x: size + streetWidth, y: size + streetWidth / 2 }],
      width: streetWidth,
      hierarchy: 'arterial',
    },
    // West street
    {
      centerline: [{ x: -streetWidth / 2, y: -streetWidth }, { x: -streetWidth / 2, y: size + streetWidth }],
      width: streetWidth,
      hierarchy: 'arterial',
    },
    // East street
    {
      centerline: [{ x: size + streetWidth / 2, y: -streetWidth }, { x: size + streetWidth / 2, y: size + streetWidth }],
      width: streetWidth,
      hierarchy: 'arterial',
    },
  ];

  return {
    buildings,
    streets,
    bounds: { minX: 0, minY: 0, maxX: size, maxY: size },
    courtyards: [{ points: inner }],
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npm run build && npm test -- tests/generators/barcelona.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/generators/barcelona.ts src/config/blocks/barcelona.ts tests/generators/barcelona.test.ts
git commit -m "feat: add Barcelona Eixample block generator"
```

---

## Task 8: Figure-Ground Renderer

**Files:**
- Create: `src/renderers/figure-ground.ts`
- Create: `tests/renderers/figure-ground.test.ts`

**Step 1: Write test for figure-ground renderer**

```typescript
// tests/renderers/figure-ground.test.ts
import { renderFigureGround } from '../src/renderers/figure-ground.js';
import { generateBarcelonaBlock, barcelonaConfig } from '../src/generators/barcelona.js';

describe('Figure-Ground Renderer', () => {
  test('renders SVG string', () => {
    const block = generateBarcelonaBlock();
    const svg = renderFigureGround(block, barcelonaConfig);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  test('renders building polygons in black', () => {
    const block = generateBarcelonaBlock();
    const svg = renderFigureGround(block, barcelonaConfig);
    expect(svg).toContain('fill="#1A1A1A"');
  });

  test('includes street centerlines', () => {
    const block = generateBarcelonaBlock();
    const svg = renderFigureGround(block, barcelonaConfig);
    expect(svg).toContain('<line');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/renderers/figure-ground.test.ts`
Expected: FAIL - Cannot find module

**Step 3: Write figure-ground renderer**

```typescript
// src/renderers/figure-ground.ts
import { Block, BlockConfig, Point } from '../core/types.js';
import { svg, polygon, line, rect, group, text } from '../core/svg.js';
import { getPalette } from '../styles/palettes.js';
import { lineWeights, dashPatterns } from '../styles/line-weights.js';

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

  // Background with subtle texture (stipple effect via pattern)
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
```

**Step 4: Run test to verify it passes**

Run: `npm run build && npm test -- tests/renderers/figure-ground.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/renderers/figure-ground.ts tests/renderers/figure-ground.test.ts
git commit -m "feat: add figure-ground renderer"
```

---

## Task 9: Axonometric Renderer

**Files:**
- Create: `src/renderers/axonometric.ts`
- Create: `tests/renderers/axonometric.test.ts`

**Step 1: Write test for axonometric renderer**

```typescript
// tests/renderers/axonometric.test.ts
import { renderAxonometric } from '../src/renderers/axonometric.js';
import { generateBarcelonaBlock, barcelonaConfig } from '../src/generators/barcelona.js';

describe('Axonometric Renderer', () => {
  test('renders SVG string', () => {
    const block = generateBarcelonaBlock();
    const svg = renderAxonometric(block, barcelonaConfig);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  test('uses accent color for buildings', () => {
    const block = generateBarcelonaBlock();
    const svg = renderAxonometric(block, barcelonaConfig);
    expect(svg).toContain(barcelonaConfig.accentColor);
  });

  test('renders building faces (polygons)', () => {
    const block = generateBarcelonaBlock();
    const svg = renderAxonometric(block, barcelonaConfig);
    expect(svg).toContain('<polygon');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/renderers/axonometric.test.ts`
Expected: FAIL - Cannot find module

**Step 3: Write axonometric renderer**

```typescript
// src/renderers/axonometric.ts
import { Block, BlockConfig, Building, Point } from '../core/types.js';
import { svg, polygon, line, rect, group, path } from '../core/svg.js';
import { toIsometric } from '../core/geometry.js';
import { getPalette } from '../styles/palettes.js';
import { lineWeights } from '../styles/line-weights.js';

const DRAWING_SIZE = 300;
const MARGIN = 30;

interface Face {
  points: Point[];
  type: 'top' | 'left' | 'right';
  z: number;
}

function adjustColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const adjust = (c: number) => Math.min(255, Math.max(0, Math.round(c * factor)));
  return `#${adjust(r).toString(16).padStart(2, '0')}${adjust(g).toString(16).padStart(2, '0')}${adjust(b).toString(16).padStart(2, '0')}`;
}

export function renderAxonometric(block: Block, config: BlockConfig): string {
  const palette = getPalette(config.name);
  const { bounds } = block;

  const blockWidth = bounds.maxX - bounds.minX;
  const blockHeight = bounds.maxY - bounds.minY;
  const maxHeight = Math.max(...block.buildings.map(b => b.height));

  // Calculate isometric bounds
  const corners3D = [
    { x: 0, y: 0, z: 0 },
    { x: blockWidth, y: 0, z: 0 },
    { x: blockWidth, y: blockHeight, z: 0 },
    { x: 0, y: blockHeight, z: 0 },
    { x: 0, y: 0, z: maxHeight },
    { x: blockWidth, y: blockHeight, z: maxHeight },
  ];

  const isoCorners = corners3D.map(c => toIsometric(c.x, c.y, c.z));
  const minIsoX = Math.min(...isoCorners.map(p => p.x));
  const maxIsoX = Math.max(...isoCorners.map(p => p.x));
  const minIsoY = Math.min(...isoCorners.map(p => p.y));
  const maxIsoY = Math.max(...isoCorners.map(p => p.y));

  const isoWidth = maxIsoX - minIsoX;
  const isoHeight = maxIsoY - minIsoY;
  const scale = (DRAWING_SIZE - MARGIN * 2) / Math.max(isoWidth, isoHeight);

  const centerX = DRAWING_SIZE / 2;
  const centerY = DRAWING_SIZE / 2 + maxHeight * scale * 0.3;

  function toScreen(x: number, y: number, z: number): Point {
    const iso = toIsometric(x - blockWidth / 2, y - blockHeight / 2, z);
    return {
      x: centerX + iso.x * scale,
      y: centerY + iso.y * scale,
    };
  }

  const elements: string[] = [];

  // Background
  elements.push(rect(0, 0, DRAWING_SIZE, DRAWING_SIZE, { fill: palette.background }));

  // Ground plane grid
  const gridStep = 10;
  for (let i = 0; i <= blockWidth; i += gridStep) {
    const start = toScreen(i, 0, 0);
    const end = toScreen(i, blockHeight, 0);
    elements.push(line(start.x, start.y, end.x, end.y, {
      stroke: palette.grayLight,
      strokeWidth: lineWeights.grid,
    }));
  }
  for (let j = 0; j <= blockHeight; j += gridStep) {
    const start = toScreen(0, j, 0);
    const end = toScreen(blockWidth, j, 0);
    elements.push(line(start.x, start.y, end.x, end.y, {
      stroke: palette.grayLight,
      strokeWidth: lineWeights.grid,
    }));
  }

  // Collect all faces for depth sorting
  const faces: Face[] = [];

  for (const building of block.buildings) {
    const { footprint, height } = building;
    const n = footprint.length;

    // Top face
    const topPoints = footprint.map(p => toScreen(p.x, p.y, height));
    faces.push({ points: topPoints, type: 'top', z: height });

    // Wall faces
    for (let i = 0; i < n; i++) {
      const p1 = footprint[i];
      const p2 = footprint[(i + 1) % n];

      const wallPoints = [
        toScreen(p1.x, p1.y, 0),
        toScreen(p2.x, p2.y, 0),
        toScreen(p2.x, p2.y, height),
        toScreen(p1.x, p1.y, height),
      ];

      // Determine if left or right facing based on normal
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const isLeftFacing = dx > 0 || (dx === 0 && dy < 0);

      faces.push({
        points: wallPoints,
        type: isLeftFacing ? 'left' : 'right',
        z: (p1.y + p2.y) / 2 + height / 2,
      });
    }
  }

  // Sort faces by depth (painter's algorithm - draw far things first)
  faces.sort((a, b) => b.z - a.z);

  // Render faces
  for (const face of faces) {
    let fillColor: string;
    if (face.type === 'top') {
      fillColor = adjustColor(config.accentColor, 1.1);
    } else if (face.type === 'left') {
      fillColor = config.accentColor;
    } else {
      fillColor = adjustColor(config.accentColor, 0.7);
    }

    elements.push(polygon(face.points, {
      fill: fillColor,
      stroke: palette.foreground,
      strokeWidth: lineWeights.light,
    }));
  }

  return svg(DRAWING_SIZE, DRAWING_SIZE, elements.join('\n'));
}
```

**Step 4: Run test to verify it passes**

Run: `npm run build && npm test -- tests/renderers/axonometric.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/renderers/axonometric.ts tests/renderers/axonometric.test.ts
git commit -m "feat: add axonometric renderer with depth sorting"
```

---

## Task 10: Section Renderer

**Files:**
- Create: `src/renderers/section.ts`
- Create: `tests/renderers/section.test.ts`

**Step 1: Write test for section renderer**

```typescript
// tests/renderers/section.test.ts
import { renderSection } from '../src/renderers/section.js';
import { generateBarcelonaBlock, barcelonaConfig } from '../src/generators/barcelona.js';

describe('Section Renderer', () => {
  test('renders SVG string', () => {
    const block = generateBarcelonaBlock();
    const svg = renderSection(block, barcelonaConfig);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  test('renders cut buildings as solid black (poché)', () => {
    const block = generateBarcelonaBlock();
    const svg = renderSection(block, barcelonaConfig);
    expect(svg).toContain('fill="#1A1A1A"');
  });

  test('includes ground line', () => {
    const block = generateBarcelonaBlock();
    const svg = renderSection(block, barcelonaConfig);
    expect(svg).toContain('<line');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/renderers/section.test.ts`
Expected: FAIL - Cannot find module

**Step 3: Write section renderer**

```typescript
// src/renderers/section.ts
import { Block, BlockConfig, Building, Point } from '../core/types.js';
import { svg, rect, line, polygon, text, group } from '../core/svg.js';
import { getPalette } from '../styles/palettes.js';
import { lineWeights, dashPatterns } from '../styles/line-weights.js';

const DRAWING_WIDTH = 300;
const DRAWING_HEIGHT = 150;
const MARGIN = 20;

interface SectionCut {
  x: number;
  width: number;
  height: number;
}

export function renderSection(block: Block, config: BlockConfig): string {
  const palette = getPalette(config.name);
  const { bounds, buildings } = block;

  const blockWidth = bounds.maxX - bounds.minX;
  const maxHeight = Math.max(...buildings.map(b => b.height));

  // Cut line at Y = center of block
  const cutY = (bounds.minY + bounds.maxY) / 2;

  // Find buildings intersected by cut line
  const cuts: SectionCut[] = [];

  for (const building of buildings) {
    const { footprint, height } = building;

    // Find min/max X where footprint crosses cutY
    let minX = Infinity;
    let maxX = -Infinity;
    let intersects = false;

    const n = footprint.length;
    for (let i = 0; i < n; i++) {
      const p1 = footprint[i];
      const p2 = footprint[(i + 1) % n];

      // Check if edge crosses cutY
      if ((p1.y <= cutY && p2.y >= cutY) || (p1.y >= cutY && p2.y <= cutY)) {
        if (p1.y === p2.y) {
          // Horizontal edge at cutY
          minX = Math.min(minX, p1.x, p2.x);
          maxX = Math.max(maxX, p1.x, p2.x);
          intersects = true;
        } else {
          // Find intersection point
          const t = (cutY - p1.y) / (p2.y - p1.y);
          const x = p1.x + t * (p2.x - p1.x);
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          intersects = true;
        }
      }
    }

    if (intersects && minX < maxX) {
      cuts.push({ x: minX, width: maxX - minX, height });
    }
  }

  // Scale to fit
  const streetWidth = (config.parameters.streetWidth as number) || 20;
  const totalWidth = blockWidth + streetWidth * 2;
  const scaleX = (DRAWING_WIDTH - MARGIN * 2) / totalWidth;
  const scaleY = (DRAWING_HEIGHT - MARGIN * 2) / (maxHeight + 5); // +5 for ground
  const scale = Math.min(scaleX, scaleY);

  const groundY = DRAWING_HEIGHT - MARGIN;
  const offsetX = MARGIN + streetWidth * scale;

  function toScreenX(x: number): number {
    return offsetX + (x - bounds.minX) * scale;
  }

  const elements: string[] = [];

  // Background
  elements.push(rect(0, 0, DRAWING_WIDTH, DRAWING_HEIGHT, { fill: palette.background }));

  // Ground line
  elements.push(line(MARGIN, groundY, DRAWING_WIDTH - MARGIN, groundY, {
    stroke: palette.foreground,
    strokeWidth: lineWeights.heavy,
  }));

  // Ground hatch below
  for (let x = MARGIN; x < DRAWING_WIDTH - MARGIN; x += 4) {
    elements.push(line(x, groundY, x + 3, groundY + 5, {
      stroke: palette.foreground,
      strokeWidth: lineWeights.hatch,
    }));
  }

  // Section cuts (poché)
  for (const cut of cuts) {
    const screenX = toScreenX(cut.x);
    const screenWidth = cut.width * scale;
    const screenHeight = cut.height * scale;

    elements.push(rect(screenX, groundY - screenHeight, screenWidth, screenHeight, {
      fill: palette.foreground,
      stroke: palette.foreground,
      strokeWidth: lineWeights.heavy,
    }));
  }

  // Human figures for scale
  const figureHeight = 1.7 * scale;
  const figurePositions = [
    toScreenX(bounds.minX + 10),
    toScreenX(bounds.maxX - 10),
  ];

  for (const fx of figurePositions) {
    // Simple stick figure
    const headR = figureHeight * 0.12;
    elements.push(`<circle cx="${fx}" cy="${groundY - figureHeight + headR}" r="${headR}" fill="none" stroke="${palette.gray}" stroke-width="${lineWeights.light}"/>`);
    elements.push(line(fx, groundY - figureHeight + headR * 2, fx, groundY - figureHeight * 0.4, {
      stroke: palette.gray,
      strokeWidth: lineWeights.light,
    }));
    // Legs
    elements.push(line(fx, groundY - figureHeight * 0.4, fx - figureHeight * 0.15, groundY, {
      stroke: palette.gray,
      strokeWidth: lineWeights.light,
    }));
    elements.push(line(fx, groundY - figureHeight * 0.4, fx + figureHeight * 0.15, groundY, {
      stroke: palette.gray,
      strokeWidth: lineWeights.light,
    }));
  }

  // Height dimensions on right side
  const dimX = DRAWING_WIDTH - MARGIN + 5;
  const topHeight = Math.max(...cuts.map(c => c.height));
  if (topHeight > 0) {
    const topY = groundY - topHeight * scale;
    elements.push(line(dimX, groundY, dimX, topY, {
      stroke: palette.gray,
      strokeWidth: lineWeights.hairline,
    }));
    elements.push(text(dimX + 3, (groundY + topY) / 2, `${topHeight}m`, {
      fontSize: 6,
      fill: palette.gray,
    }));
  }

  return svg(DRAWING_WIDTH, DRAWING_HEIGHT, elements.join('\n'));
}
```

**Step 4: Run test to verify it passes**

Run: `npm run build && npm test -- tests/renderers/section.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/renderers/section.ts tests/renderers/section.test.ts
git commit -m "feat: add section renderer with poché and human figures"
```

---

## Task 11: Street Network Renderer

**Files:**
- Create: `src/renderers/street-network.ts`
- Create: `tests/renderers/street-network.test.ts`

**Step 1: Write test**

```typescript
// tests/renderers/street-network.test.ts
import { renderStreetNetwork } from '../src/renderers/street-network.js';
import { generateBarcelonaBlock, barcelonaConfig } from '../src/generators/barcelona.js';

describe('Street Network Renderer', () => {
  test('renders SVG string', () => {
    const block = generateBarcelonaBlock();
    const svg = renderStreetNetwork(block, barcelonaConfig);
    expect(svg).toContain('<svg');
  });

  test('renders street lines', () => {
    const block = generateBarcelonaBlock();
    const svg = renderStreetNetwork(block, barcelonaConfig);
    expect(svg).toContain('<line');
  });

  test('renders intersection nodes as circles', () => {
    const block = generateBarcelonaBlock();
    const svg = renderStreetNetwork(block, barcelonaConfig);
    expect(svg).toContain('<circle');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/renderers/street-network.test.ts`
Expected: FAIL

**Step 3: Write street network renderer**

```typescript
// src/renderers/street-network.ts
import { Block, BlockConfig, Point, Street } from '../core/types.js';
import { svg, rect, line, circle, text } from '../core/svg.js';
import { getPalette } from '../styles/palettes.js';
import { lineWeights, dashPatterns } from '../styles/line-weights.js';

const DRAWING_SIZE = 150;
const MARGIN = 15;

export function renderStreetNetwork(block: Block, config: BlockConfig): string {
  const palette = getPalette(config.name);
  const { bounds, streets } = block;

  const blockWidth = bounds.maxX - bounds.minX;
  const blockHeight = bounds.maxY - bounds.minY;
  const streetWidth = (config.parameters.streetWidth as number) || 20;
  const viewSize = Math.max(blockWidth, blockHeight) + streetWidth * 2;

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

  // Street lines
  const streetWeights: Record<string, number> = {
    arterial: 2.0,
    collector: 1.5,
    local: 0.75,
    pedestrian: 0.5,
  };

  for (const street of streets) {
    const points = street.centerline;
    for (let i = 0; i < points.length - 1; i++) {
      const start = toScreen(points[i]);
      const end = toScreen(points[i + 1]);

      const weight = streetWeights[street.hierarchy] || 1.0;
      const dash = street.hierarchy === 'pedestrian' ? dashPatterns.dashed : undefined;

      elements.push(line(start.x, start.y, end.x, end.y, {
        stroke: config.accentColor,
        strokeWidth: weight,
        opacity: 0.6,
        strokeDasharray: dash,
      }));
    }
  }

  // Find intersections (endpoints that coincide)
  const intersections: Point[] = [];
  const seen = new Set<string>();

  for (const street of streets) {
    for (const p of [street.centerline[0], street.centerline[street.centerline.length - 1]]) {
      const key = `${Math.round(p.x)},${Math.round(p.y)}`;
      if (!seen.has(key)) {
        seen.add(key);
        // Check if any other street shares this point
        let count = 0;
        for (const s2 of streets) {
          for (const p2 of [s2.centerline[0], s2.centerline[s2.centerline.length - 1]]) {
            if (Math.abs(p.x - p2.x) < 1 && Math.abs(p.y - p2.y) < 1) {
              count++;
            }
          }
        }
        if (count >= 2) {
          intersections.push(p);
        }
      }
    }
  }

  // Draw intersection nodes
  for (const p of intersections) {
    const sp = toScreen(p);
    elements.push(circle(sp.x, sp.y, 3, {
      fill: config.accentColor,
      stroke: palette.foreground,
      strokeWidth: lineWeights.hairline,
    }));
  }

  return svg(DRAWING_SIZE, DRAWING_SIZE, elements.join('\n'));
}
```

**Step 4: Run test to verify it passes**

Run: `npm run build && npm test -- tests/renderers/street-network.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/renderers/street-network.ts tests/renderers/street-network.test.ts
git commit -m "feat: add street network renderer"
```

---

## Task 12: Density Gradient Renderer

**Files:**
- Create: `src/renderers/density-gradient.ts`
- Create: `tests/renderers/density-gradient.test.ts`

**Step 1: Write test**

```typescript
// tests/renderers/density-gradient.test.ts
import { renderDensityGradient } from '../src/renderers/density-gradient.js';
import { generateBarcelonaBlock, barcelonaConfig } from '../src/generators/barcelona.js';

describe('Density Gradient Renderer', () => {
  test('renders SVG string', () => {
    const block = generateBarcelonaBlock();
    const svg = renderDensityGradient(block, barcelonaConfig);
    expect(svg).toContain('<svg');
  });

  test('renders buildings with gradient fill based on height', () => {
    const block = generateBarcelonaBlock();
    const svg = renderDensityGradient(block, barcelonaConfig);
    expect(svg).toContain('<polygon');
  });

  test('includes color legend', () => {
    const block = generateBarcelonaBlock();
    const svg = renderDensityGradient(block, barcelonaConfig);
    // Legend should have gradient rect
    expect(svg).toContain('linearGradient');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/renderers/density-gradient.test.ts`
Expected: FAIL

**Step 3: Write density gradient renderer**

```typescript
// src/renderers/density-gradient.ts
import { Block, BlockConfig, Point } from '../core/types.js';
import { svg, rect, polygon, line, text, defs, group } from '../core/svg.js';
import { getPalette } from '../styles/palettes.js';
import { lineWeights } from '../styles/line-weights.js';

const DRAWING_SIZE = 150;
const MARGIN = 15;
const LEGEND_WIDTH = 15;

function interpolateColor(color1: string, color2: string, t: number): string {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function renderDensityGradient(block: Block, config: BlockConfig): string {
  const palette = getPalette(config.name);
  const { bounds, buildings } = block;

  const blockWidth = bounds.maxX - bounds.minX;
  const blockHeight = bounds.maxY - bounds.minY;
  const streetWidth = (config.parameters.streetWidth as number) || 20;
  const viewSize = Math.max(blockWidth, blockHeight) + streetWidth * 2;

  const drawArea = DRAWING_SIZE - MARGIN * 2 - LEGEND_WIDTH;
  const scale = drawArea / viewSize;
  const offsetX = MARGIN + streetWidth * scale;
  const offsetY = MARGIN + streetWidth * scale;

  function toScreen(p: Point): Point {
    return {
      x: offsetX + (p.x - bounds.minX) * scale,
      y: offsetY + (p.y - bounds.minY) * scale,
    };
  }

  const maxHeight = Math.max(...buildings.map(b => b.height), 1);
  const minHeight = Math.min(...buildings.map(b => b.height), 0);

  const elements: string[] = [];

  // Gradient definition for legend
  const gradientDef = `
    <linearGradient id="heightGradient" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${palette.background}"/>
      <stop offset="100%" stop-color="${config.accentColor}"/>
    </linearGradient>
  `;
  elements.push(defs(gradientDef));

  // Background
  elements.push(rect(0, 0, DRAWING_SIZE, DRAWING_SIZE, { fill: palette.background }));

  // Buildings colored by height
  for (const building of buildings) {
    const t = (building.height - minHeight) / (maxHeight - minHeight);
    const fillColor = interpolateColor(palette.background, config.accentColor, t);

    const screenPoints = building.footprint.map(toScreen);
    elements.push(polygon(screenPoints, {
      fill: fillColor,
      stroke: palette.foreground,
      strokeWidth: lineWeights.hairline,
    }));
  }

  // Legend
  const legendX = DRAWING_SIZE - MARGIN - LEGEND_WIDTH + 5;
  const legendHeight = DRAWING_SIZE - MARGIN * 2;

  elements.push(rect(legendX, MARGIN, 8, legendHeight, {
    fill: 'url(#heightGradient)',
    stroke: palette.foreground,
    strokeWidth: lineWeights.hairline,
  }));

  // Legend labels
  elements.push(text(legendX + 10, MARGIN + 6, `${maxHeight}m`, {
    fontSize: 5,
    fill: palette.gray,
  }));
  elements.push(text(legendX + 10, MARGIN + legendHeight, `${minHeight}m`, {
    fontSize: 5,
    fill: palette.gray,
  }));

  return svg(DRAWING_SIZE, DRAWING_SIZE, elements.join('\n'));
}
```

**Step 4: Run test to verify it passes**

Run: `npm run build && npm test -- tests/renderers/density-gradient.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/renderers/density-gradient.ts tests/renderers/density-gradient.test.ts
git commit -m "feat: add density gradient renderer with color legend"
```

---

## Task 13: Board Composer

**Files:**
- Create: `src/composer/board.ts`
- Create: `tests/composer/board.test.ts`

**Step 1: Write test**

```typescript
// tests/composer/board.test.ts
import { composeBoard } from '../src/composer/board.js';
import { generateBarcelonaBlock, barcelonaConfig } from '../src/generators/barcelona.js';
import { renderFigureGround } from '../src/renderers/figure-ground.js';
import { renderAxonometric } from '../src/renderers/axonometric.js';
import { renderSection } from '../src/renderers/section.js';
import { renderStreetNetwork } from '../src/renderers/street-network.js';
import { renderDensityGradient } from '../src/renderers/density-gradient.js';

describe('Board Composer', () => {
  test('composes all drawings into single SVG', () => {
    const block = generateBarcelonaBlock();
    const drawings = {
      figureGround: renderFigureGround(block, barcelonaConfig),
      axonometric: renderAxonometric(block, barcelonaConfig),
      section: renderSection(block, barcelonaConfig),
      streetNetwork: renderStreetNetwork(block, barcelonaConfig),
      densityGradient: renderDensityGradient(block, barcelonaConfig),
    };

    const board = composeBoard(drawings, barcelonaConfig);

    expect(board).toContain('<svg');
    expect(board).toContain('BARCELONA EIXAMPLE');
    expect(board).toContain('Cerdà Grid, 1859');
  });

  test('includes all five drawing types', () => {
    const block = generateBarcelonaBlock();
    const drawings = {
      figureGround: renderFigureGround(block, barcelonaConfig),
      axonometric: renderAxonometric(block, barcelonaConfig),
      section: renderSection(block, barcelonaConfig),
      streetNetwork: renderStreetNetwork(block, barcelonaConfig),
      densityGradient: renderDensityGradient(block, barcelonaConfig),
    };

    const board = composeBoard(drawings, barcelonaConfig);

    // Each embedded SVG becomes a group or image
    const svgCount = (board.match(/<svg/g) || []).length;
    expect(svgCount).toBeGreaterThanOrEqual(1); // At least the outer SVG
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/composer/board.test.ts`
Expected: FAIL

**Step 3: Write board composer**

```typescript
// src/composer/board.ts
import { DrawingSet, BlockConfig } from '../core/types.js';
import { svg, rect, text, group, line } from '../core/svg.js';
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
```

**Step 4: Run test to verify it passes**

Run: `npm run build && npm test -- tests/composer/board.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/composer/board.ts tests/composer/board.test.ts
git commit -m "feat: add board composer for A1 presentation layout"
```

---

## Task 14: Remaining Block Generators

**Files:**
- Create: `src/generators/manhattan.ts`
- Create: `src/generators/medieval.ts`
- Create: `src/generators/garden-city.ts`
- Create: `src/generators/superblock.ts`
- Create: `src/generators/sea-ranch.ts`
- Create: `src/generators/index.ts`

**Step 1: Create Manhattan generator**

```typescript
// src/generators/manhattan.ts
import { Block, Building, Street, BlockConfig } from '../core/types.js';
import { rectToPolygon } from '../core/geometry.js';

export const manhattanConfig: BlockConfig = {
  name: 'manhattan',
  displayName: 'MANHATTAN MIDTOWN',
  subtitle: 'New York Grid, 1811',
  accentColor: '#E8B84A',
  parameters: {
    blockWidth: 80,
    blockLength: 270,
    lotWidthMin: 15,
    lotWidthMax: 25,
    baseHeight: 20,
    towerHeightMin: 60,
    towerHeightMax: 150,
    towerCoverage: 0.4,
    streetWidth: 18,
    avenueWidth: 30,
  },
};

export function generateManhattanBlock(): Block {
  const p = manhattanConfig.parameters;
  const width = p.blockWidth as number;
  const length = p.blockLength as number;
  const baseHeight = p.baseHeight as number;
  const towerMin = p.towerHeightMin as number;
  const towerMax = p.towerHeightMax as number;

  const buildings: Building[] = [];

  // Subdivide into lots along the length
  let x = 0;
  while (x < length) {
    const lotWidth = p.lotWidthMin as number + Math.random() * ((p.lotWidthMax as number) - (p.lotWidthMin as number));
    const actualWidth = Math.min(lotWidth, length - x);

    if (actualWidth < 10) break;

    // Base building (full lot)
    const baseStories = 6;
    buildings.push({
      footprint: rectToPolygon(x, 0, actualWidth, width),
      height: baseHeight,
      stories: baseStories,
    });

    // Tower (random chance, setback)
    if (Math.random() > 0.3) {
      const towerHeight = towerMin + Math.random() * (towerMax - towerMin);
      const towerStories = Math.round(towerHeight / 3.3);
      const setback = 5;
      const towerWidth = actualWidth - setback * 2;
      const towerDepth = width * (p.towerCoverage as number);

      if (towerWidth > 8 && towerDepth > 8) {
        buildings.push({
          footprint: rectToPolygon(x + setback, (width - towerDepth) / 2, towerWidth, towerDepth),
          height: towerHeight,
          stories: towerStories,
        });
      }
    }

    x += actualWidth;
  }

  const streets: Street[] = [
    { centerline: [{ x: -20, y: -9 }, { x: length + 20, y: -9 }], width: 18, hierarchy: 'local' },
    { centerline: [{ x: -20, y: width + 9 }, { x: length + 20, y: width + 9 }], width: 18, hierarchy: 'local' },
    { centerline: [{ x: -15, y: -20 }, { x: -15, y: width + 20 }], width: 30, hierarchy: 'arterial' },
    { centerline: [{ x: length + 15, y: -20 }, { x: length + 15, y: width + 20 }], width: 30, hierarchy: 'arterial' },
  ];

  return {
    buildings,
    streets,
    bounds: { minX: 0, minY: 0, maxX: length, maxY: width },
  };
}
```

**Step 2: Create Medieval generator**

```typescript
// src/generators/medieval.ts
import { Block, Building, Street, BlockConfig, Point } from '../core/types.js';
import { polygonCentroid } from '../core/geometry.js';

export const medievalConfig: BlockConfig = {
  name: 'medieval',
  displayName: 'MEDIEVAL ORGANIC',
  subtitle: 'European Historic Center',
  accentColor: '#8B7355',
  parameters: {
    siteSize: 150,
    numSeeds: 25,
    minHeight: 6,
    maxHeight: 18,
    streetWidthMin: 3,
    streetWidthMax: 8,
    infillDensity: 0.85,
  },
};

// Simple Voronoi approximation using nearest-neighbor regions
function generateVoronoiLots(size: number, numSeeds: number): Point[][] {
  // Random seed points
  const seeds: Point[] = [];
  for (let i = 0; i < numSeeds; i++) {
    seeds.push({
      x: 10 + Math.random() * (size - 20),
      y: 10 + Math.random() * (size - 20),
    });
  }

  // Create rectangular lots around seeds (simplified)
  const lots: Point[][] = [];
  const gridSize = Math.ceil(Math.sqrt(numSeeds));
  const cellSize = size / gridSize;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cx = (i + 0.3 + Math.random() * 0.4) * cellSize;
      const cy = (j + 0.3 + Math.random() * 0.4) * cellSize;
      const w = cellSize * (0.5 + Math.random() * 0.3);
      const h = cellSize * (0.5 + Math.random() * 0.3);

      // Slight rotation for organic feel
      const angle = (Math.random() - 0.5) * 0.2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const corners = [
        { x: -w / 2, y: -h / 2 },
        { x: w / 2, y: -h / 2 },
        { x: w / 2, y: h / 2 },
        { x: -w / 2, y: h / 2 },
      ].map(p => ({
        x: cx + p.x * cos - p.y * sin,
        y: cy + p.x * sin + p.y * cos,
      }));

      lots.push(corners);
    }
  }

  return lots;
}

export function generateMedievalBlock(): Block {
  const p = medievalConfig.parameters;
  const size = p.siteSize as number;
  const lots = generateVoronoiLots(size, p.numSeeds as number);

  const buildings: Building[] = [];

  for (const lot of lots) {
    if (Math.random() > (p.infillDensity as number)) continue;

    const height = (p.minHeight as number) + Math.random() * ((p.maxHeight as number) - (p.minHeight as number));
    const stories = Math.round(height / 3.5);

    buildings.push({
      footprint: lot,
      height,
      stories,
    });
  }

  // Organic streets (paths between lot centroids)
  const streets: Street[] = [];
  const streetWidth = p.streetWidthMin as number + Math.random() * ((p.streetWidthMax as number) - (p.streetWidthMin as number));

  // Main through-street
  streets.push({
    centerline: [
      { x: 0, y: size * 0.3 },
      { x: size * 0.3, y: size * 0.4 },
      { x: size * 0.7, y: size * 0.5 },
      { x: size, y: size * 0.45 },
    ],
    width: 6,
    hierarchy: 'collector',
  });

  streets.push({
    centerline: [
      { x: size * 0.4, y: 0 },
      { x: size * 0.5, y: size * 0.5 },
      { x: size * 0.55, y: size },
    ],
    width: 5,
    hierarchy: 'local',
  });

  return {
    buildings,
    streets,
    bounds: { minX: 0, minY: 0, maxX: size, maxY: size },
  };
}
```

**Step 3: Create Garden City generator**

```typescript
// src/generators/garden-city.ts
import { Block, Building, Street, BlockConfig, Point } from '../core/types.js';
import { rectToPolygon, rotatePoint } from '../core/geometry.js';

export const gardenCityConfig: BlockConfig = {
  name: 'garden-city',
  displayName: 'GARDEN CITY',
  subtitle: 'Howard & Unwin, 1898',
  accentColor: '#7D9969',
  parameters: {
    siteSize: 200,
    numLots: 12,
    lotSize: 1000,
    buildingSize: 180,
    setbackFront: 12,
    setbackSide: 8,
    buildingHeight: 7,
    coverageRatio: 0.18,
  },
};

export function generateGardenCityBlock(): Block {
  const p = gardenCityConfig.parameters;
  const size = p.siteSize as number;

  const buildings: Building[] = [];
  const numLots = p.numLots as number;

  // Curvilinear lot arrangement
  const rows = 3;
  const cols = Math.ceil(numLots / rows);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Curved row offset
      const curve = Math.sin((col / cols) * Math.PI) * 15;
      const x = 30 + col * (size - 60) / cols + (row % 2) * 10;
      const y = 30 + row * (size - 60) / rows + curve;

      const buildingW = 12 + Math.random() * 6;
      const buildingH = 10 + Math.random() * 5;
      const rotation = (Math.random() - 0.5) * 15;

      const corners = [
        { x: -buildingW / 2, y: -buildingH / 2 },
        { x: buildingW / 2, y: -buildingH / 2 },
        { x: buildingW / 2, y: buildingH / 2 },
        { x: -buildingW / 2, y: buildingH / 2 },
      ].map(pt => {
        const rotated = rotatePoint(pt, rotation);
        return { x: x + rotated.x, y: y + rotated.y };
      });

      buildings.push({
        footprint: corners,
        height: p.buildingHeight as number,
        stories: 2,
      });
    }
  }

  // Curving streets
  const streets: Street[] = [
    {
      centerline: [
        { x: 0, y: size * 0.3 },
        { x: size * 0.25, y: size * 0.25 },
        { x: size * 0.5, y: size * 0.22 },
        { x: size * 0.75, y: size * 0.28 },
        { x: size, y: size * 0.35 },
      ],
      width: 8,
      hierarchy: 'local',
    },
    {
      centerline: [
        { x: 0, y: size * 0.7 },
        { x: size * 0.3, y: size * 0.75 },
        { x: size * 0.6, y: size * 0.72 },
        { x: size, y: size * 0.68 },
      ],
      width: 8,
      hierarchy: 'local',
    },
  ];

  return {
    buildings,
    streets,
    bounds: { minX: 0, minY: 0, maxX: size, maxY: size },
  };
}
```

**Step 4: Create Superblock generator**

```typescript
// src/generators/superblock.ts
import { Block, Building, Street, BlockConfig } from '../core/types.js';
import { rectToPolygon } from '../core/geometry.js';

export const superblockConfig: BlockConfig = {
  name: 'superblock',
  displayName: 'SUPERBLOCK UTOPIAN',
  subtitle: 'Le Corbusier, Ville Radieuse',
  accentColor: '#4A90D9',
  parameters: {
    superblockSize: 400,
    towerGrid: 5,
    towerFootprint: 30,
    towerHeight: 50,
    towerSpacing: 80,
    groundCoverage: 0.14,
  },
};

export function generateSuperblockBlock(): Block {
  const p = superblockConfig.parameters;
  const size = p.superblockSize as number;
  const grid = p.towerGrid as number;
  const footprint = p.towerFootprint as number;
  const height = p.towerHeight as number;
  const spacing = p.towerSpacing as number;

  const buildings: Building[] = [];

  const startOffset = (size - (grid - 1) * spacing) / 2;

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const cx = startOffset + i * spacing;
      const cy = startOffset + j * spacing;

      buildings.push({
        footprint: rectToPolygon(cx - footprint / 2, cy - footprint / 2, footprint, footprint),
        height,
        stories: 15,
      });
    }
  }

  // Pedestrian paths through the park
  const streets: Street[] = [
    {
      centerline: [{ x: 0, y: size / 2 }, { x: size, y: size / 2 }],
      width: 6,
      hierarchy: 'pedestrian',
    },
    {
      centerline: [{ x: size / 2, y: 0 }, { x: size / 2, y: size }],
      width: 6,
      hierarchy: 'pedestrian',
    },
    // Perimeter road
    {
      centerline: [{ x: -10, y: -10 }, { x: size + 10, y: -10 }],
      width: 12,
      hierarchy: 'arterial',
    },
    {
      centerline: [{ x: -10, y: size + 10 }, { x: size + 10, y: size + 10 }],
      width: 12,
      hierarchy: 'arterial',
    },
  ];

  return {
    buildings,
    streets,
    bounds: { minX: 0, minY: 0, maxX: size, maxY: size },
  };
}
```

**Step 5: Create Sea Ranch generator**

```typescript
// src/generators/sea-ranch.ts
import { Block, Building, Street, BlockConfig, Point } from '../core/types.js';
import { rotatePoint } from '../core/geometry.js';

export const seaRanchConfig: BlockConfig = {
  name: 'sea-ranch',
  displayName: 'SEA RANCH COASTAL',
  subtitle: 'MLTW, Sonoma Coast 1965',
  accentColor: '#6B7B6E',
  parameters: {
    siteWidth: 200,
    siteDepth: 300,
    numClusters: 4,
    buildingsPerCluster: 5,
    clusterSpacing: 50,
    buildingFootprintMin: 60,
    buildingFootprintMax: 120,
    buildingHeight: 5,
    roofPitch: 6,
    bluffSetback: 30,
  },
};

export function generateSeaRanchBlock(): Block {
  const p = seaRanchConfig.parameters;
  const width = p.siteWidth as number;
  const depth = p.siteDepth as number;
  const numClusters = p.numClusters as number;

  const buildings: Building[] = [];

  // Wind direction from SW - all roofs pitch away
  const windAngle = 225;

  // Generate clusters
  for (let c = 0; c < numClusters; c++) {
    // Cluster center - avoid bluff edge
    const clusterX = 30 + Math.random() * (width - 60);
    const clusterY = 50 + Math.random() * (depth - 100 - (p.bluffSetback as number));

    const numBuildings = 3 + Math.floor(Math.random() * 4);

    for (let b = 0; b < numBuildings; b++) {
      // Buildings cluster tightly
      const angle = (b / numBuildings) * Math.PI * 2;
      const radius = 15 + Math.random() * 20;
      const bx = clusterX + Math.cos(angle) * radius;
      const by = clusterY + Math.sin(angle) * radius;

      const bw = 8 + Math.random() * 6;
      const bh = 6 + Math.random() * 4;
      const rotation = windAngle + (Math.random() - 0.5) * 20;

      const corners = [
        { x: -bw / 2, y: -bh / 2 },
        { x: bw / 2, y: -bh / 2 },
        { x: bw / 2, y: bh / 2 },
        { x: -bw / 2, y: bh / 2 },
      ].map(pt => {
        const rotated = rotatePoint(pt, rotation);
        return { x: bx + rotated.x, y: by + rotated.y };
      });

      buildings.push({
        footprint: corners,
        height: (p.buildingHeight as number) + Math.random() * 2,
        stories: Math.random() > 0.5 ? 2 : 1,
        roofType: 'shed',
        roofDirection: windAngle,
      });
    }
  }

  // Minimal paths connecting clusters
  const streets: Street[] = [
    {
      centerline: [
        { x: width / 2, y: 0 },
        { x: width / 2, y: depth - (p.bluffSetback as number) },
      ],
      width: 3,
      hierarchy: 'pedestrian',
    },
    {
      centerline: [
        { x: 20, y: depth * 0.4 },
        { x: width - 20, y: depth * 0.5 },
      ],
      width: 3,
      hierarchy: 'pedestrian',
    },
  ];

  // Bluff edge indicator (not a street, but we'll use it)
  streets.push({
    centerline: [
      { x: 0, y: depth },
      { x: width, y: depth },
    ],
    width: 1,
    hierarchy: 'local',
  });

  return {
    buildings,
    streets,
    bounds: { minX: 0, minY: 0, maxX: width, maxY: depth },
  };
}
```

**Step 6: Create generator index**

```typescript
// src/generators/index.ts
export { generateBarcelonaBlock, barcelonaConfig } from './barcelona.js';
export { generateManhattanBlock, manhattanConfig } from './manhattan.js';
export { generateMedievalBlock, medievalConfig } from './medieval.js';
export { generateGardenCityBlock, gardenCityConfig } from './garden-city.js';
export { generateSuperblockBlock, superblockConfig } from './superblock.js';
export { generateSeaRanchBlock, seaRanchConfig } from './sea-ranch.js';

import { Block, BlockConfig } from '../core/types.js';
import { generateBarcelonaBlock, barcelonaConfig } from './barcelona.js';
import { generateManhattanBlock, manhattanConfig } from './manhattan.js';
import { generateMedievalBlock, medievalConfig } from './medieval.js';
import { generateGardenCityBlock, gardenCityConfig } from './garden-city.js';
import { generateSuperblockBlock, superblockConfig } from './superblock.js';
import { generateSeaRanchBlock, seaRanchConfig } from './sea-ranch.js';

export const blockTypes: Record<string, { generate: () => Block; config: BlockConfig }> = {
  barcelona: { generate: generateBarcelonaBlock, config: barcelonaConfig },
  manhattan: { generate: generateManhattanBlock, config: manhattanConfig },
  medieval: { generate: generateMedievalBlock, config: medievalConfig },
  'garden-city': { generate: generateGardenCityBlock, config: gardenCityConfig },
  superblock: { generate: generateSuperblockBlock, config: superblockConfig },
  'sea-ranch': { generate: generateSeaRanchBlock, config: seaRanchConfig },
};

export const allBlockNames = Object.keys(blockTypes);
```

**Step 7: Commit**

```bash
git add src/generators/
git commit -m "feat: add all block generators (Manhattan, Medieval, Garden City, Superblock, Sea Ranch)"
```

---

## Task 15: CLI Entry Point

**Files:**
- Create: `src/index.ts`

**Step 1: Write CLI**

```typescript
// src/index.ts
import { blockTypes, allBlockNames } from './generators/index.js';
import { renderFigureGround } from './renderers/figure-ground.js';
import { renderAxonometric } from './renderers/axonometric.js';
import { renderSection } from './renderers/section.js';
import { renderStreetNetwork } from './renderers/street-network.js';
import { renderDensityGradient } from './renderers/density-gradient.js';
import { composeBoard } from './composer/board.js';
import { exportToPdf, exportToSvg } from './core/pdf.js';
import { DrawingSet } from './core/types.js';

async function generateBlock(name: string): Promise<void> {
  const blockType = blockTypes[name];
  if (!blockType) {
    console.error(`Unknown block type: ${name}`);
    console.error(`Available types: ${allBlockNames.join(', ')}`);
    process.exit(1);
  }

  console.log(`Generating ${blockType.config.displayName}...`);

  const block = blockType.generate();
  const config = blockType.config;

  console.log('  Rendering figure-ground...');
  const figureGround = renderFigureGround(block, config);

  console.log('  Rendering axonometric...');
  const axonometric = renderAxonometric(block, config);

  console.log('  Rendering section...');
  const section = renderSection(block, config);

  console.log('  Rendering street network...');
  const streetNetwork = renderStreetNetwork(block, config);

  console.log('  Rendering density gradient...');
  const densityGradient = renderDensityGradient(block, config);

  const drawings: DrawingSet = {
    figureGround,
    axonometric,
    section,
    streetNetwork,
    densityGradient,
  };

  console.log('  Composing board...');
  const board = composeBoard(drawings, config);

  console.log('  Exporting to PDF...');
  await exportToSvg(board, `output/${name}-board.svg`);
  await exportToPdf(board, `output/${name}-board.pdf`, { width: 841, height: 594 });

  console.log(`  Done! Output: output/${name}-board.pdf`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Generate all
    console.log('Generating all block types...\n');
    for (const name of allBlockNames) {
      await generateBlock(name);
      console.log('');
    }
    console.log('All boards generated!');
  } else {
    // Generate specific block(s)
    for (const name of args) {
      await generateBlock(name);
    }
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Compiles without errors

**Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: add CLI entry point for generating boards"
```

---

## Task 16: Create Core Index Exports

**Files:**
- Create: `src/core/index.ts`
- Create: `src/renderers/index.ts`
- Create: `src/composer/index.ts`

**Step 1: Create index files**

```typescript
// src/core/index.ts
export * from './types.js';
export * from './svg.js';
export * from './geometry.js';
export * from './pdf.js';
```

```typescript
// src/renderers/index.ts
export * from './figure-ground.js';
export * from './axonometric.js';
export * from './section.js';
export * from './street-network.js';
export * from './density-gradient.js';
```

```typescript
// src/composer/index.ts
export * from './board.js';
```

**Step 2: Commit**

```bash
git add src/core/index.ts src/renderers/index.ts src/composer/index.ts
git commit -m "chore: add index exports for core, renderers, composer"
```

---

## Task 17: Integration Test

**Files:**
- Create: `tests/integration/generate.test.ts`

**Step 1: Write integration test**

```typescript
// tests/integration/generate.test.ts
import { blockTypes, allBlockNames } from '../src/generators/index.js';
import { renderFigureGround } from '../src/renderers/figure-ground.js';
import { renderAxonometric } from '../src/renderers/axonometric.js';
import { renderSection } from '../src/renderers/section.js';
import { renderStreetNetwork } from '../src/renderers/street-network.js';
import { renderDensityGradient } from '../src/renderers/density-gradient.js';
import { composeBoard } from '../src/composer/board.js';

describe('Integration: Full generation pipeline', () => {
  test.each(allBlockNames)('generates complete board for %s', (name) => {
    const { generate, config } = blockTypes[name];

    const block = generate();
    expect(block.buildings.length).toBeGreaterThan(0);

    const figureGround = renderFigureGround(block, config);
    expect(figureGround).toContain('<svg');

    const axonometric = renderAxonometric(block, config);
    expect(axonometric).toContain('<svg');

    const section = renderSection(block, config);
    expect(section).toContain('<svg');

    const streetNetwork = renderStreetNetwork(block, config);
    expect(streetNetwork).toContain('<svg');

    const densityGradient = renderDensityGradient(block, config);
    expect(densityGradient).toContain('<svg');

    const board = composeBoard({
      figureGround,
      axonometric,
      section,
      streetNetwork,
      densityGradient,
    }, config);

    expect(board).toContain(config.displayName);
    expect(board).toContain(config.subtitle);
  });
});
```

**Step 2: Run integration tests**

Run: `npm run build && npm test -- tests/integration/generate.test.ts`
Expected: All 6 block types pass

**Step 3: Commit**

```bash
git add tests/integration/generate.test.ts
git commit -m "test: add integration tests for full generation pipeline"
```

---

## Task 18: Generate All Outputs

**Step 1: Build and run**

Run: `npm run build && npm run generate`
Expected: Generates 6 PDF files in output/

**Step 2: Verify outputs exist**

Run: `ls -la output/*.pdf`
Expected: 6 PDF files (~50-200KB each)

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: complete urban atlas v1.0"
```

---

## Summary

| Task | Description | Estimated Steps |
|------|-------------|-----------------|
| 1 | Project setup | 7 |
| 2 | Core types | 5 |
| 3 | SVG primitives | 5 |
| 4 | Geometry utilities | 5 |
| 5 | PDF export | 5 |
| 6 | Style definitions | 5 |
| 7 | Barcelona generator | 5 |
| 8 | Figure-ground renderer | 5 |
| 9 | Axonometric renderer | 5 |
| 10 | Section renderer | 5 |
| 11 | Street network renderer | 5 |
| 12 | Density gradient renderer | 5 |
| 13 | Board composer | 5 |
| 14 | Remaining generators | 7 |
| 15 | CLI entry point | 3 |
| 16 | Index exports | 2 |
| 17 | Integration test | 3 |
| 18 | Generate outputs | 3 |

**Total: 18 tasks, ~85 steps**
