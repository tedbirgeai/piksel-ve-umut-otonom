// lib/sceneDirector.ts

/**
 * SAHNE YÖNETMENİ — ders metnini gerçek bir video senaryosuna çevirir.
 *
 * Çıktı: sahne dizisi. Her sahne = { kind, text, object, bg }.
 * Metinden anahtar kelime yakalayıp sahneye uygun görsel nesne atar.
 * Motor (LessonPlayer) bu senaryoyu katman katman, hareketli oynatır.
 */

export type SceneKind = "intro" | "teach" | "example" | "quiz" | "outro";

export interface Scene {
  kind: SceneKind;
  text: string;
  object: string; // SceneObject anahtarı
  bg: number; // arka plan indeksi
}

/** Anahtar kelime → nesne eşleştirme (Türkçe kökler). */
const OBJECT_MAP: { rx: RegExp; obj: string }[] = [
  { rx: /elma|meyve|yemek|beslen/i, obj: "apple" },
  { rx: /sayı|rakam|say|matemat|topla|çıkar|kesir/i, obj: "number" },
  { rx: /renk|boya|resim|sanat/i, obj: "palette" },
  { rx: /şekil|üçgen|kare|daire|geometri/i, obj: "shapes" },
  { rx: /hayvan|kuş|kedi|köpek|balık|ses/i, obj: "animal" },
  { rx: /harf|oku|yaz|kelime|hece|dil|türkçe/i, obj: "letter" },
  { rx: /yıldız|uzay|gezegen|güneş|gök/i, obj: "star" },
  { rx: /su|deney|fen|bilim|doğa|bitki|çiçek/i, obj: "flask" },
  { rx: /müzik|şarkı|nota|ritim/i, obj: "music" },
  { rx: /kalp|sevgi|değer|payla|arkada/i, obj: "heart" },
];

function pickObject(text: string, fallback: string): string {
  for (const m of OBJECT_MAP) if (m.rx.test(text)) return m.obj;
  return fallback;
}

/** Ham metni anlamlı cümle/parçalara böler. */
function splitText(text: string): string[] {
  return text
    .replace(/[#*_`>]/g, "")
    .split(/\n+/)
    .flatMap((p) =>
      p.length > 150
        ? p.split(/(?<=[.!?])\s+/)
        : [p],
    )
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

const FALLBACKS = ["star", "heart", "palette", "shapes", "music"];

export function buildScenes(
  title: string,
  body: string,
  subject: string,
): Scene[] {
  const parts = splitText(body);
  const scenes: Scene[] = [];

  // Açılış
  scenes.push({
    kind: "intro",
    text: title,
    object: pickObject(title + " " + subject, "star"),
    bg: 0,
  });

  // Öğretim sahneleri
  parts.forEach((p, idx) => {
    const isQuestion = /\?|soru|değerlendir|bul|hangi/i.test(p);
    scenes.push({
      kind: isQuestion ? "quiz" : idx === 0 ? "teach" : "teach",
      text: p,
      object: pickObject(p, FALLBACKS[idx % FALLBACKS.length]),
      bg: (idx + 1) % 4,
    });
  });

  // Kapanış
  scenes.push({
    kind: "outro",
    text: "Harika! Bugün yeni bir şey öğrendik.",
    object: "heart",
    bg: 2,
  });

  return scenes;
}

// Sahne arka planları (sıcak, çocuk dostu gradyanlar)
export const SCENE_BG = [
  "linear-gradient(150deg,#FBEFD6,#F6E2BC)",
  "linear-gradient(150deg,#E7F1EE,#CFE6DD)",
  "linear-gradient(150deg,#FBE4E0,#F6D4CC)",
  "linear-gradient(150deg,#E9E7F6,#D6D2EF)",
];
