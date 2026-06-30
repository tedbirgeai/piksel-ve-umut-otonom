// components/SchoolDashboard.tsx
"use client";

import { useMemo } from "react";
import { useLibrary } from "./LibraryProvider";
import { useRole } from "./RoleProvider";
import { STAGE_KEYS } from "@/lib/curriculum.config";

/**
 * OKUL & KURUM PANOSU — sınıf/öğrenci yönetimi, içerik dağıtımı, ilerleme.
 * Cüzdansız yönetim görünümü (kurumsal).
 */
const CLASSES = [
  { name: "5-A", stage: "Ortaokul", students: 28, progress: 72 },
  { name: "5-B", stage: "Ortaokul", students: 26, progress: 64 },
  { name: "9-A", stage: "Lise", students: 31, progress: 58 },
  { name: "Anasınıfı Papatya", stage: "Kreş", students: 18, progress: 88 },
];

export default function SchoolDashboard() {
  const { lessons } = useLibrary();
  const { clearRole } = useRole();

  const totalStudents = useMemo(
    () => CLASSES.reduce((s, c) => s + c.students, 0),
    [],
  );

  return (
    <div className="min-h-[calc(100vh-58px)] bg-paper dark:bg-[#0C1614]">
      <div className="mx-auto max-w-6xl px-6 py-9">
        {/* başlık */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-brand text-tea">
              Kurumsal Kontrol Paneli
            </p>
            <h1 className="mt-2 font-display text-[clamp(26px,4vw,36px)] font-bold tracking-tightest text-forest dark:text-[#34D0B6]">
              Okul Yönetimi
            </h1>
          </div>
          <button
            type="button"
            onClick={clearRole}
            className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-[12px] text-muted hover:border-forest hover:text-forest dark:border-[#21342F]"
          >
            Rol değiştir
          </button>
        </div>

        {/* istatistikler */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Sınıf" value={String(CLASSES.length)} />
          <Stat label="Öğrenci" value={String(totalStudents)} />
          <Stat label="Dağıtılan ders" value={String(lessons.length)} />
          <Stat label="Ortalama ilerleme" value="70%" accent />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* sınıflar */}
          <section className="lg:col-span-2">
            <h2 className="mb-3 font-display text-lg font-bold tracking-tightest text-ink dark:text-[#EAF1EF]">
              Sınıflar
            </h2>
            <div className="overflow-hidden rounded-2xl border border-line dark:border-[#21342F]">
              {CLASSES.map((c, i) => (
                <div
                  key={c.name}
                  className={`flex items-center gap-4 bg-white px-5 py-4 dark:bg-[#10201D] ${
                    i > 0 ? "border-t border-line dark:border-[#21342F]" : ""
                  }`}
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-sand font-display text-sm font-bold text-forest dark:bg-[#142824] dark:text-[#34D0B6]">
                    {c.name.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink dark:text-[#EAF1EF]">
                      {c.name}
                    </div>
                    <div className="text-[12px] text-muted">
                      {c.stage} · {c.students} öğrenci
                    </div>
                  </div>
                  <div className="w-32">
                    <div className="mb-1 flex justify-between text-[11px] text-muted">
                      <span>İlerleme</span>
                      <span className="font-semibold text-forest dark:text-[#34D0B6]">
                        {c.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-line dark:bg-[#21342F]">
                      <div
                        className="h-full rounded-full bg-forest dark:bg-[#34D0B6]"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* dağıtım */}
          <section>
            <h2 className="mb-3 font-display text-lg font-bold tracking-tightest text-ink dark:text-[#EAF1EF]">
              Müfredat Dağıt
            </h2>
            <div className="rounded-2xl border border-line bg-white p-5 dark:border-[#21342F] dark:bg-[#10201D]">
              <p className="text-[13px] leading-relaxed text-muted">
                Bir kademeyi seçip tüm sınıflara tek dokunuşla içerik atayın.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {STAGE_KEYS.slice(0, 4).map((k) => (
                  <button
                    key={k}
                    type="button"
                    className="flex items-center justify-between rounded-xl border border-line px-3.5 py-2.5 text-left text-[13px] font-medium text-ink transition-colors hover:border-forest/40 hover:bg-sand dark:border-[#21342F] dark:text-[#EAF1EF] dark:hover:bg-[#142824]"
                  >
                    {k}
                    <span className="text-[11px] font-semibold text-tea">
                      Dağıt →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? "border-transparent bg-gradient-to-br from-forest to-forest-600 text-paper"
          : "border-line bg-white dark:border-[#21342F] dark:bg-[#10201D]"
      }`}
    >
      <div
        className={`font-display text-[28px] font-bold tracking-tightest ${
          accent ? "text-paper" : "text-forest dark:text-[#34D0B6]"
        }`}
      >
        {value}
      </div>
      <div
        className={`mt-1 text-[12px] ${accent ? "text-paper/75" : "text-muted"}`}
      >
        {label}
      </div>
    </div>
  );
}
