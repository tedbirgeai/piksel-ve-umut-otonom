// lib/curriculum.config.ts

/**
 * HİYERARŞİK MÜFREDAT YAPILANDIRMASI
 * ----------------------------------
 * Statik düz liste değil; kademe → (seviyeler + disiplinler) ağacı.
 * UI bu objeden dependent-dropdown üretir, YZ ise `pedagogy` ile dilini ayarlar.
 *
 * Yeni kademe/ders eklemek için yalnızca bu dosyayı düzenleyin —
 * arayüz ve üretim hattı otomatik uyum sağlar.
 */

export interface CurriculumBranch {
  /** Görünen ad */
  label: string;
  /** Yaş / bağlam ipucu */
  context: string;
  /** YZ'ye verilecek pedagojik ton rehberi */
  pedagogy: string;
  /** Bu kademeye ait seviyeler (sınıf vb.) */
  levels: string[];
  /** Bu kademeye ait dersler / disiplinler */
  subjects: string[];
}

export type CurriculumStage =
  | "Kreş"
  | "İlkokul"
  | "Ortaokul"
  | "Lise"
  | "Üniversite"
  | "Akademik";

export const CURRICULUM_CONFIG: Record<CurriculumStage, CurriculumBranch> = {
  Kreş: {
    label: "Kreş",
    context: "3–5 yaş okul öncesi",
    pedagogy:
      "Çok basit ve sıcak bir dil, kısa cümleler, oyunlaştırma, somut günlük örnekler ve tekrarlar kullan. Soyut terimlerden kaçın.",
    levels: ["3 Yaş", "4 Yaş", "5 Yaş"],
    subjects: [
      "Oyun & Etkinlik",
      "Görsel Sanatlar",
      "Müzik & Ritim",
      "Dil Gelişimi",
      "Doğa & Çevre",
    ],
  },
  İlkokul: {
    label: "İlkokul",
    context: "6–10 yaş",
    pedagogy:
      "Basit ve açık dil, görsel betimlemeler, günlük hayattan örnekler, merak uyandıran sorular kullan.",
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
  Ortaokul: {
    label: "Ortaokul",
    context: "11–14 yaş",
    pedagogy:
      "Kavramsal açıklama, neden-sonuç ilişkileri, temel terimler ve örnek problemlerle anlat.",
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
  Lise: {
    label: "Lise",
    context: "15–18 yaş",
    pedagogy:
      "Akademik temel, formüller, doğru terminoloji ve sınav odaklı net açıklamalar kullan.",
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
  Üniversite: {
    label: "Üniversite",
    context: "Lisans düzeyi",
    pedagogy:
      "İleri kavramlar, kaynak göstererek, uygulama ve tartışma soruları içeren akademik bir üslup kullan.",
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
  Akademik: {
    label: "Akademik",
    context: "Araştırmacı / akademisyen",
    pedagogy:
      "Teknik derinlik, literatür dili, kesin tanımlar ve eleştirel çerçeve kullan.",
    levels: ["Yüksek Lisans", "Doktora", "Doktora Sonrası"],
    subjects: [
      "Literatür Taraması",
      "Araştırma Metodolojisi",
      "Veri Analizi",
      "Makale & Yayın Yazımı",
      "Tez Danışmanlığı",
    ],
  },
};

export const STAGE_KEYS = Object.keys(CURRICULUM_CONFIG) as CurriculumStage[];

/**
 * Tek doğruluk kaynağı sürümü. Arayüzdeki BuildStamp bunu gösterir;
 * "eski arayüz" görünüyorsa sürüm/kademe sayısı anında ele verir.
 */
export const CURRICULUM_VERSION = "2026.06-autonomous";

/**
 * Self-healing doğrulama: config bozuk/eksikse build/dev anında net hata verir.
 * (CurriculumManager modül yüklenirken çağırır — sessiz drift imkânsız.)
 */
export function validateCurriculum(): { stages: number; version: string } {
  const issues: string[] = [];
  for (const [key, branch] of Object.entries(CURRICULUM_CONFIG)) {
    if (!branch?.levels?.length) issues.push(`${key}: 'levels' boş`);
    if (!branch?.subjects?.length) issues.push(`${key}: 'subjects' boş`);
  }
  if (issues.length) {
    throw new Error(
      "[curriculum.config] Geçersiz müfredat yapılandırması — " +
        issues.join("; "),
    );
  }
  return { stages: STAGE_KEYS.length, version: CURRICULUM_VERSION };
}

export function getBranch(stage: string): CurriculumBranch {
  return (
    CURRICULUM_CONFIG[stage as CurriculumStage] ?? CURRICULUM_CONFIG["İlkokul"]
  );
}

/** Geçerli kademe için pedagojik tonu döndürür (Ollama route bunu kullanır). */
export function pedagogyFor(stage: string): string {
  return getBranch(stage).pedagogy;
}
