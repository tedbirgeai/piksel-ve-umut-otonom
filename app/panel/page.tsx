// app/panel/page.tsx
"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import PixelMark from "@/components/PixelMark";
import ContentFactory from "@/components/ContentFactory";
import DigitalLibrary from "@/components/DigitalLibrary";
import RoyaltyPanel from "@/components/RoyaltyPanel";

/**
 * Multimodal Çalışma Masası
 * -------------------------
 * Tek ekranda üç bileşen: Üretim Fabrikası (eğitim kademeleri + sesli/dosya
 * girişi + üret→IPFS→zincir), Dijital Kütüphane ve Telif & Dağıtım.
 * Cüzdan bağlama sağ üstte; Alchemy RPC lib/wagmi.ts üzerinden bağlıdır.
 */
const TABS = [
  { key: "uretim", label: "Üretim Fabrikası" },
  { key: "kutuphane", label: "Dijital Kütüphane" },
  { key: "telif", label: "Telif & Dağıtım" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function PanelPage() {
  const [tab, setTab] = useState<TabKey>("uretim");

  return (
    <main className="mx-auto min-h-[calc(100vh-58px)] max-w-6xl px-7 py-10">
      {/* Başlık + cüzdan */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <PixelMark size={34} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-brand text-tea">
              // Çalışma Masası
            </p>
            <h1 className="font-display text-[clamp(24px,3.4vw,34px)] font-bold leading-tight text-forest">
              Multimodal Üretim Paneli
            </h1>
          </div>
        </div>
        <ConnectButton
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
          label="Cüzdan Bağla"
        />
      </div>

      {/* Sekmeler */}
      <div className="mt-8 flex flex-wrap gap-1.5 rounded-2xl border border-line bg-white p-1.5 shadow-soft">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-forest text-paper"
                  : "text-muted hover:bg-sand hover:text-forest"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* İçerik */}
      <section className="mt-7">
        {tab === "uretim" && <ContentFactory />}
        {tab === "kutuphane" && <DigitalLibrary />}
        {tab === "telif" && <RoyaltyPanel />}
      </section>
    </main>
  );
}
