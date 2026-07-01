// app/api/ollama/route.ts
import { NextResponse } from "next/server";
import { pedagogyFor } from "@/lib/curriculum.config";

/**
 * YEREL YZ MOTORU — Ollama + Qwen2.5 (açık ağırlıklı, Apache 2.0, bağımlılıksız).
 *
 * Model .env.local'den gelir (OLLAMA_MODEL). Varsayılan qwen2.5:7b — Türkçe'de
 * güçlü, tam serbest lisanslı. API anahtarı YOK, dış servise bağımlılık YOK;
 * her şey sizin makinenizde çalışır.
 */
const OLLAMA_HOST = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";

/** POST — ders içeriği üretir. */
export async function POST(req: Request) {
  const model = await req
    .json()
    .then((b) => b)
    .catch(() => ({}));

  const { subject, grade, prompt, model: reqModel } = model as {
    subject?: string;
    grade?: string;
    prompt?: string;
    model?: string;
  };

  const useModel = reqModel || DEFAULT_MODEL;
  const levelGuide = pedagogyFor(grade ?? "");

  // Türkçe ZORUNLU — system alanında, emir kipiyle. Qwen2.5 buna iyi uyar.
  const systemPrompt =
    `ÇOK ÖNEMLİ KURAL: Yanıtının TAMAMINI yalnızca akıcı ve doğru TÜRKÇE yaz. ` +
    `Tek bir İngilizce kelime, başlık veya cümle kullanma. ` +
    `Sen deneyimli bir ${subject ?? "genel"} öğretmenisin. Hedef kademe: ${grade ?? "genel"}. ` +
    `${levelGuide} ` +
    `Konuyu bu kademeye uygun biçimde; kısa bir giriş, adım adım açıklama, ` +
    `günlük hayattan örnek ve sonunda kademeye uygun 3 kısa değerlendirme sorusu ` +
    `ile anlat. Başlıkları ve maddeleri düzenli kullan. Unutma: SADECE TÜRKÇE.`;

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: useModel,
        system: systemPrompt,
        prompt: `${prompt ?? ""}\n\n(Yanıtı baştan sona Türkçe ver.)`,
        stream: false,
        options: { temperature: 0.6, top_p: 0.9 },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      // Model indirilmemişse Ollama "model not found" döndürür → net yönerge ver
      if (res.status === 404 || /not found|no such model/i.test(errText)) {
        return NextResponse.json(
          {
            error: `Model "${useModel}" bulunamadı. Terminalde şunu çalıştırın:  ollama pull ${useModel}`,
          },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: `Ollama yanıt vermedi (${res.status}).` },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json({
      text: data.response ?? "",
      model: data.model ?? useModel,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Yerel YZ motoruna ulaşılamadı. Ollama kurulu ve çalışıyor mu? (Terminalde: ollama serve)",
      },
      { status: 503 },
    );
  }
}

/** GET — sağlık kontrolü: Ollama ayakta mı, hedef model yüklü mü? */
export async function GET() {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { online: false, model: DEFAULT_MODEL, hasModel: false },
        { status: 200 },
      );
    }
    const data = (await res.json()) as { models?: { name: string }[] };
    const names = (data.models ?? []).map((m) => m.name);
    const hasModel = names.some(
      (n) => n === DEFAULT_MODEL || n.startsWith(DEFAULT_MODEL.split(":")[0]),
    );
    return NextResponse.json({
      online: true,
      model: DEFAULT_MODEL,
      hasModel,
      available: names,
    });
  } catch {
    return NextResponse.json(
      { online: false, model: DEFAULT_MODEL, hasModel: false },
      { status: 200 },
    );
  }
}
