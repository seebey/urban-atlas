# Parametric Urban Atlas

## Overview

A generative system that produces graduate-level architectural presentation boards for six distinct urban block typologies. Each block type generates a coordinated set of analytical drawings—figure-ground plans, axonometric views, sections, street networks, and density gradients—composed on a single print-ready sheet.

**Purpose:** Flagship portfolio piece demonstrating spatial/urban thinking, computational design, and architectural representation skills.

**Output:** Six A1 presentation boards (PDF), each containing five coordinated drawings for one urban typology.

## Block Typologies

### 1. Barcelona Eixample

| Parameter | Value |
|-----------|-------|
| Block size | 113m × 113m |
| Chamfer | 20m at 45° |
| Perimeter depth | 18m |
| Courtyard | 56m × 56m |
| Building height | 7 stories (24m) |
| Street width | 20m |
| Accent color | #D4726A (dusty terracotta) |

Dense perimeter block with chamfered corners creating octagonal intersections. Uniform cornice line, large central courtyards. Mediterranean warmth.

### 2. Manhattan Midtown

| Parameter | Value |
|-----------|-------|
| Block size | 80m × 270m |
| Lot width | 15-25m (varied) |
| Base height | 6 stories (20m) |
| Tower height | 20-45 stories (randomized) |
| Tower coverage | 40% of lot |
| Street width | 18m (avenues 30m) |
| Accent color | #E8B84A (taxi yellow) |

Long rectangular blocks with irregular lot subdivision. Streetwall base with setback towers of varying heights. Dramatic skyline silhouette.

### 3. Medieval Organic

| Parameter | Value |
|-----------|-------|
| Block generation | Voronoi from scattered points |
| Lot size range | 80-400 sqm |
| Street width | 3-8m (variable) |
| Building height | 2-5 stories |
| Courtyard frequency | 30% of lots |
| Infill density | 85% |
| Accent color | #8B7355 (warm sepia) |

Irregular lots generated from Voronoi subdivision. Narrow winding streets, tight grain, occasional courtyard voids. Historical character.

### 4. Garden City

| Parameter | Value |
|-----------|-------|
| Street pattern | Curvilinear, no grid |
| Lot size | 800-1200 sqm |
| Building footprint | 150-250 sqm |
| Setback | 12m front, 8m side |
| Building height | 2 stories (7m) |
| Coverage ratio | 18% |
| Accent color | #7D9969 (sage green) |

Flowing Olmsted-style streets. Buildings float in generous lots. More void than solid. Pastoral, suburban character.

### 5. Superblock Utopian

| Parameter | Value |
|-----------|-------|
| Superblock size | 400m × 400m |
| Tower grid | 5 × 5 (25 towers) |
| Tower footprint | 30m × 30m |
| Tower height | 15 stories (50m) |
| Tower spacing | 80m center-to-center |
| Ground coverage | 14% |
| Accent color | #4A90D9 (electric blue) |

Monumental scale. Identical tower modules on rational grid. Towers in park—vast open ground plane. Le Corbusier-esque utopian vision.

### 6. Sea Ranch Coastal

| Parameter | Value |
|-----------|-------|
| Site size | 200m × 300m |
| Building clusters | 3-4 groupings |
| Buildings per cluster | 4-7 units |
| Cluster spacing | 40-60m |
| Building footprint | 60-120 sqm |
| Building height | 1-2 stories (4-7m) |
| Roof pitch | Steep shed roofs, 6:12 |
| Roof orientation | All pitch SW (wind response) |
| Coverage ratio | 8% |
| Setback from bluff | 30m |
| Accent color | #6B7B6E (weathered cypress) |

Clustered residential compounds huddled against coastal wind. Shed roofs cascade in unified direction. Buildings subordinate to landscape. Northern California regional modernism.

## Drawing Types

### Figure-Ground Plan

| Attribute | Specification |
|-----------|---------------|
| Style | Nolli map—building mass solid black, void white |
| Line weight | 0.5pt outline on buildings |
| Ground texture | Subtle stipple in void areas |
| Streets | White with faint centerline (0.25pt, 20% gray) |
| Scale | 1:2500 |

### Axonometric View

| Attribute | Specification |
|-----------|---------------|
| Projection | 45°/45° isometric |
| View angle | From southwest |
| Building fill | Solid accent color |
| Shadow | 30° cast shadow, 50% darker than accent |
| Roof | 10% lighter than walls |
| Line weight | 0.75pt edges, 0.35pt secondary |
| Ground plane | Light gray with 10m grid |

### Street Network Diagram

| Attribute | Specification |
|-----------|---------------|
| Style | Lines only, no buildings |
| Street weight | Hierarchy-based (arterial 2pt, local 0.75pt) |
| Intersections | Small circles at nodes (2mm radius) |
| Color | Palette accent at 60% opacity |
| Pedestrian paths | Dashed line |

### Section Cut

| Attribute | Specification |
|-----------|---------------|
| Cut fill | Solid black (poché) |
| Beyond | Light line work (0.35pt) |
| Ground | Heavy black line, hatched below grade |
| Figures | 1.7m human silhouettes for scale |
| Annotation | Height dimensions on right margin |

### Density Gradient

| Attribute | Specification |
|-----------|---------------|
| Base | Figure-ground plan |
| Color mapping | Building height → color intensity |
| Gradient | White (1 story) → full accent (max height) |
| Legend | Vertical bar showing mapping |

## Visual Language

### Aesthetic Principles

- Variable line weight with clear hierarchy
- Restrained color palette—black/white base with one accent per block type
- Hand-drawn quality hatching and texture
- Minimalist typography, sparse annotation
- Asymmetric composition with generous white space
- Elegant scale bars and north arrows integrated into composition

### Visual References

- LAN Architecture competition boards
- Dogma urban studies
- Nolli's Rome map
- OMA early conceptual diagrams
- Atelier Bow-Wow survey drawings

### Typography

| Element | Specification |
|---------|---------------|
| Title | 24pt, bold, top left |
| Subtitle | 14pt, light |
| Parameters | 9pt, bottom strip |
| Labels | Minimalist sans-serif (Helvetica Neue) |

## Board Composition

```
+--------------------------------------------------+
|  [BLOCK TYPE NAME]                               |
|  [Subtitle/Origin]                               |
+--------------------------------------------------+
|                           |                      |
|    FIGURE-GROUND          |    AXONOMETRIC       |
|    (primary drawing)      |    (primary drawing) |
|                           |                      |
+---------------------------+----------------------+
|              |            |                      |
|   SECTION    |  STREET    |   DENSITY GRADIENT   |
|              |  NETWORK   |                      |
+---------------------------+----------------------+
|  Parameters | Scale 1:2500 | [north] | [scale]  |
+--------------------------------------------------+
```

| Board Attribute | Specification |
|-----------------|---------------|
| Size | 841 × 594mm (A1 landscape) |
| Margins | 40mm all sides |
| Background | #FAFAFA (warm off-white) |

## Technical Implementation

### Project Structure

```
urban-atlas/
├── src/
│   ├── index.ts                    # CLI entry point
│   ├── config/
│   │   └── blocks/
│   │       ├── barcelona.ts
│   │       ├── manhattan.ts
│   │       ├── medieval.ts
│   │       ├── garden-city.ts
│   │       ├── superblock.ts
│   │       └── sea-ranch.ts
│   ├── generators/
│   │   ├── grid-block.ts           # Orthogonal grid logic
│   │   ├── radial-block.ts         # Radial/organic logic
│   │   ├── voronoi-block.ts        # Irregular subdivision
│   │   ├── cluster-block.ts        # Grouped buildings
│   │   └── building-massing.ts     # 3D building generation
│   ├── renderers/
│   │   ├── figure-ground.ts
│   │   ├── axonometric.ts
│   │   ├── section.ts
│   │   ├── street-network.ts
│   │   └── density-gradient.ts
│   ├── composer/
│   │   └── board.ts                # Layout drawings on sheet
│   └── styles/
│       ├── line-weights.ts
│       ├── palettes.ts
│       └── typography.ts
├── output/                         # Generated PDFs
├── package.json
└── tsconfig.json
```

### Tech Stack

| Component | Technology |
|-----------|------------|
| Language | TypeScript |
| SVG generation | Custom primitives |
| PDF export | Puppeteer |
| 3D projection | Isometric math (no WebGL) |

### CLI Usage

```bash
# Generate all block types
npm run generate

# Generate single block type
npm run generate barcelona
npm run generate manhattan
npm run generate medieval
npm run generate garden-city
npm run generate superblock
npm run generate sea-ranch
```

## Deliverables

| Output | Description |
|--------|-------------|
| 6 presentation boards | A1 PDF per block type |
| 30 individual drawings | 5 drawings × 6 types (separate SVG/PDF) |
| Configurable system | Modify parameters, regenerate |

## Dependencies

```json
{
  "dependencies": {
    "puppeteer": "^22.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```
