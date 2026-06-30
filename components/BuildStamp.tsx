// components/BuildStamp.tsx
"use client";

import { STAGE_KEYS, CURRICULUM_VERSION } from "@/lib/curriculum.config";

/**
 * Geliştirme-içi drift göstergesi.
 * CANLI config'ten okur: kademe sayısı + sürüm. "Eski arayüzü görüyorum"
 * dediğiniz an buraya bakın — sayı/sürüm beklediğinizden farklıysa cache/
 * eski-dosya drift'i vardır (KURULUM.md → "Drift Onarımı").
 * Üretimde otomatik gizlenir.
 */
export default function BuildStamp() {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] text-faint dark:text-[#5E726D]">
      <span className="h-1.5 w-1.5 rounded-full bg-tea" />
      <span className="font-mono">
        config · {STAGE_KEYS.length} kademe · {CURRICULUM_VERSION}
      </span>
    </div>
  );
}
