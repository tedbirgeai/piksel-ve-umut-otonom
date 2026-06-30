// lib/ollama.ts
import type { OllamaResult } from "./types";

/**
 * Yerel Ollama motorundan ders içeriği üretir.
 * İstek sunucu tarafındaki /api/ollama route'una gider (CORS/güvenlik için).
 */
export async function generateLesson(params: {
  subject: string;
  grade: string;
  prompt: string;
  model?: string;
}): Promise<OllamaResult> {
  const res = await fetch("/api/ollama", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error ?? "Ollama isteği başarısız oldu.");
  }

  return res.json();
}
