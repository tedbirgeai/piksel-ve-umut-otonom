// lib/reputation.ts

/**
 * ÜRETİCİ İTİBAR & ROZET SİSTEMİ — tamamen zincir verisinden türer.
 *
 * Merkeziyetsizlik ilkesi: yeni bir "puan" sözleşmesi YOKTUR. İtibar, mevcut
 * sertifika sözleşmesindeki DOĞRULANABİLİR verilerden hesaplanır:
 *   - balanceOf(creator)      → üretilen ders (NFT) sayısı
 *   - totalEarned(creator)    → toplam kazanç (telif + havuz sponsorluğu, wei)
 * Böylece itibar taklit edilemez, kurum içi manipülasyona kapalıdır.
 *
 * Marka dili: "her çocuğun bir pikseli, her pikselin bir umudu". Kademeler
 * ışık/piksel temasıyla adlandırılır.
 */

export interface Tier {
  key: string;
  label: string;
  min: number; // bu kademe için gereken ders sayısı
  blurb: string;
}

/** Üretim kademeleri (üretilen ders sayısına göre). */
export const TIERS: Tier[] = [
  { key: "seed", label: "Tohum", min: 0, blurb: "Yolculuk başlıyor" },
  { key: "spark", label: "İlk Işık", min: 1, blurb: "İlk dersini paylaştın" },
  { key: "builder", label: "Üretken", min: 10, blurb: "Işığı çoğaltıyorsun" },
  { key: "master", label: "Usta Üretici", min: 50, blurb: "Bir müfredat kurdun" },
  { key: "beacon", label: "Işık Taşıyıcı", min: 100, blurb: "Binlerce çocuğa dokundun" },
  { key: "legend", label: "Umut Mimarı", min: 250, blurb: "Bir nesle iz bıraktın" },
];

export interface Badge {
  key: string;
  label: string;
  icon: string; // emoji (marka dilinde sade)
  desc: string;
  earned: (m: CreatorMetrics) => boolean;
}

export interface CreatorMetrics {
  lessons: number; // üretilen ders sayısı
  earnedWei: bigint; // toplam kazanç
  sponsored: boolean; // havuzdan ödül aldı mı
}

/** Onur rozetleri (üretim + katkı + toplum). */
export const BADGES: Badge[] = [
  {
    key: "first-light",
    label: "İlk Işık",
    icon: "✦",
    desc: "İlk dersini ürettin",
    earned: (m) => m.lessons >= 1,
  },
  {
    key: "prolific",
    label: "Üretken Kalem",
    icon: "✎",
    desc: "10+ ders ürettin",
    earned: (m) => m.lessons >= 10,
  },
  {
    key: "curriculum",
    label: "Müfredat Kurucusu",
    icon: "▦",
    desc: "50+ ders ürettin",
    earned: (m) => m.lessons >= 50,
  },
  {
    key: "earner",
    label: "Emeği Karşılığı",
    icon: "◈",
    desc: "İlk telif kazancını aldın",
    earned: (m) => m.earnedWei > 0n,
  },
  {
    key: "beloved",
    label: "Toplumun Desteklediği",
    icon: "♡",
    desc: "Bağış havuzundan ödül aldın",
    earned: (m) => m.sponsored,
  },
  {
    key: "beacon",
    label: "Işık Taşıyıcı",
    icon: "☀",
    desc: "100+ ders ürettin",
    earned: (m) => m.lessons >= 100,
  },
];

/** Ders sayısına göre mevcut kademeyi ve bir sonrakini döndürür. */
export function tierFor(lessons: number): {
  current: Tier;
  next: Tier | null;
  progress: number; // 0..1, bir sonraki kademeye
} {
  let current = TIERS[0];
  for (const t of TIERS) {
    if (lessons >= t.min) current = t;
  }
  const idx = TIERS.findIndex((t) => t.key === current.key);
  const next = idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
  const progress = next
    ? Math.min(1, (lessons - current.min) / (next.min - current.min))
    : 1;
  return { current, next, progress };
}

export function earnedBadges(m: CreatorMetrics): Badge[] {
  return BADGES.filter((b) => b.earned(m));
}
