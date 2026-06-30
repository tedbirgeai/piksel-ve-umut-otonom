// app/api/ollama/route.ts
import { NextResponse } from "next/server";

const OLLAMA_HOST = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL ?? "llama3";

/**
 * Eğitim kademesine göre pedagojik dil rehberi.
 * YZ, seçilen kademeye uygun ton, kelime ve derinlikte içerik üretir.
 */
const LEVEL_GUIDE: Record<string, string> = {
  Kreş:
    "3-5 yaş okul öncesi çocuklar. Çok basit ve sıcak bir dil, kısa cümleler, " +
    "oyunlaştırma, somut günlük örnekler ve tekrarlar kullan. Soyut terimlerden kaçın.",
  İlkokul:
    "6-10 yaş ilkokul öğrencileri. Basit ve açık dil, görsel betimlemeler, " +
    "günlük hayattan örnekler, merak uyandıran sorular kullan.",
  Ortaokul:
    "11-14 yaş ortaokul öğrencileri. Kavramsal açıklama, neden-sonuç ilişkileri, " +
    "temel terimler ve örnek problemlerle anlat.",
  Lise:
    "15-18 yaş lise öğrencileri. Akademik temel, formüller, doğru terminoloji ve " +
    "sınav odaklı net açıklamalar kullan.",
  Üniversite:
    "Lisans düzeyi öğrenciler. İleri kavramlar, kaynak göstererek, uygulama ve " +
    "tartışma soruları içeren akademik bir üslup kullan.",
  Akademik:
    "Araştırmacı/akademisyen düzeyi. Teknik derinlik, literatür dili, kesin " +
    "tanımlar ve eleştirel çerçeve kullan.",
};

export async function POST(req: Request) {
  try {
    const { subject, grade, prompt, model } = await req.json();

    const levelGuide =
      LEVEL_GUIDE[grade as string] ??
      "Hedef kitleye uygun, anlaşılır bir pedagojik dil kullan.";

    const systemPrompt =
      `Sen deneyimli bir ${subject} eğitmenisin. Hedef kademe: ${grade}. ` +
      `${levelGuide} ` +
      `Konuyu bu kademeye uygun biçimde, günlük hayattan örneklerle ve sonunda ` +
      `kademeye uygun 3 kısa değerlendirme sorusu ile anlat. Türkçe yaz.`;

    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model ?? DEFAULT_MODEL,
        prompt: `${systemPrompt}\n\nKonu / kaynak:\n${prompt}`,
        stream: false,
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
