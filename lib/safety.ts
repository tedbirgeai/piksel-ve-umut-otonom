// lib/safety.ts

/**
 * İÇERİK GÜVENLİĞİ & YAŞ-UYGUNLUK DENETİMİ — sıfır-hata kapısının 2. katmanı.
 *
 * Her üretilen taslağı, öğretmene sunulmadan önce otomatik tarar ve nesnel
 * uyarılar üretir. İnsan onayı (3. katman) bu uyarıları görerek karar verir.
 * Amaç: YZ'nin ürettiği uygunsuz/yanlış/kademe-dışı içeriğin çocuğa ulaşmasını
 * ÜÇ bağımsız katmanla engellemek (önle → tara → onayla).
 */

export type Severity = "block" | "warn" | "info";

export interface SafetyFlag {
  severity: Severity;
  code: string;
  message: string;
}

export interface SafetyReport {
  score: number; // 0–100 (100 = temiz)
  flags: SafetyFlag[];
  safeToPublish: boolean; // "block" yoksa true
}

// Hiçbir kademede eğitim içeriğinde yer almaması gereken kök terimler.
// (Türkçe kökler; kelime içinde de yakalanır, bilerek geniş tutuldu.)
const FORBIDDEN = [
  "porno",
  "cinsel",
  "seks",
  "uyuşturucu",
  "kumar",
  "bahis",
  "intihar",
  "silah",
  "terör",
  "küfür",
  "şiddet içeren",
];

// Küçük yaş kademelerinde uygunsuz/aşırı soyut olabilecek işaret terimler.
const AGE_SENSITIVE: Record<string, string[]> = {
  Kreş: ["ölüm", "savaş", "kan", "korku", "cinayet", "siyaset", "vergi", "borsa"],
  İlkokul: ["cinayet", "savaş", "siyaset", "borsa", "kripto"],
};

// İngilizce sızıntısını yakalamak için sık görülen İngilizce kelimeler.
const ENGLISH_LEAK = [
  "the ",
  " and ",
  " is ",
  " are ",
  "lesson",
  "example",
  "student",
  "please",
  "introduction",
  "evaluation",
];

/** Bir taslağı tarar ve güvenlik raporu döndürür. */
export function reviewContent(input: {
  body: string;
  stage: string;
  subject: string;
}): SafetyReport {
  const { body, stage } = input;
  const text = (body || "").toLowerCase();
  const flags: SafetyFlag[] = [];

  // 1) Yasaklı içerik → BLOCK (yayınlanamaz)
  for (const term of FORBIDDEN) {
    if (text.includes(term)) {
      flags.push({
        severity: "block",
        code: "forbidden",
        message: `Yasaklı/uygunsuz ifade tespit edildi ("${term}"). Bu içerik yayınlanamaz.`,
      });
    }
  }

  // 2) Kademeye duyarlı terimler → WARN
  const sensitive = AGE_SENSITIVE[stage] ?? [];
  for (const term of sensitive) {
    if (text.includes(term)) {
      flags.push({
        severity: "warn",
        code: "age-sensitive",
        message: `"${term}" bu kademe (${stage}) için hassas olabilir — gözden geçirin.`,
      });
    }
  }

  // 3) İngilizce sızıntısı → WARN (Türkçe zorunlu)
  const leaks = ENGLISH_LEAK.filter((w) => text.includes(w));
  if (leaks.length >= 2) {
    flags.push({
      severity: "warn",
      code: "language",
      message: "İçerikte İngilizce ifadeler olabilir. Tamamen Türkçe olmalı.",
    });
  }

  // 4) Çok kısa / eksik içerik → WARN
  if (body.trim().length < 200) {
    flags.push({
      severity: "warn",
      code: "too-short",
      message: "İçerik çok kısa; pedagojik olarak yetersiz olabilir.",
    });
  }

  // 5) Pedagojik yapı (değerlendirme/soru) yok → INFO
  const hasAssessment = /(\bsoru\b|değerlendir|etkinlik|alıştırma|\?)/i.test(body);
  if (!hasAssessment) {
    flags.push({
      severity: "info",
      code: "no-assessment",
      message: "İçerikte değerlendirme sorusu/etkinlik görünmüyor.",
    });
  }

  // Puan hesapla
  let score = 100;
  for (const f of flags) {
    score -= f.severity === "block" ? 60 : f.severity === "warn" ? 20 : 8;
  }
  score = Math.max(0, score);

  const safeToPublish = !flags.some((f) => f.severity === "block");
  return { score, flags, safeToPublish };
}

export function severityColor(s: Severity): { bg: string; fg: string } {
  switch (s) {
    case "block":
      return { bg: "#FBE9E5", fg: "#9A3B2E" };
    case "warn":
      return { bg: "#FBEFD6", fg: "#5A3D10" };
    default:
      return { bg: "#EFF4F2", fg: "#2A4A45" };
  }
}
