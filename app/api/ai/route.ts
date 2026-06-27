import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // Adresi 127.0.0.1 olarak güncelledik (daha kararlı bağlantı için)
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma:2b", // Eğer 'ollama list' komutunda başka isim görüyorsan burayı değiştir!
        prompt: `Pedagojik Eğitmen: "Piksel". Kurallar: Robotik "Bip-bop" tonu kullan, cevabı doğrudan verme, soruyla yönlendir. Soru/Konu: ${prompt}`,
        stream: false,
      }),
    });

    if (!response.ok) {
      // Hatanın nedenini daha net görmek için log ekledik
      const errorText = await response.text();
      console.error("Ollama Hatası:", errorText);
      throw new Error("Piksel'in zihnine ulaşılamadı. Ollama çalışıyor mu?");
    }

    const data = await response.json();
    return NextResponse.json({ response: data.response });
    
  } catch (error) {
    console.error("API Hatası:", error);
    return NextResponse.json(
      { error: "Piksel şu an kısa bir devre yaşadı, lütfen tekrar dene!" },
      { status: 500 }
    );
  }
}