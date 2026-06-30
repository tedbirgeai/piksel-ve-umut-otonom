// app/panel/page.tsx
"use client";

import { useState } from "react";
import ContentFactory from "@/components/ContentFactory";
import DigitalLibrary from "@/components/DigitalLibrary";
import RoyaltyPanel from "@/components/RoyaltyPanel";
import WalletButton from "@/components/WalletButton";

type Tab = "factory" | "library" | "royalty";

const TABS: { key: Tab; label: string }[] = [
  { key: "factory", label: "Üretim Fabrikası" },
  { key: "library", label: "Dijital Kütüphane" },
  { key: "royalty", label: "Telif Raporu" },
];

export default function PanelPage() {
  const [tab, setTab] = useState<Tab>("factory");

  return (
    <main className="mx-auto max-w-6xl px-7 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">// Kontrol Paneli</p>
          <h1 className="mt-2 text-[clamp(28px,4vw,40px)] font-bold text-forest">
            Çalışma alanı
          </h1>
        </div>
        <WalletButton />
      </div>

      {/* Sekmeler */}
      <div className="mt-8 flex flex-wrap gap-2.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "border-forest bg-forest text-paper"
                : "border-line bg-white text-muted hover:text-forest"
            }`}
          >
            <span className="h-2 w-2 rounded-sm bg-current opacity-60" />
            {t.label}
          </button>
        ))}
      </div>

      {/* İçerik */}
      <section className="mt-8 rounded-2xl border border-line bg-paper p-6 sm:p-8">
        {tab === "factory" && <ContentFactory />}
        {tab === "library" && <DigitalLibrary />}
        {tab === "royalty" && <RoyaltyPanel />}
      </section>
    </main>
  );
}
