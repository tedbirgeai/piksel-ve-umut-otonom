// app/api/ollama/route.ts
import { NextResponse } from "next/server";
import { pedagogyFor } from "@/lib/curriculum.config";

const OLLAMA_HOST = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL ?? "llama3";

/**
 * Pedagojik dil, MERKEZİ kaynaktan gelir: data/curriculum.json → pedagogyFor().
 * Burada statik rehber YOKTUR; kademe verisi tek noktadan yönetilir.
 */
export async function POST(req: Request) {
  try {
    const { subject, grade, prompt, model } = await req.json();

    const levelGuide = pedagogyFor(grade as string);

    // Türkçe ZORUNLU — en başta, system alanında ve emir kipiyle.
    // (llama3 Türkçe'de zayıf; tek bir "Türkçe yaz" satırı yetmiyor.)
    const systemPrompt =
      `ÇOK ÖNEMLİ KURAL: Yanıtının TAMAMINI yalnızca TÜRKÇE yaz. ` +
      `Tek bir İngilizce kelime, başlık veya cümle kullanma. ` +
      `Sen deneyimli bir ${subject} eğitmenisin. Hedef kademe: ${grade}. ` +
      `${levelGuide} ` +
      `Konuyu bu kademeye uygun biçimde, günlük hayattan örneklerle ve sonunda ` +
      `kademeye uygun 3 kısa değerlendirme sorusu ile anlat. ` +
      `Unutma: SADECE TÜRKÇE.`;

    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model ?? DEFAULT_MODEL,
        system: systemPrompt,
        prompt: `${prompt}\n\n(Yanıtı tamamen Türkçe ver.)`,
        stream: false,
        options: { temperature: 0.6 },
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: `Ollama yanıt vermedi (${res.status}). Yerel motor çalışıyor mu?`,
        },
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
