// lib/progress.ts
"use client";

/**
 * ÖĞRENCİ İLERLEME TAKİBİ — gizlilik öncelikli, cihazda yerel.
 *
 * KVKK/GDPR-K ilkesi: çocuk verisi TOPLANMAZ, sunucuya/zincire GİTMEZ.
 * İlerleme yalnızca öğrencinin kendi cihazında (localStorage) tutulur —
 * kimlik, isim, hesap yok. Bu, "veri minimizasyonu"nun en güçlü uygulamasıdır.
 *
 * Kayıt yapısı: { [lessonId]: { completedAt, openedAt } }
 */

const KEY = "piksel-umut.progress.v1";

export interface ProgressEntry {
  openedAt: number;
  completedAt: number | null;
}
type ProgressMap = Record<string, ProgressEntry>;

function read(): ProgressMap {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function write(map: ProgressMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* yoksay */
  }
}

/** Bir ders açıldığında çağrılır (ilk açılışı damgalar). */
export function markOpened(lessonId: string) {
  const map = read();
  if (!map[lessonId]) {
    map[lessonId] = { openedAt: Date.now(), completedAt: null };
    write(map);
  }
}

/** Ders tamamlandı olarak işaretlenir / geri alınır. */
export function toggleCompleted(lessonId: string): boolean {
  const map = read();
  const entry = map[lessonId] ?? { openedAt: Date.now(), completedAt: null };
  entry.completedAt = entry.completedAt ? null : Date.now();
  map[lessonId] = entry;
  write(map);
  return entry.completedAt !== null;
}

export function isCompleted(lessonId: string): boolean {
  return read()[lessonId]?.completedAt != null;
}

/** Özet istatistik — öğrenci başlığı ve (yerelde) okul panosu için. */
export function progressStats(allLessonIds: string[]): {
  opened: number;
  completed: number;
  total: number;
  percent: number;
} {
  const map = read();
  const opened = allLessonIds.filter((id) => map[id]).length;
  const completed = allLessonIds.filter((id) => map[id]?.completedAt).length;
  const total = allLessonIds.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return { opened, completed, total, percent };
}
