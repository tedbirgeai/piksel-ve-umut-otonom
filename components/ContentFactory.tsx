// components/ContentFactory.tsx
"use client";

import { useState } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { decodeEventLog, parseEther } from "viem";
import {
  ROYALTY_CONTRACT_ADDRESS,
  royaltyAbi,
  isContractConfigured,
} from "@/lib/contract";
import { generateContent, persistContent, newLesson } from "@/lib/actions";
import { useLibrary } from "./LibraryProvider";
import CurriculumManager, { useCurriculum } from "./CurriculumManager";
import VoiceInput from "./VoiceInput";
import FileDrop from "./FileDrop";
import type { Lesson } from "@/lib/types";

type Phase = "idle" | "generating" | "pinning" | "registering" | "done" | "error";

/**
 * İçerik Üretim Fabrikası — TAM OTONOM.
 * Müfredat (kademe/seviye/ders) verisi BU dosyada DEĞİL; merkezi kaynaktan gelir:
 *   data/curriculum.json → lib/curriculum.config.ts → useCurriculum()/CurriculumManager
 * Burada hiçbir sabit (hardcoded) SUBJECTS/LEVELS dizisi YOKTUR.
 */
export default function ContentFactory() {
  const { addLesson, updateLesson } = useLibrary();
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Bağımlı seçim durumu — tek kaynaktan (curriculum.config) beslenir.
  const { sel, setStage, setLevel, setSubject } = useCurriculum("İlkokul");

  const [prompt, setPrompt] = useState(
    "Fotosentezi günlük hayattan örneklerle anlat.",
  );
  const [accessPrice, setAccessPrice] = useState("0.01");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const busy =
    phase === "generating" || phase === "pinning" || phase === "registering";

  async function handleGenerate() {
    setError(null);
    setNote(null);
    setResult(null);

    const lesson = newLesson(
      { subject: sel.subject, stage: sel.stage, level: sel.level, prompt },
      accessPrice,
    );

    try {
      setPhase("generating");
      const body = await generateContent({
        subject: sel.subject,
        stage: sel.stage,
        level: sel.level,
        prompt,
      });
      let full: Lesson = { ...lesson, body };
      addLesson(full);
      setResult(full);

      setPhase("pinning");
      const cid = await persistContent(full);
      full = { ...full, cid };
      updateLesson(full.id, { cid });
      setResult(full);

      if (!isConnected) {
        setNote("Cüzdan bağlı değil — ders üretildi ve IPFS'e pinlendi. Zincire kaydetmek için cüzdan bağlayın.");
        setPhase("done");
        return;
      }
      if (!isContractConfigured || !publicClient) {
        setNote("Telif sözleşmesi yapılandırılmadı (demo modu) — zincir kaydı atlandı.");
        setPhase("done");
        return;
      }

      setPhase("registering");
      const hash = await writeContractAsync({
        address: ROYALTY_CONTRACT_ADDRESS,
        abi: royaltyAbi,
        functionName: "registerContent",
        args: [cid, parseEther(accessPrice || "0")],
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      let contentId: number | null = null;
      for (const log of receipt.logs) {
        try {
          const ev = decodeEventLog({ abi: royaltyAbi, data: log.data, topics: log.topics });
          if (ev.eventName === "ContentRegistered") {
            contentId = Number((ev.args as { contentId: bigint }).contentId);
            break;
          }
        } catch {
          /* bizim olayımız değil */
        }
      }
      full = { ...full, contentId, txHash: hash, onChain: true };
      updateLesson(full.id, { contentId, txHash: hash, onChain: true });
      setResult(full);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bilinmeyen hata.");
      setPhase("error");
    }
  }

  return (
    <div>
      <h3 className="font-display text-2xl font-semibold text-ink dark:text-[#EAF1EF]">
        İçerik Üretim Fabrikası
      </h3>
      <p className="mt-1 text-sm text-muted">
        Müfredat merkezi <code className="font-mono text-[12px] text-tea">data/curriculum.json</code>{" "}
        kaynağından gelir — yaz, konuş ya da belge bırak; üret, pinle, zincire kaydet.
      </p>

      {/* Bağımlı müfredat seçicileri — merkezi veriden */}
      <div className="mt-5">
        <CurriculumManager
          sel={sel}
          onStage={setStage}
          onLevel={setLevel}
          onSubject={setSubject}
        />
      </div>

      {/* İstem + erişim ücreti */}
      <div className="mt-3 rounded-2xl border border-line bg-white p-3 shadow-soft dark:border-[#21342F] dark:bg-[#10201D]">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="Konuyu yazın, mikrofona konuşun veya belge bırakın…"
          className="w-full resize-none bg-transparent px-2 py-1.5 text-[15px] leading-relaxed text-ink outline-none placeholder:text-[#B8AE98] dark:text-[#EAF1EF]"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <VoiceInput onFinal={(t) => setPrompt((p) => (p ? p + " " + t : t))} />
          <div className="min-w-[180px] flex-1">
            <FileDrop
              compact
              onText={(text, fileName) =>
                setPrompt((p) => (p ? p.trim() + "\n\n" : "") + `[Belge: ${fileName}]\n` + text)
              }
              onError={setError}
            />
          </div>
          <label className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-2.5 py-2 text-[12px] text-muted dark:border-[#21342F] dark:bg-[#0C1614]">
            <span>Ücret</span>
            <input
              value={accessPrice}
              onChange={(e) => setAccessPrice(e.target.value)}
              inputMode="decimal"
              className="w-12 bg-transparent text-[12px] font-semibold text-ink outline-none dark:text-[#EAF1EF]"
            />
            <span className="font-mono text-[11px] text-tea">ETH</span>
          </label>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={busy}
            className="flex h-10 items-center gap-2 rounded-xl bg-hope px-4 text-[13px] font-bold text-hope-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {phase === "generating"
              ? "Üretiliyor…"
              : phase === "pinning"
                ? "Pinleniyor…"
                : phase === "registering"
                  ? "Zincire…"
                  : "Üret → Pinle → Zincire kaydet"}
          </button>
        </div>
      </div>

      {note && (
        <div className="mt-4 rounded-xl border border-[#DCE9E5] bg-[#EFF4F2] px-4 py-3 text-[13px] text-[#2A4A45] dark:border-[#21342F] dark:bg-[#142824] dark:text-[#9BE3C9]">
          {note}
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-xl border border-[#E7C9C3] bg-[#FBE9E5] px-4 py-3 text-[13px] text-[#9A3B2E]">
          {error}
        </div>
      )}

      {result?.body && (
        <article className="mt-4 rounded-2xl border border-line bg-white p-4 dark:border-[#21342F] dark:bg-[#142824]">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-ink dark:text-[#EAF1EF]">
              {result.subject} · {result.grade}
            </span>
            <span className="flex items-center gap-2">
              {result.onChain && result.contentId !== null && (
                <span className="rounded-full bg-hope-soft px-2.5 py-1 font-mono text-[11px] font-semibold text-hope-ink dark:bg-[#2A2415] dark:text-[#F4C781]">
                  zincirde #{result.contentId}
                </span>
              )}
              <span className="font-mono text-[11.5px] text-tea">
                {result.cid ? `CID: ${result.cid.slice(0, 12)}…` : "pinleniyor…"}
              </span>
            </span>
          </div>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink/90 dark:text-[#DCE7E4]">
            {result.body}
          </p>
        </article>
      )}
    </div>
  );
}
