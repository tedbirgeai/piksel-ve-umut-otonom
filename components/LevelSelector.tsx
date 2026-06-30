// components/LevelSelector.tsx
"use client";

import { getStage, STAGE_KEYS } from "@/lib/curriculum";

/**
 * Bağımlı (dependent) seçim sistemi:
 * Kademe değişince Seviye ve Ders listeleri otomatik güncellenir.
 */
export default function LevelSelector({
  stage,
  level,
  subject,
  onChange,
}: {
  stage: string;
  level: string;
  subject: string;
  onChange: (next: { stage: string; level: string; subject: string }) => void;
}) {
  const current = getStage(stage);

  function selectStage(nextStage: string) {
    const s = getStage(nextStage);
    onChange({
      stage: nextStage,
      level: s.levels[0],
      subject: s.subjects[0],
    });
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <Field label="Eğitim kademesi">
        <select
          value={stage}
          onChange={(e) => selectStage(e.target.value)}
          className="w-full bg-transparent text-sm font-semibold text-ink outline-none"
        >
          {STAGE_KEYS.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </Field>

      <Field label="Sınıf / Seviye">
        <select
          value={level}
          onChange={(e) => onChange({ stage, level: e.target.value, subject })}
          className="w-full bg-transparent text-sm font-semibold text-ink outline-none"
        >
          {current.levels.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </Field>

      <Field label="Ders / Alan">
        <select
          value={subject}
          onChange={(e) => onChange({ stage, level, subject: e.target.value })}
          className="w-full bg-transparent text-sm font-semibold text-ink outline-none"
        >
          {current.subjects.map((s) => (
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
    <label className="rounded-xl border border-line bg-white px-3.5 py-2.5">
      <span className="mb-1 block text-[10.5px] uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
