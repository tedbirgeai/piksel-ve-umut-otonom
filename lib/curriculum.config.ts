// lib/curriculum.config.ts

/**
 * MÜFREDAT ERİŞİM KATMANI
 * -----------------------
 * Veri ARTIK kodda değil; merkezi yönetilebilir kaynakta:  data/curriculum.json
 * Bu dosya yalnızca o kaynağı OKUR, TİPLER ve DOĞRULAR (self-healing).
 *
 * Yeni kademe/ders eklemek için:  data/curriculum.json düzenle → kaydet.
 * Arayüz (CurriculumManager) ve YZ (Ollama route) otomatik güncellenir;
 * burada veya bileşenlerde HİÇBİR statik liste yoktur.
 */
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

/** Kademe anahtarı artık veriden türetilir — tamamen otonom (tipte sabit değil). */
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

/**
 * DÜZ (flat) TÜRETİLMİŞ LİSTELER — codemod / self-heal bağlanma noktaları.
 * Bir bileşende düz bir dizi gerektiğinde sabit yazmak yerine bunlar kullanılır;
 * hepsi data/curriculum.json'dan üretilir, asla elle güncellenmez.
 */
export const ALL_STAGES: string[] = STAGE_KEYS;

export const ALL_LEVELS: string[] = Array.from(
  new Set(DATA.stages.flatMap((s) => s.levels)),
);

export const ALL_SUBJECTS: string[] = Array.from(
  new Set(DATA.stages.flatMap((s) => s.subjects)),
);

/** Merkezi veri sürümü — BuildStamp bunu gösterir, drift'i ele verir. */
export const CURRICULUM_VERSION = DATA.version;

/**
 * Self-healing doğrulama: veri bozuk/eksikse build/dev anında net hata verir.
 * (CurriculumManager modül yüklenirken çağırır — sessiz drift imkânsız.)
 */
export function validateCurriculum(): {
  stages: number;
  subjects: number;
  version: string;
} {
  const issues: string[] = [];
  if (!DATA?.stages?.length) issues.push("'stages' boş ya da okunamadı");
  let subjectTotal = 0;
  for (const s of DATA.stages ?? []) {
    if (!s.key) issues.push("anahtarsız kademe");
    if (!s.levels?.length) issues.push(`${s.key}: 'levels' boş`);
    if (!s.subjects?.length) issues.push(`${s.key}: 'subjects' boş`);
    subjectTotal += s.subjects?.length ?? 0;
  }
  if (issues.length) {
    throw new Error(
      "[curriculum.config] Geçersiz müfredat verisi (data/curriculum.json) — " +
        issues.join("; "),
    );
  }
  return {
    stages: STAGE_KEYS.length,
    subjects: subjectTotal,
    version: CURRICULUM_VERSION,
  };
}

export function getBranch(stage: string): CurriculumBranch {
  return CURRICULUM_CONFIG[stage] ?? CURRICULUM_CONFIG[STAGE_KEYS[0]];
}

/** Geçerli kademe için pedagojik tonu döndürür (Ollama route bunu kullanır). */
export function pedagogyFor(stage: string): string {
  return getBranch(stage).pedagogy;
}
