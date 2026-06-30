// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * ============================================================================
 *  OTONOM VERİ KORUMASI (anti-hardcode guardrail)
 * ============================================================================
 *  Kök neden: Müfredat verisi geçmişte bileşenlerin içine elle yazıldığı için
 *  her seferinde "statik dizi avı" gerekiyordu. Otonom mimaride bu HİÇ
 *  olmamalı. Aşağıdaki kural, müfredat ders adlarını içeren bir DİZİ LİTERALİ
 *  data/curriculum.json DIŞINDA herhangi bir .ts/.tsx dosyasına yazılırsa
 *  lint'i (ve `next build`'i) BAŞARISIZ kılar.
 *
 *  Böylece sistem drift'i kendi reddeder: bir geliştirici (ya da yapay zeka)
 *  yanlışlıkla ["Matematik", ...] gibi bir liste eklerse build kırmızı yanar.
 *  Tek izinli veri kaynağı: data/curriculum.json
 * ----------------------------------------------------------------------------
 */
const FORBIDDEN_CURRICULUM_TERMS = [
  "Matematik",
  "Fen Bilimleri",
  "Türkçe",
  "Sosyal Bilgiler",
  "Hayat Bilgisi",
  "Coğrafya",
];

// Bir ArrayExpression içinde yasaklı terimlerden 2+ string literali geçiyorsa
// bu, gömülü bir müfredat listesidir → hata.
const arrayGuard = FORBIDDEN_CURRICULUM_TERMS.map(
  (t) =>
    `ArrayExpression > Literal[value=${JSON.stringify(t)}]`,
);

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // data/ klasörü (JSON kaynağı) bu kuraldan muaftır.
    ignores: ["data/**", "node_modules/**", ".next/**"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...arrayGuard.map((selector) => ({
          selector,
          message:
            "⛔ Sabit (hardcoded) müfredat verisi yasak. Ders/kademe listeleri " +
            "YALNIZCA data/curriculum.json içinde tanımlanır ve useCurriculum() " +
            "hook'u ile dinamik okunur. Bu diziyi kaldırıp merkezi kaynağa taşıyın.",
        })),
      ],
    },
  },
];

export default eslintConfig;
