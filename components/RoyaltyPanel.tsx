// components/RoyaltyPanel.tsx
"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatEther } from "viem";
import {
  ROYALTY_CONTRACT_ADDRESS,
  royaltyAbi,
  isContractConfigured,
} from "@/lib/contract";
import { useLibrary } from "./LibraryProvider";
import { shortCid } from "@/lib/ipfs";

export default function RoyaltyPanel() {
  const { address, isConnected } = useAccount();
  const { lessons } = useLibrary();

  // Sözleşmeden çekilebilir telifi oku
  const { data: withdrawable, isLoading } = useReadContract({
    address: ROYALTY_CONTRACT_ADDRESS,
    abi: royaltyAbi,
    functionName: "withdrawableRoyalty",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) && isContractConfigured },
  });

  const { writeContract, isPending } = useWriteContract();

  const balance =
    withdrawable !== undefined
      ? Number(formatEther(withdrawable as bigint))
      : isContractConfigured
        ? 0
        : 0.42; // demo modu (sözleşme tanımlı değilse örnek değer)

  function handleWithdraw() {
    if (!isContractConfigured) {
      alert("Telif sözleşmesi henüz yapılandırılmadı (.env.local).");
      return;
    }
    writeContract({
      address: ROYALTY_CONTRACT_ADDRESS,
      abi: royaltyAbi,
      functionName: "withdraw",
    });
  }

  return (
    <div>
      <h3 className="font-display text-2xl font-semibold text-ink">
        Telif &amp; Dağıtım Raporu
      </h3>
      <p className="mt-1 text-sm text-muted">
        İçerikleriniz her erişildiğinde, akıllı sözleşme telifi otomatik ve
        şeffaf biçimde size aktarır.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.3fr]">
        {/* Cüzdan kartı */}
        <div className="rounded-2xl bg-gradient-to-br from-forest to-forest-600 p-7 text-paper shadow-lift">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-[13px] text-[#A9C8C2]">Bağlı cüzdan</span>
            <span className="font-mono text-[11.5px] text-hope">
              {isConnected && address
                ? `${address.slice(0, 4)}…${address.slice(-3)}`
                : "bağlı değil"}
            </span>
          </div>
          <div className="text-[13px] text-[#A9C8C2]">Çekilebilir telif</div>
          <div className="mb-6 mt-1 font-display text-[40px] font-bold leading-none">
            {isLoading ? "…" : balance.toLocaleString("tr-TR")}{" "}
            <span className="text-xl text-hope">ETH</span>
          </div>
          <button
            type="button"
            onClick={handleWithdraw}
            disabled={!isConnected || isPending || balance <= 0}
            className="w-full rounded-xl bg-hope py-3 text-sm font-bold text-hope-ink transition-colors hover:bg-[#d98b2a] disabled:opacity-60"
          >
            {isPending
              ? "İmzalanıyor…"
              : !isConnected
                ? "Önce cüzdan bağlayın"
                : "Telifleri Çek"}
          </button>
          <p className="mt-2.5 text-center font-mono text-[11px] text-tea/90">
            min. çekim 0,01 ETH
          </p>
        </div>

        {/* İçerik bazında kazanç */}
        <div className="card p-6">
          <div className="mb-3.5 text-[13px] font-semibold text-ink">
            İçerik bazında kazanç
          </div>
          {lessons.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted">
              Henüz yayınlanmış içerik yok.
            </div>
          ) : (
            <ul>
              {lessons.slice(0, 6).map((l, i, arr) => (
                <li
                  key={l.id}
                  className={`flex items-center justify-between py-2.5 ${
                    i < arr.length - 1 ? "border-b border-sand" : ""
                  }`}
                >
                  <span className="truncate text-[13.5px] text-ink/90">
                    {l.title}
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="font-mono text-xs text-muted">
                      {shortCid(l.cid)}
                    </span>
                    <span className="font-mono text-[13px] font-semibold text-forest">
                      — ETH
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#DCE9E5] bg-[#EFF4F2] px-4 py-3.5">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-sm bg-tea" />
            <span className="text-[13px] leading-snug text-[#2A4A45]">
              Tüm dağıtımlar{" "}
              <strong className="text-forest">akıllı sözleşmede</strong>{" "}
              kayıtlıdır — kimse aracılık etmez, kimse kesinti yapamaz.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
