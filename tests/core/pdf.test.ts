// tests/core/pdf.test.ts
import { exportToPdf } from '../../src/core/pdf.js';
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
