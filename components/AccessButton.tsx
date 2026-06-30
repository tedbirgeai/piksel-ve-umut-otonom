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
  CERTIFICATE_CONTRACT_ADDRESS,
  certificateAbi,
  isContractConfigured,
} from "@/lib/contract";
import type { Lesson } from "@/lib/types";

/**
 * Zincire kayıtlı bir içeriğe (NFT) erişim satın alma düğmesi.
 * accessContent(tokenId) {value: accessPrice} çağırır, makbuzu bekler.
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

  const tokenId = BigInt(lesson.contentId);
  const enabled = isConnected && isContractConfigured && Boolean(address);

  // Kullanıcının erişimi var mı?
  const { data: access, refetch: refetchAccess } = useReadContract({
    address: CERTIFICATE_CONTRACT_ADDRESS,
    abi: certificateAbi,
    functionName: "hasAccess",
    args: address ? [tokenId, address] : undefined,
    query: { enabled },
  });

  // Zincirdeki güncel erişim ücreti (certificates tuple: creator, accessPrice, active, cid, …)
  const { data: cert } = useReadContract({
    address: CERTIFICATE_CONTRACT_ADDRESS,
    abi: certificateAbi,
    functionName: "certificates",
    args: [tokenId],
    query: { enabled: isContractConfigured },
  });

  const price =
    cert && Array.isArray(cert)
      ? (cert[1] as bigint)
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
        address: CERTIFICATE_CONTRACT_ADDRESS,
        abi: certificateAbi,
        functionName: "accessContent",
        args: [tokenId],
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
