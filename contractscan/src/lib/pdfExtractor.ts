/**
 * @module pdfExtractor
 * @description Client-side PDF text extraction utility for ContractScan AI.
 * Uses pdfjs-dist to parse PDF files and extract all text content from every page.
 * Designed to run entirely in the browser — no Node.js APIs are used.
 *
 * IMPORTANT: All pdfjs-dist imports are dynamic to avoid SSR issues.
 * This module must only be called from client-side code.
 */

import type { TextItem } from 'pdfjs-dist/types/src/display/api';

/**
 * Extracts all text content from a PDF file.
 *
 * Iterates through every page of the provided PDF, retrieves the text content
 * for each page, and concatenates the individual text items into a single string.
 * Pages are separated by a double newline for readability.
 *
 * @param file - The PDF file to extract text from (browser `File` object).
 * @returns A promise that resolves to the full extracted text of the PDF.
 * @throws {Error} If the PDF cannot be loaded or text extraction fails.
 *
 * @example
 * ```ts
 * const file = fileInput.files?.[0];
 * if (file) {
 *   const text = await extractTextFromPDF(file);
 *   console.log(text);
 * }
 * ```
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Dynamic import to avoid SSR evaluation of pdfjs-dist (DOMMatrix not available in Node.js)
    const pdfjsLib = await import('pdfjs-dist');

    // Set the worker source via CDN to avoid bundling issues with Next.js
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.7.284/pdf.worker.min.mjs';

    // Convert the browser File object to an ArrayBuffer
    const arrayBuffer: ArrayBuffer = await file.arrayBuffer();

    // Load the PDF document using pdfjs-dist
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pageTexts: string[] = [];

    // Iterate through all pages (1-indexed in PDF.js)
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Concatenate all text items on this page, skipping non-text marked content
      const pageText = textContent.items
        .map((item) => {
          // Only TextItem objects have the `str` property
          if ('str' in item && typeof (item as TextItem).str === 'string') {
            return (item as TextItem).str;
          }
          return '';
        })
        .join(' ');

      pageTexts.push(pageText);
    }

    // Join all pages with double newlines
    return pageTexts.join('\n\n');
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    throw new Error(
      `Failed to extract text from PDF "${file.name}": ${message}`,
    );
  }
}
