// lib/curriculum.config.ts
//
// Müfredat verisi tek kaynaktan gelir: data/curriculum.json
// Bu dosya o veriyi okur ve tipler. Başka hiçbir yerde sabit ders listesi yoktur.

import curriculumData from "@/data/curriculum.json";

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

interface RawStage extends CurriculumBranch {
  key: string;
}
interface CurriculumFile {
  version: string;
  stages: RawStage[];
}

const DATA = curriculumData as unknown as CurriculumFile;

export type CurriculumStage = string;

/** key → branch sözlüğü (veriden inşa edilir). */
export const CURRICULUM_CONFIG: Record<string, CurriculumBranch> =
  Object.fromEntries(
    DATA.stages.map((s) => [
      s.key,
      {
        label: s.label,
        context: s.context,
        pedagogy: s.pedagogy,
        levels: s.levels,
        subjects: s.subjects,
      },
    ]),
  );

/** Sıralı kademe anahtarları (dropdown sırası = JSON sırası). */
export const STAGE_KEYS: string[] = DATA.stages.map((s) => s.key);

export function getBranch(stage: string): CurriculumBranch {
  return CURRICULUM_CONFIG[stage] ?? CURRICULUM_CONFIG[STAGE_KEYS[0]];
}

/** Geçerli kademe için pedagojik tonu döndürür (Ollama route bunu kullanır). */
export function pedagogyFor(stage: string): string {
  return getBranch(stage).pedagogy;
}
