// components/AccessButton.tsx
"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  usePublicClient,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import {
  ROYALTY_CONTRACT_ADDRESS,
  royaltyAbi,
  isContractConfigured,
} from "@/lib/contract";
import type { Lesson } from "@/lib/types";

/**
 * Zincire kayıtlı bir içeriğe erişim satın alma düğmesi.
 * accessContent(contentId) {value: accessPrice} çağırır, makbuzu bekler.
 */
export default function AccessButton({ lesson }: { lesson: Lesson }) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [busy, setBusy] = useState(false);
  const [bought, setBought] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Yalnızca zincire kayıtlı içerik için göster
  if (!lesson.onChain || lesson.contentId === null) return null;

  const contentId = BigInt(lesson.contentId);
  const enabled = isConnected && isContractConfigured && Boolean(address);

  // Kullanıcının erişimi var mı?
  const { data: access, refetch: refetchAccess } = useReadContract({
    address: ROYALTY_CONTRACT_ADDRESS,
    abi: royaltyAbi,
    functionName: "hasAccess",
    args: address ? [contentId, address] : undefined,
    query: { enabled },
  });

  // Zincirdeki güncel erişim ücreti (contents tuple: creator, accessPrice, active, cid)
  const { data: content } = useReadContract({
    address: ROYALTY_CONTRACT_ADDRESS,
    abi: royaltyAbi,
    functionName: "contents",
    args: [contentId],
    query: { enabled: isContractConfigured },
  });

  const price =
    content && Array.isArray(content)
      ? (content[1] as bigint)
      : parseEther(lesson.accessPrice || "0");

  const hasAccess = Boolean(access) || bought;

  async function buyAccess() {
    setErr(null);
    if (!isConnected) {
      setErr("Önce cüzdan bağlayın.");
      return;
    }
    setBusy(true);
    try {
      const hash = await writeContractAsync({
        address: ROYALTY_CONTRACT_ADDRESS,
        abi: royaltyAbi,
        functionName: "accessContent",
        args: [contentId],
        value: price,
      });
      await publicClient?.waitForTransactionReceipt({ hash });
      setBought(true);
      refetchAccess?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message.split("\n")[0] : "İşlem başarısız.");
    } finally {
      setBusy(false);
    }
  }

  if (hasAccess) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#EFF4F2] px-2.5 py-1.5 text-[11.5px] font-semibold text-forest">
        <span className="h-1.5 w-1.5 rounded-sm bg-tea" />
        Erişiminiz var
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={buyAccess}
        disabled={busy}
        className="rounded-lg bg-hope px-3 py-1.5 text-[11.5px] font-bold text-hope-ink transition-colors hover:bg-[#d98b2a] disabled:opacity-60"
      >
        {busy ? "Alınıyor…" : `Eriş · ${formatEther(price)} ETH`}
      </button>
      {err && <span className="text-[10px] text-[#9A3B2E]">{err}</span>}
    </div>
  );
}
