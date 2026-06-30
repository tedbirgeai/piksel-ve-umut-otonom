// components/RoleSelect.tsx
"use client";

import { ROLES, type Role } from "@/lib/roles";
import { useRole } from "./RoleProvider";

/**
 * Profesyonel rol seçim ekranı — markanın "her çocuğun bir pikseli" ruhu.
 * Öğrenci / Öğretmen (vurgulu) / Okul & Kurum.
 */
export default function RoleSelect() {
  const { setRole } = useRole();

  return (
    <div className="relative min-h-[calc(100vh-58px)] overflow-hidden bg-paper">
      {/* arka plan dokusu */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(#0F3D3A 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-hope/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-28 h-[480px] w-[480px] rounded-full bg-forest/[0.07] blur-2xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-12 sm:px-10">
        {/* başlık */}
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-brand text-tea">
            Otonom Eğitim Ekosistemi
          </p>
          <h1 className="mt-4 font-display text-[clamp(32px,5vw,46px)] font-bold leading-[1.05] tracking-tightest text-forest">
            Bu yolculukta sen kimsin?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
            Her çocuğun bir pikseli, her pikselin bir umudu var. Rolünü seç —
            sistem deneyimini ve araçlarını sana göre hazırlasın.
          </p>
        </div>

        {/* kartlar */}
        <div className="mt-11 grid grid-cols-1 gap-5 md:grid-cols-3">
          <RoleCard role="student" onPick={setRole} />
          <RoleCard role="teacher" onPick={setRole} featured />
          <RoleCard role="school" onPick={setRole} />
        </div>

        {/* manifesto */}
        <div className="mt-11 flex items-center justify-center gap-4 text-center">
          <span className="h-px w-12 bg-line" />
          <p className="max-w-lg text-[13.5px] text-muted">
            Bilgi bir ayrıcalık değil, herkesin hakkıdır.{" "}
            <span className="font-semibold text-forest">
              Bilgiyi özgürleştir, üretene hakkını ver.
            </span>
          </p>
          <span className="h-px w-12 bg-line" />
        </div>
        <p className="mt-5 text-center text-xs text-faint">
          Rolünü sonradan değiştirebilirsin · Seçimin bu cihazda hatırlanır
        </p>
      </div>
    </div>
  );
}

function RoleCard({
  role,
  onPick,
  featured = false,
}: {
  role: Role;
  onPick: (r: Role) => void;
  featured?: boolean;
}) {
  const def = ROLES[role];

  if (featured) {
    return (
      <button
        type="button"
        onClick={() => onPick(role)}
        className="group relative overflow-hidden rounded-[22px] bg-gradient-to-br from-forest to-forest-600 p-6 text-left shadow-[0_14px_34px_-22px_rgba(15,61,58,0.5)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_52px_-24px_rgba(15,61,58,0.55)]"
      >
        <span className="absolute right-4 top-4 rounded-full bg-hope px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-hope-ink">
          {def.badge.toUpperCase()}
        </span>
        <div className="grid h-[54px] w-[54px] place-items-center rounded-[15px] bg-white/10">
          <TeacherGlyph />
        </div>
        <h3 className="mt-5 font-display text-[23px] font-bold tracking-tightest text-paper">
          {def.label}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-paper/75">
          {def.description}
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {def.features.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-[13px] text-paper/90">
              <span className="text-hope">●</span>
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-hope">
          {def.cta} <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onPick(role)}
      className="group relative rounded-[22px] border border-line bg-white p-6 text-left shadow-[0_1px_2px_rgba(15,61,58,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-forest hover:shadow-[0_24px_48px_-26px_rgba(15,61,58,0.4)]"
    >
      <div className="flex items-center justify-between">
        <div className="grid h-[54px] w-[54px] place-items-center rounded-[15px] bg-[#EFF4F2]">
          {role === "student" ? <StudentGlyph /> : <SchoolGlyph />}
        </div>
        <span className="rounded-full bg-[#EFF4F2] px-2.5 py-1 text-[11px] font-semibold text-tea">
          {def.badge}
        </span>
      </div>
      <h3 className="mt-5 font-display text-[23px] font-bold tracking-tightest text-ink">
        {def.label}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{def.description}</p>
      <ul className="mt-4 flex flex-col gap-2">
        {def.features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-[13px] text-[#3A4744]">
            <span className="text-forest">●</span>
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-forest">
        {def.cta} <span className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </button>
  );
}

function StudentGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z" stroke="#0F3D3A" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7 10.8V15c0 1.4 2.2 2.6 5 2.6s5-1.2 5-2.6v-4.2" stroke="#0F3D3A" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M21 9v4" stroke="#E89B3C" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TeacherGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19V6.5C4 5.7 4.7 5 5.5 5H18a1 1 0 0 1 1 1v10" stroke="#FAF7F1" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 19c0-1.1.9-2 2-2h13" stroke="#FAF7F1" strokeWidth="1.6" />
      <path d="M8.5 9.5h7M8.5 12.5h4.5" stroke="#E89B3C" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SchoolGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 20h18M5 20V9l7-4 7 4v11" stroke="#0F3D3A" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9.5 20v-5h5v5" stroke="#E89B3C" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
