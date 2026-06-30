// lib/extract.ts
"use client";

/**
 * İstemci tarafı doküman metin çıkarımı.
 *   - .pdf  → pdfjs-dist (sayfa sayfa metin)
 *   - .docx → mammoth (ham metin)
 *   - .txt  → düz okuma
 * Tümü tarayıcıda çalışır; dosya sunucuya gönderilmez (gizlilik + offline).
 */

const PDFJS_VERSION = "4.7.76";

export interface ExtractResult {
  text: string;
  pages?: number;
  source: string;
}

export async function extractText(file: File): Promise<ExtractResult> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return extractPdf(file);
  }
  if (
    name.endsWith(".docx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractDocx(file);
  }
  if (name.endsWith(".txt") || file.type.startsWith("text/")) {
    const text = await file.text();
    return { text: text.trim(), source: file.name };
  }
  throw new Error(
    "Desteklenmeyen dosya türü. PDF, DOCX veya TXT yükleyin.",
  );
}

async function extractPdf(file: File): Promise<ExtractResult> {
  const pdfjs = await import("pdfjs-dist");
  // Worker'ı sürümle eşleşen CDN'den yükle (ek bundler ayarı gerektirmez)
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  let out = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    out +=
      content.items
        .map((it) => ("str" in it ? (it as { str: string }).str : ""))
        .join(" ") + "\n";
  }
  return { text: out.trim(), pages: doc.numPages, source: file.name };
}

async function extractDocx(file: File): Promise<ExtractResult> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return { text: value.trim(), source: file.name };
}

/** Çok uzun metni isteme uygun boyuta indirger. */
export function clampForPrompt(text: string, max = 4000): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "\n\n[…belge kısaltıldı]";
}
