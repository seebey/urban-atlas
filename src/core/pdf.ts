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

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
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
  } finally {
    await browser.close();
  }
}

export async function exportToSvg(
  svgContent: string,
  outputPath: string
): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, svgContent, 'utf-8');
}
