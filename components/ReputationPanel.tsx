// components/ReputationPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import {
  CERTIFICATE_CONTRACT_ADDRESS,
  certificateAbi,
  isContractConfigured,
} from "@/lib/contract";
import { publicReadClient } from "@/lib/publicClient";
import {
  tierFor,
  earnedBadges,
  BADGES,
  type CreatorMetrics,
} from "@/lib/reputation";
import { useLibrary } from "./LibraryProvider";

/**
 * ÜRETİCİ KARNESİ — öğretmenin itibarını zincir verisinden gösterir.
 * Kademe (Tohum → Umut Mimarı) + rozetler + kazanç. Cüzdan bağlı değilse
 * demo/yerel veriyle önizleme gösterir.
 */
export default function ReputationPanel({ compact = false }: { compact?: boolean }) {
  const { address, isConnected } = useAccount();
  const { lessons: localLessons } = useLibrary();

  const [metrics, setMetrics] = useState<CreatorMetrics>({
    lessons: 0,
    earnedWei: 0n,
    sponsored: false,
  });

  useEffect(() => {
    let alive = true;

    async function load() {
      // Zincir + cüzdan varsa gerçek veri
      if (isConnected && address && isContractConfigured) {
        try {
          const [bal, earned] = await Promise.all([
            publicReadClient.readContract({
              address: CERTIFICATE_CONTRACT_ADDRESS,
              abi: certificateAbi,
              functionName: "balanceOf",
              args: [address],
            }),
            publicReadClient.readContract({
              address: CERTIFICATE_CONTRACT_ADDRESS,
              abi: certificateAbi,
              functionName: "totalEarned",
              args: [address],
            }),
          ]);
          if (alive) {
            setMetrics({
              lessons: Number(bal as bigint),
              earnedWei: earned as bigint,
              sponsored: (earned as bigint) > 0n,
            });
          }
          return;
        } catch {
          /* zincir okunamadı → yerele düş */
        }
      }
      // Demo/yerel: üretilen ders sayısını yerelden türet
      if (alive) {
        const onChainLocal = localLessons.filter((l) => l.onChain).length;
        setMetrics({
          lessons: onChainLocal || localLessons.length,
          earnedWei: 0n,
          sponsored: false,
        });
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [address, isConnected, localLessons]);

  const { current, next, progress } = tierFor(metrics.lessons);
  const earned = earnedBadges(metrics);
  const earnedKeys = new Set(earned.map((b) => b.key));

  if (compact) {
    return (
      <div className="rounded-2xl border border-line bg-white p-4 dark:border-[#21342F] dark:bg-[#10201D]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
            Üretici Karnesi
          </span>
          <span className="rounded-full bg-sand px-2 py-0.5 text-[10.5px] font-bold text-forest dark:bg-[#142824] dark:text-[#34D0B6]">
            {current.label}
          </span>
        </div>
        <div className="mt-2 font-display text-2xl font-bold tracking-tightest text-forest dark:text-[#34D0B6]">
          {metrics.lessons}
          <span className="ml-1 text-sm font-medium text-muted">ders</span>
        </div>
        {next && (
          <>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line dark:bg-[#21342F]">
              <div
                className="h-full rounded-full bg-hope"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-muted">
              {next.label} için {next.min - metrics.lessons} ders daha
            </p>
          </>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {earned.slice(0, 6).map((b) => (
            <span
              key={b.key}
              title={`${b.label} — ${b.desc}`}
              className="grid h-7 w-7 place-items-center rounded-lg bg-hope-soft text-[13px] text-hope-ink dark:bg-[#2A2415] dark:text-[#F4C781]"
            >
              {b.icon}
            </span>
          ))}
          {earned.length === 0 && (
            <span className="text-[11px] text-muted">
              İlk dersini üret, ilk rozetini kazan.
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6 dark:border-[#21342F] dark:bg-[#10201D]">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-wider text-tea">
            Üretici Karnesi
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold tracking-tightest text-forest dark:text-[#34D0B6]">
            {current.label}
          </h3>
          <p className="text-[13px] text-muted">{current.blurb}</p>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-bold tracking-tightest text-ink dark:text-[#EAF1EF]">
            {metrics.lessons}
          </div>
          <div className="text-[11px] text-muted">üretilen ders</div>
        </div>
      </div>

      {next && (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-[11px] text-muted">
            <span>{current.label}</span>
            <span className="font-semibold text-forest dark:text-[#34D0B6]">
              {next.label}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-line dark:bg-[#21342F]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-forest to-hope"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11.5px] text-muted">
            Bir sonraki kademeye {next.min - metrics.lessons} ders kaldı.
          </p>
        </div>
      )}

      {metrics.earnedWei > 0n && (
        <div className="mt-4 rounded-xl bg-sand px-4 py-3 dark:bg-[#142824]">
          <span className="text-[12px] text-muted">Toplam kazanç: </span>
          <span className="font-mono text-[13px] font-semibold text-forest dark:text-[#34D0B6]">
            {Number(formatEther(metrics.earnedWei)).toFixed(4)} ETH
          </span>
        </div>
      )}

      {/* rozet vitrini */}
      <div className="mt-5">
        <p className="mb-2.5 text-[12px] font-semibold text-ink dark:text-[#EAF1EF]">
          Rozetler
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {BADGES.map((b) => {
            const got = earnedKeys.has(b.key);
            return (
              <div
                key={b.key}
                className={`flex flex-col items-center rounded-xl border p-3 text-center transition-all ${
                  got
                    ? "border-hope/40 bg-hope-soft dark:border-[#3A2F16] dark:bg-[#2A2415]"
                    : "border-line bg-paper opacity-45 dark:border-[#21342F] dark:bg-[#0C1614]"
                }`}
              >
                <span
                  className={`text-xl ${got ? "text-hope-ink dark:text-[#F4C781]" : "text-muted"}`}
                >
                  {b.icon}
                </span>
                <span className="mt-1 text-[10.5px] font-semibold leading-tight text-ink dark:text-[#EAF1EF]">
                  {b.label}
                </span>
                <span className="mt-0.5 text-[9.5px] leading-tight text-muted">
                  {b.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
