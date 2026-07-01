// lib/suggestions.ts

/**
 * DİNAMİK ÖNERİ ÜRETİCİSİ — seçilen kademe/ders/seviyeye göre akıllı istem üretir.
 *
 * Öncelik:
 *   1) MEB kazanım ağacında bu seçim için konu varsa → gerçek konulardan öner.
 *   2) Yoksa → kademeye + derse uygun pedagojik şablonlardan öner.
 * Böylece Kreş'e "Kesirler", Lise'ye "renkleri sayalım" gibi uyumsuzluklar biter.
 */
import { getTopics } from "./curriculum.config";

export interface Suggestion {
  icon: string;
  text: string;
}

// Kademeye göre fiil/ton — YZ istemini pedagojik olarak yönlendirir.
const STAGE_STYLE: Record<string, { verb: string; icons: string[] }> = {
  Kreş: {
    verb: "oyunlaştırarak, şarkı ve hikâye ile anlat",
    icons: ["🎨", "🧸", "🎵", "🌈"],
  },
  İlkokul: {
    verb: "günlük hayattan örneklerle, basit ve eğlenceli anlat",
    icons: ["✏️", "🍎", "🌱", "🔤"],
  },
  Ortaokul: {
    verb: "neden-sonuç ilişkileriyle ve örnek sorularla anlat",
    icons: ["🧭", "🔬", "📐", "🗺️"],
  },
  Lise: {
    verb: "sınav odaklı, formül ve çözümlü örneklerle anlat",
    icons: ["📊", "⚗️", "📈", "🧮"],
  },
  Üniversite: {
    verb: "akademik derinlikte, kaynak ve uygulama ile anlat",
    icons: ["🎓", "📚", "⚙️", "🔎"],
  },
  Akademik: {
    verb: "literatür ve eleştirel çerçeveyle derinlemesine ele al",
    icons: ["📝", "🔬", "📊", "🧪"],
  },
};

/** Kademeye/derse göre, konu bilgisi yoksa kullanılacak jenerik pedagojik fikirler. */
const GENERIC: Record<string, (subject: string) => string[]> = {
  Kreş: () => [
    "Renkleri ve şekilleri tanıtan bir oyun anlat",
    "1'den 10'a kadar saymayı şarkıyla öğret",
    "Hayvanları ve seslerini tanıtan bir etkinlik hazırla",
    "Paylaşmayı öğreten kısa bir hikâye anlat",
  ],
  İlkokul: (s) => [
    `${s} dersinden bir konuyu günlük hayattan örnekle anlat`,
    `${s} için eğlenceli bir alıştırma hazırla`,
    "Bir masal üzerinden değer eğitimi ver",
    "Merak uyandıran bir 'neden?' sorusuyla derse başla",
  ],
  Ortaokul: (s) => [
    `${s} dersinden bir konuyu örnek sorularla anlat`,
    `${s} konusunu günlük teknolojiyle ilişkilendir`,
    "Kavram haritasıyla bir üniteyi özetle",
    "Sık yapılan bir hatayı ve doğrusunu açıkla",
  ],
  Lise: (s) => [
    `${s} dersinden bir konuyu sınav odaklı özetle`,
    `${s} için çözümlü örnek soru hazırla`,
    "Bir formülün nereden geldiğini adım adım göster",
    "Üniversite sınavında çıkmış tarz bir soru çöz",
  ],
  Üniversite: (s) => [
    `${s} alanında temel bir kavramı akademik dille açıkla`,
    `${s} için bir vaka çalışması hazırla`,
    "Bir teoriyi güncel uygulamalarıyla tartış",
    "Literatürdeki temel yaklaşımları karşılaştır",
  ],
  Akademik: (s) => [
    `${s} için bir literatür taraması çerçevesi çıkar`,
    "Bir araştırma sorusunu hipoteze dönüştür",
    "Nicel ve nitel yöntemi karşılaştır",
    "Bir makalenin yöntem bölümünü eleştir",
  ],
};

export function buildSuggestions(
  stage: string,
  subject: string,
  level: string,
): Suggestion[] {
  const style = STAGE_STYLE[stage] ?? STAGE_STYLE["İlkokul"];
  const icons = style.icons;

  // 1) Kazanım ağacında gerçek konu varsa onları kullan
  const topics = getTopics(stage, subject, level);
  if (topics.length > 0) {
    return topics.slice(0, 4).map((t, i) => ({
      icon: icons[i % icons.length],
      text: `"${t}" konusunu ${style.verb}`,
    }));
  }

  // 2) Yoksa kademeye/derse uygun jenerik fikirler
  const generic = (GENERIC[stage] ?? GENERIC["İlkokul"])(subject);
  return generic.slice(0, 4).map((text, i) => ({
    icon: icons[i % icons.length],
    text,
  }));
}
