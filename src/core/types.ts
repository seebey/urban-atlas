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
