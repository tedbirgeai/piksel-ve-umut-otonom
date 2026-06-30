// app/api/ollama/route.ts
import { NextResponse } from "next/server";

const OLLAMA_HOST = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL ?? "llama3";

/**
 * Yerel Ollama motoruna güvenli sunucu-taraflı köprü.
 * İstemci /api/ollama'ya istek atar; bu route onu yerel Ollama'ya iletir.
 */
export async function POST(req: Request) {
  try {
    const { subject, grade, prompt, model } = await req.json();

    const systemPrompt =
      `Sen deneyimli bir ${grade} ${subject} öğretmenisin. ` +
      `Konuyu ${grade} seviyesine uygun, günlük hayattan örneklerle ve ` +
      `sonunda 3 soruluk kısa bir değerlendirme ile anlat. Türkçe yaz.`;

    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model ?? DEFAULT_MODEL,
        prompt: `${systemPrompt}\n\nKonu: ${prompt}`,
        stream: false,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Ollama yanıt vermedi (${res.status}). Yerel motor çalışıyor mu?` },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json({
      text: data.response ?? "",
      model: data.model ?? (model ?? DEFAULT_MODEL),
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Yerel Ollama motoruna ulaşılamadı. `ollama serve` çalıştığından emin olun.",
      },
      { status: 503 },
    );
  }
}
