// lib/curriculum.ts

/**
 * Bağımlı seçim sistemi verisi.
 * Eğitim kademesi → o kademeye ait seviyeler + dersler.
 * UI (LevelSelector) bu yapıdan otomatik dependent-dropdown üretir.
 */
export interface Stage {
  key: string;
  hint: string;
  levels: string[];
  subjects: string[];
}

export const CURRICULUM: Stage[] = [
  {
    key: "Kreş",
    hint: "3–5 yaş",
    levels: ["3 Yaş", "4 Yaş", "5 Yaş"],
    subjects: [
      "Oyun & Etkinlik",
      "Görsel Sanatlar",
      "Müzik & Ritim",
      "Dil Gelişimi",
      "Doğa & Çevre",
    ],
  },
  {
    key: "İlkokul",
    hint: "6–10 yaş",
    levels: ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
    subjects: [
      "Türkçe",
      "Matematik",
      "Hayat Bilgisi",
      "Fen Bilimleri",
      "İngilizce",
      "Görsel Sanatlar",
    ],
  },
  {
    key: "Ortaokul",
    hint: "11–14 yaş",
    levels: ["5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf"],
    subjects: [
      "Türkçe",
      "Matematik",
      "Fen Bilimleri",
      "Sosyal Bilgiler",
      "İngilizce",
      "Din Kültürü",
    ],
  },
  {
    key: "Lise",
    hint: "15–18 yaş",
    levels: ["9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf"],
    subjects: [
      "Matematik",
      "Fizik",
      "Kimya",
      "Biyoloji",
      "Türk Dili ve Edebiyatı",
      "Tarih",
      "Coğrafya",
      "İngilizce",
    ],
  },
  {
    key: "Üniversite",
    hint: "Lisans",
    levels: ["Hazırlık", "1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
    subjects: [
      "Mühendislik",
      "Tıp Bilimleri",
      "Hukuk",
      "İşletme & İktisat",
      "Temel Bilimler",
      "Sosyal Bilimler",
      "Eğitim Bilimleri",
    ],
  },
  {
    key: "Akademik",
    hint: "Araştırma",
    levels: ["Yüksek Lisans", "Doktora", "Doktora Sonrası"],
    subjects: [
      "Literatür Taraması",
      "Araştırma Metodolojisi",
      "Veri Analizi",
      "Makale & Yayın Yazımı",
      "Tez Danışmanlığı",
    ],
  },
];

export const STAGE_KEYS = CURRICULUM.map((s) => s.key);

export function getStage(key: string): Stage {
  return CURRICULUM.find((s) => s.key === key) ?? CURRICULUM[1];
}
