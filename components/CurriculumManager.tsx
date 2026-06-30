// components/CurriculumManager.tsx
"use client";

import { useState, useCallback } from "react";
import { getBranch, STAGE_KEYS } from "@/lib/curriculum.config";

export interface CurriculumSelection {
  stage: string;
  level: string;
  subject: string;
}

/**
 * Bağımlı seçim mantığı (hook): kademe değişince seviye + ders sıfırlanır.
 * useCurriculum() durumu yönetir, <CurriculumManager> ise dependent
 * dropdown UI'ını çizer.
 */
/**
 * Bağımlı seçim mantığı (hook): kademe değişince seviye + ders sıfırlanır.
 * Başlangıç kademesi de merkezi kaynaktan gelir (STAGE_KEYS[0]) — varsayılan
 * bile sabit-kodlanmış değildir; data/curriculum.json'daki ilk kademedir.
 */
export function useCurriculum(initialStage: string = STAGE_KEYS[0]) {
  const init = getBranch(initialStage);
  const [sel, setSel] = useState<CurriculumSelection>({
    stage: initialStage,
    level: init.levels[0],
    subject: init.subjects[0],
  });

  const setStage = useCallback((stage: string) => {
    const b = getBranch(stage);
    setSel({ stage, level: b.levels[0], subject: b.subjects[0] });
  }, []);
  const setLevel = useCallback(
    (level: string) => setSel((s) => ({ ...s, level })),
    [],
  );
  const setSubject = useCallback(
    (subject: string) => setSel((s) => ({ ...s, subject })),
    [],
  );

  return { sel, setStage, setLevel, setSubject };
}

export default function CurriculumManager({
  sel,
  onStage,
  onLevel,
  onSubject,
}: {
  sel: CurriculumSelection;
  onStage: (v: string) => void;
  onLevel: (v: string) => void;
  onSubject: (v: string) => void;
}) {
  const branch = getBranch(sel.stage);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <Field label="Kademe">
        <select
          value={sel.stage}
          onChange={(e) => onStage(e.target.value)}
          className="w-full cursor-pointer bg-transparent text-[13.5px] font-semibold text-ink outline-none dark:text-[#EAF1EF]"
        >
          {STAGE_KEYS.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </Field>
      <Field label="Seviye">
        <select
          value={sel.level}
          onChange={(e) => onLevel(e.target.value)}
          className="w-full cursor-pointer bg-transparent text-[13.5px] font-semibold text-ink outline-none dark:text-[#EAF1EF]"
        >
          {branch.levels.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </Field>
      <Field label="Ders / Alan">
        <select
          value={sel.subject}
          onChange={(e) => onSubject(e.target.value)}
          className="w-full cursor-pointer bg-transparent text-[13.5px] font-semibold text-ink outline-none dark:text-[#EAF1EF]"
        >
          {branch.subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="rounded-xl border border-line bg-white px-3.5 py-2 dark:border-[#21342F] dark:bg-[#10201D]">
      <span className="mb-0.5 block text-[10px] uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
