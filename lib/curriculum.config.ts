// lib/curriculum.config.ts
//
// Müfredat verisi tek kaynaktan gelir: data/curriculum.json
// Bu dosya o veriyi okur ve tipler. Başka hiçbir yerde sabit ders listesi yoktur.

import curriculumData from "@/data/curriculum.json";
import kazanimData from "@/data/curriculum-kazanim.json";

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

// ---------------------------------------------------------------------------
// KAZANIM / ÜNİTE AĞACI — müfredatın derinlik katmanı (data/curriculum-kazanim.json)
// ---------------------------------------------------------------------------

export interface CurriculumUnit {
  unit: string;
  topics: string[];
}

interface KazanimFile {
  version: string;
  source: string;
  updatedAt: string;
  tree: Record<string, Record<string, Record<string, CurriculumUnit[]>>>;
}

const KAZANIM = kazanimData as unknown as KazanimFile;

/** MEB kaynak sürümü — güncellenince tek noktadan yansır. */
export const CURRICULUM_SOURCE = KAZANIM.source;
export const CURRICULUM_MEB_VERSION = KAZANIM.version;

/** Belirli kademe+ders+seviye için ünite listesini döndürür (yoksa boş). */
export function getUnits(
  stage: string,
  subject: string,
  level: string,
): CurriculumUnit[] {
  return KAZANIM.tree?.[stage]?.[subject]?.[level] ?? [];
}

/** Bir seçim için tüm konu/kazanımları düz liste olarak döndürür. */
export function getTopics(
  stage: string,
  subject: string,
  level: string,
): string[] {
  return getUnits(stage, subject, level).flatMap((u) => u.topics);
}

/** Bu seçim için kazanım verisi var mı? (arayüz opsiyonel seçiciyi buna göre gösterir) */
export function hasKazanim(
  stage: string,
  subject: string,
  level: string,
): boolean {
  return getUnits(stage, subject, level).length > 0;
}
