// components/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { formatEther } from "viem";
import {
  ROYALTY_CONTRACT_ADDRESS,
  royaltyAbi,
  isContractConfigured,
} from "@/lib/contract";
import PixelMark from "./PixelMark";
import { useLibrary } from "./LibraryProvider";
import { useTheme } from "./ThemeProvider";

/**
 * Otonom Kontrol Merkezi:
 * marka + tema · yeni içerik · geçmiş · aktif projeler · telif durumu.
 */
export default function Sidebar({
  onNewChat,
  activeId,
  onSelect,
}: {
  onNewChat: () => void;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const { lessons } = useLibrary();
  const { theme, toggle } = useTheme();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);

  const onChainCount = lessons.filter((l) => l.onChain).length;

  // Zincirden gerçek çekilebilir telifi oku (sözleşme tanımlıysa).
  const { data: withdrawable } = useReadContract({
    address: ROYALTY_CONTRACT_ADDRESS,
    abi: royaltyAbi,
    functionName: "withdrawableRoyalty",
    args: address ? [address] : undefined,
    query: { enabled: isContractConfigured && !!address },
  });

  const balanceEth =
    isContractConfigured && typeof withdrawable === "bigint"
      ? Number(formatEther(withdrawable)).toLocaleString("tr-TR", {
          maximumFractionDigits: 4,
        })
      : "0,42";

  async function handleWithdraw() {
    setWithdrawMsg(null);
    if (!isConnected) {
      setWithdrawMsg("Önce cüzdan bağlayın.");
      return;
    }
    if (!isContractConfigured || !publicClient) {
      setWithdrawMsg("Sözleşme dağıtılmadı (demo modu).");
      return;
    }
    try {
      setWithdrawing(true);
      const hash = await writeContractAsync({
        address: ROYALTY_CONTRACT_ADDRESS,
        abi: royaltyAbi,
        functionName: "withdraw",
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setWithdrawMsg("Telifler cüzdanınıza aktarıldı ✓");
    } catch (e) {
      setWithdrawMsg(e instanceof Error ? e.message.slice(0, 80) : "İşlem iptal edildi.");
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <aside className="flex h-full w-[280px] flex-shrink-0 flex-col border-r border-line bg-white dark:border-[#21342F] dark:bg-[#10201D]">
      {/* marka + tema */}
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <div className="flex items-center gap-2.5">
          <PixelMark size={24} />
          <span className="font-display text-[15px] font-bold tracking-tightest text-forest dark:text-[#34D0B6]">
            Piksel<span className="text-hope">·</span>Umut
          </span>
        </div>
        <button
          type="button"
          onClick={toggle}
          title="Tema değiştir"
          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:text-forest dark:border-[#21342F]"
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>

      {/* yeni içerik */}
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-forest px-3.5 py-2.5 text-sm font-semibold text-paper shadow-soft transition-colors hover:bg-forest-600 dark:bg-[#1C4A44] dark:text-[#EAF6F3]"
        >
          <PlusGlyph />
          Yeni içerik üret
        </button>
      </div>

      {/* geçmiş + projeler */}
      <div className="flex-1 overflow-y-auto px-3">
        <SectionTitle>Geçmiş</SectionTitle>
        {lessons.length === 0 ? (
          <p className="px-1.5 pb-3 text-[12.5px] leading-relaxed text-muted">
            Henüz içerik yok. İlk dersinizi üretin.
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {lessons.map((l) => {
              const active = l.id === activeId;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onSelect(l.id)}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                    active
                      ? "bg-[#EFF4F2] dark:bg-[#142824]"
                      : "hover:bg-sand dark:hover:bg-[#142824]"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 flex-shrink-0 rounded-sm ${
                      l.onChain ? "bg-hope" : l.cid ? "bg-tea" : "bg-line"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink dark:text-[#EAF1EF]">
                      {l.title}
                    </span>
                    <span className="block truncate text-[11px] text-muted">
                      {l.grade}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <SectionTitle>Aktif Projeler</SectionTitle>
        <div className="flex flex-col gap-1.5">
          <ProjectRow name="Fen Müfredatı 6" status="üretiliyor" tone="tea" />
          <ProjectRow name="Tarih Seti 8" status="denetimde" tone="hope" />
        </div>
      </div>

      {/* telif durumu */}
      <div className="p-3">
        <div className="rounded-2xl bg-gradient-to-br from-forest to-forest-600 p-4 text-paper">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] text-[#A9C8C2]">Çekilebilir telif</span>
            <span className="font-mono text-[10.5px] text-hope">
              {onChainCount} içerik
            </span>
          </div>
          <div className="my-1.5 font-display text-2xl font-bold">
            {balanceEth} <span className="text-sm text-hope">ETH</span>
          </div>
          <button
            type="button"
            onClick={handleWithdraw}
            disabled={withdrawing}
            className="w-full rounded-lg bg-hope py-2 text-[12.5px] font-bold text-hope-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {withdrawing ? "İşleniyor…" : "Telifleri Çek"}
          </button>
          {withdrawMsg && (
            <p className="mt-2 text-[11px] leading-snug text-[#A9C8C2]">{withdrawMsg}</p>
          )}
        </div>
        <Link
          href="/"
          className="mt-2 flex items-center justify-between rounded-lg px-2.5 py-2 text-[12.5px] text-muted hover:text-forest"
        >
          <span>Ana sayfa</span>
          <span>↗</span>
        </Link>
      </div>
    </aside>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-1.5 pb-1.5 pt-4 font-mono text-[10.5px] uppercase tracking-wider text-faint dark:text-[#5E726D]">
      {children}
    </div>
  );
}

function ProjectRow({
  name,
  status,
  tone,
}: {
  name: string;
  status: string;
  tone: "tea" | "hope";
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-line bg-white px-2.5 py-2 dark:border-[#21342F] dark:bg-[#142824]">
      <span className="text-[12.5px] text-ink dark:text-[#EAF1EF]">{name}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${
          tone === "tea"
            ? "bg-sand text-tea dark:bg-[#0C1614]"
            : "bg-hope-soft text-hope-ink dark:bg-[#2A2415] dark:text-[#F4C781]"
        }`}
      >
        {status}
      </span>
    </div>
  );
}

function PlusGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
