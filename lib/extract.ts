"use client";

/**
 * Client-side text extraction pipeline.
 * - PDFs: pdf.js (loaded from CDN on demand)
 * - Images (JPEG/PNG/HEIC*): Tesseract.js OCR (loaded from CDN on demand)
 *
 * Everything runs in the browser — the bill never leaves the user's device
 * in the default (guest) mode. Swap this for a server-side /api route +
 * AI parsing layer when Supabase/AI keys are configured (see README).
 *
 * *HEIC support depends on the browser's ability to decode it into a canvas
 *  (Safari yes; others often no) — we fall back with a clear error.
 */

export const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB
export const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

const PDFJS_VERSION = "3.11.174";
const PDFJS_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
const PDFJS_WORKER = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
const TESSERACT_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.0/tesseract.min.js";

declare global {
  interface Window {
    pdfjsLib?: any;
    Tesseract?: any;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if ((existing as any).dataset.loaded === "1") return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => {
      s.dataset.loaded = "1";
      resolve();
    };
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_BYTES) {
    return "File is larger than 15 MB. Try a smaller photo or a single-page PDF.";
  }
  const type = file.type || "";
  const name = file.name.toLowerCase();
  const okByType = ACCEPTED_TYPES.includes(type);
  const okByExt = /\.(pdf|jpe?g|png|webp|heic|heif)$/.test(name);
  if (!okByType && !okByExt) {
    return "Unsupported file type. Please upload a PDF, JPEG, PNG, WEBP, or HEIC file — or use manual entry.";
  }
  return null;
}

export async function extractPdfText(
  file: File,
  onProgress?: (msg: string) => void
): Promise<string> {
  onProgress?.("Loading PDF engine…");
  await loadScript(PDFJS_URL);
  const pdfjsLib = window.pdfjsLib;
  if (!pdfjsLib) throw new Error("PDF engine unavailable (offline?). Use manual entry.");
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let text = "";
  const pages = Math.min(pdf.numPages, 8);
  for (let i = 1; i <= pages; i++) {
    onProgress?.(`Reading page ${i} of ${pages}…`);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it: any) => it.str).join(" ") + "\n";
  }
  // If the PDF is a scan (no text layer), OCR the first page image instead.
  if (text.replace(/\s/g, "").length < 80) {
    onProgress?.("PDF looks like a scan — running OCR…");
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    text = await ocrCanvasOrFile(canvas, onProgress);
  }
  return text;
}

async function ocrCanvasOrFile(
  input: HTMLCanvasElement | File,
  onProgress?: (msg: string) => void
): Promise<string> {
  onProgress?.("Loading OCR engine (first run takes ~15s)…");
  await loadScript(TESSERACT_URL);
  const T = window.Tesseract;
  if (!T) throw new Error("OCR engine unavailable (offline?). Use manual entry.");
  const result = await T.recognize(input, "eng", {
    logger: (m: any) => {
      if (m.status === "recognizing text") {
        onProgress?.(`Reading your bill… ${Math.round((m.progress || 0) * 100)}%`);
      }
    },
  });
  return result?.data?.text ?? "";
}

export async function extractImageText(
  file: File,
  onProgress?: (msg: string) => void
): Promise<string> {
  // HEIC: try to decode via browser image pipeline into a canvas first
  if (/heic|heif/i.test(file.type) || /\.heic$|\.heif$/i.test(file.name)) {
    try {
      const bmp = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bmp.width;
      canvas.height = bmp.height;
      canvas.getContext("2d")!.drawImage(bmp, 0, 0);
      return await ocrCanvasOrFile(canvas, onProgress);
    } catch {
      throw new Error(
        "This browser can't decode HEIC images. Convert to JPEG/PNG (or screenshot the bill) and try again — or use manual entry."
      );
    }
  }
  return ocrCanvasOrFile(file, onProgress);
}

export async function extractText(
  file: File,
  onProgress?: (msg: string) => void
): Promise<{ text: string; source: "pdf" | "ocr" }> {
  const isPdf =
    file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (isPdf) {
    return { text: await extractPdfText(file, onProgress), source: "pdf" };
  }
  return { text: await extractImageText(file, onProgress), source: "ocr" };
}
