// components/DonationCard.tsx
"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { formatEther, parseEther } from "viem";
import {
  CERTIFICATE_CONTRACT_ADDRESS,
  certificateAbi,
  isContractConfigured,
} from "@/lib/contract";
import { publicReadClient } from "@/lib/publicClient";
import WalletButton from "./WalletButton";

/**
 * "BİR ÇOCUĞA DERS HEDİYE ET" — bağış havuzu kartı (markanın kalbi).
 *
 * Felsefe: İçerik TÜM çocuklara ücretsiz ve açıktır. Bağış, çocuğun erişimini
 * değil, ÜRETİCİNİN emeğini ödüllendirir. Bağışçı taraf kurumdur (okul/STK/
 * hayırsever), çocuk değil — bu yüzden cüzdan yalnızca burada, bağışçıda vardır.
 */
const PRESETS = ["0.01", "0.05", "0.1"];

export default function DonationCard() {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [pool, setPool] = useState<string | null>(null);
  const [total, setTotal] = useState<string | null>(null);
  const [amount, setAmount] = useState("0.05");
  const [dedication, setDedication] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPool() {
    if (!isContractConfigured) return;
    try {
      const [p, t] = await Promise.all([
        publicReadClient.readContract({
          address: CERTIFICATE_CONTRACT_ADDRESS,
          abi: certificateAbi,
          functionName: "donationPool",
        }),
        publicReadClient.readContract({
          address: CERTIFICATE_CONTRACT_ADDRESS,
          abi: certificateAbi,
          functionName: "totalDonated",
        }),
      ]);
      setPool(formatEther(p as bigint));
      setTotal(formatEther(t as bigint));
    } catch {
      /* zincir okunamadı */
    }
  }

  useEffect(() => {
    loadPool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function donate() {
    setError(null);
    setDone(false);
    if (!isConnected) {
      setError("Bağış yapmak için önce cüzdan bağlayın.");
      return;
    }
    if (!isContractConfigured || !publicClient) {
      setError("Bağış havuzu henüz yayında değil (demo modu).");
      return;
    }
    setBusy(true);
    try {
      const hash = await writeContractAsync({
        address: CERTIFICATE_CONTRACT_ADDRESS,
        abi: certificateAbi,
        functionName: "donate",
        args: [dedication || "Bir çocuğa armağan"],
        value: parseEther(amount || "0"),
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setDone(true);
      setDedication("");
      loadPool();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bağış tamamlanamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white dark:border-[#21342F] dark:bg-[#10201D]">
      {/* başlık şeridi */}
      <div className="bg-gradient-to-br from-forest to-forest-600 p-5 text-paper">
        <div className="flex items-center gap-2.5">
          <HeartGlyph />
          <h3 className="font-display text-lg font-bold tracking-tightest">
            Bir Çocuğa Ders Hediye Et
          </h3>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-paper/80">
          İçerik tüm çocuklara <strong className="text-hope">ücretsiz</strong>.
          Bağışın, o dersi üreten öğretmenin emeğini ödüllendirir — bilgi özgür
          kalır, üretici hakkını alır.
        </p>
        {pool !== null && (
          <div className="mt-4 flex gap-5">
            <div>
              <div className="font-display text-xl font-bold text-hope">
                {Number(pool).toFixed(3)} ETH
              </div>
              <div className="text-[11px] text-paper/70">Havuzda bekleyen</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold">
                {Number(total ?? "0").toFixed(3)} ETH
              </div>
              <div className="text-[11px] text-paper/70">Toplam bağış</div>
            </div>
          </div>
        )}
      </div>

      {/* form */}
      <div className="p-5">
        <div className="flex gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(p)}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                amount === p
                  ? "border-forest bg-sand text-forest dark:bg-[#142824] dark:text-[#34D0B6]"
                  : "border-line text-muted hover:border-forest/40 dark:border-[#21342F]"
              }`}
            >
              {p} ETH
            </button>
          ))}
          <div className="flex items-center gap-1 rounded-xl border border-line px-2.5 dark:border-[#21342F]">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              className="w-14 bg-transparent text-sm font-semibold text-ink outline-none dark:text-[#EAF1EF]"
            />
            <span className="font-mono text-[11px] text-tea">ETH</span>
          </div>
        </div>

        <input
          value={dedication}
          onChange={(e) => setDedication(e.target.value)}
          placeholder="İthaf notu (örn. Depremzede çocuklar için)"
          maxLength={80}
          className="mt-3 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[13px] text-ink outline-none placeholder:text-[#B8AE98] dark:border-[#21342F] dark:bg-[#0C1614] dark:text-[#EAF1EF]"
        />

        {isConnected ? (
          <button
            type="button"
            onClick={donate}
            disabled={busy}
            className="mt-3 w-full rounded-xl bg-hope py-3 text-sm font-bold text-hope-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Bağış işleniyor…" : "Hediye Et"}
          </button>
        ) : (
          <div className="mt-3">
            <WalletButton />
            <p className="mt-2 text-center text-[11px] text-muted">
              Bağış yapmak için cüzdan bağlayın (kurumlar & hayırseverler)
            </p>
          </div>
        )}

        {done && (
          <div className="mt-3 rounded-xl border border-[#DCE9E5] bg-[#EFF4F2] px-4 py-3 text-[13px] text-[#2A4A45] dark:border-[#21342F] dark:bg-[#142824] dark:text-[#9BE3C9]">
            🎁 Teşekkürler! Bağışın havuza eklendi — bir çocuğun öğrenmesine ve
            bir öğretmenin emeğine dokundun.
          </div>
        )}
        {error && (
          <div className="mt-3 rounded-xl border border-[#E7C9C3] bg-[#FBE9E5] px-4 py-3 text-[13px] text-[#9A3B2E]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function HeartGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s-7.5-4.7-10-9.3C.7 9 1.6 5.5 4.8 4.7 7 4.1 8.9 5.3 12 8c3.1-2.7 5-3.9 7.2-3.3 3.2.8 4.1 4.3 2.8 7C19.5 16.3 12 21 12 21Z"
        fill="#E89B3C"
        stroke="#E89B3C"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
