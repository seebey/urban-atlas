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
