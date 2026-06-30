// components/ContentFactory.tsx
"use client";

import { useState } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { decodeEventLog, parseEther } from "viem";
import { generateLesson } from "@/lib/ollama";
import { pinLesson } from "@/lib/ipfs";
import {
  ROYALTY_CONTRACT_ADDRESS,
  royaltyAbi,
  isContractConfigured,
} from "@/lib/contract";
import { useLibrary } from "./LibraryProvider";
import type { Lesson } from "@/lib/types";

type Phase =
  | "idle"
  | "generating"
  | "pinning"
  | "registering"
  | "done"
  | "error";

const SUBJECTS = ["Matematik", "Fen Bilimleri", "Türkçe", "Tarih", "İngilizce"];
const GRADES = ["3. Sınıf", "4. Sınıf", "5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf"];

export default function ContentFactory() {
  const { addLesson, updateLesson } = useLibrary();
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [subject, setSubject] = useState(SUBJECTS[1]);
  const [grade, setGrade] = useState(GRADES[3]);
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

    const id = crypto.randomUUID();
    const draft: Lesson = {
      id,
      title: prompt.slice(0, 48),
      subject,
      grade,
      prompt,
      body: "",
      cid: null,
      createdAt: Date.now(),
      contentId: null,
      accessPrice,
      txHash: null,
      onChain: false,
    };

    try {
      // 1) Yerel YZ ile üret
      setPhase("generating");
      const { text } = await generateLesson({ subject, grade, prompt });
      let lesson: Lesson = { ...draft, body: text };
      addLesson(lesson);
      setResult(lesson);

      // 2) IPFS'e pinle
      setPhase("pinning");
      const cid = await pinLesson(lesson);
      lesson = { ...lesson, cid };
      updateLesson(id, { cid });
      setResult(lesson);

      // 3) Zincire kaydet (registerContent) — cüzdan + sözleşme gerekli
      if (!isConnected) {
        setNote(
          "Cüzdan bağlı değil — ders üretildi ve IPFS'e pinlendi. Zincire kaydetmek için cüzdan bağlayıp tekrar deneyin.",
        );
        setPhase("done");
        return;
      }
      if (!isContractConfigured || !publicClient) {
        setNote(
          "Telif sözleşmesi yapılandırılmadı (demo modu) — ders IPFS'e kaydedildi, zincire kayıt atlandı.",
        );
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

      // ContentRegistered olayından contentId'yi çöz
      let contentId: number | null = null;
      for (const log of receipt.logs) {
        try {
          const ev = decodeEventLog({
            abi: royaltyAbi,
            data: log.data,
            topics: log.topics,
          });
          if (ev.eventName === "ContentRegistered") {
            contentId = Number(
              (ev.args as { contentId: bigint }).contentId,
            );
            break;
          }
        } catch {
          /* bu log bizim olayımız değil */
        }
      }

      updateLesson(id, { contentId, txHash: hash, onChain: true });
      setResult({ ...lesson, contentId, txHash: hash, onChain: true });
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bilinmeyen hata.");
      setPhase("error");
    }
  }

  return (
    <div>
      <h3 className="font-display text-2xl font-semibold text-ink">
        İçerik Üretim Fabrikası
      </h3>
      <p className="mt-1 text-sm text-muted">
        Yerel yapay zekâ ile üret → IPFS'e pinle → telif sözleşmesine kaydet.
        Uçtan uca otonom.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="card !p-4">
          <span className="mb-1.5 block text-[11.5px] text-muted">Ders</span>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-ink outline-none"
          >
            {SUBJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="card !p-4">
          <span className="mb-1.5 block text-[11.5px] text-muted">Sınıf</span>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-ink outline-none"
          >
            {GRADES.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <label className="card !p-4">
          <span className="mb-1.5 block text-[11.5px] text-muted">
            Erişim ücreti (ETH)
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={accessPrice}
            onChange={(e) => setAccessPrice(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-ink outline-none"
          />
        </label>
      </div>

      <label className="card mt-3 block">
        <span className="mb-2 block text-[11.5px] text-muted">Konu istemi</span>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-ink outline-none"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={busy}
            className="btn-forest disabled:opacity-60"
          >
            {phase === "generating"
              ? "Üretiliyor…"
              : phase === "pinning"
                ? "IPFS'e pinleniyor…"
                : phase === "registering"
                  ? "Zincire kaydediliyor…"
                  : "⚡ Üret → Pinle → Zincire kaydet"}
          </button>
        </div>
      </label>

      <Pipeline phase={phase} />

      {note && (
        <div className="mt-4 rounded-xl border border-[#DCE9E5] bg-[#EFF4F2] px-4 py-3 text-[13px] text-[#2A4A45]">
          {note}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-[#E7C9C3] bg-[#FBE9E5] px-4 py-3 text-[13px] text-[#9A3B2E]">
          {error}
        </div>
      )}

      {result?.body && (
        <article className="card mt-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-ink">
              {result.subject} · {result.grade}
            </span>
            <span className="flex items-center gap-2">
              {result.onChain && result.contentId !== null && (
                <span className="rounded-full bg-hope-soft px-2.5 py-1 font-mono text-[11px] font-semibold text-hope-ink">
                  zincirde #{result.contentId}
                </span>
              )}
              <span className="font-mono text-[11.5px] text-tea">
                {result.cid
                  ? `CID: ${result.cid.slice(0, 12)}…`
                  : "pinleniyor…"}
              </span>
            </span>
          </div>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink/90">
            {result.body}
          </p>
        </article>
      )}
    </div>
  );
}

function Pipeline({ phase }: { phase: Phase }) {
  const steps = [
    { key: "konu", label: "Konu", done: phase !== "idle" },
    {
      key: "yz",
      label: "YZ taslağı",
      done: ["pinning", "registering", "done"].includes(phase),
      active: phase === "generating",
    },
    {
      key: "pin",
      label: "IPFS pin",
      done: ["registering", "done"].includes(phase),
      active: phase === "pinning",
    },
    {
      key: "chain",
      label: "Zincire kayıt",
      done: phase === "done",
      active: phase === "registering",
    },
  ];

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      {steps.map((s, i) => (
        <span key={s.key} className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] font-semibold ${
              s.done
                ? "bg-[#EFF4F2] text-forest"
                : s.active
                  ? "bg-hope-soft text-hope-ink"
                  : "bg-sand text-muted"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-sm ${
                s.done ? "bg-tea" : s.active ? "bg-hope" : "bg-line"
              }`}
            />
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="text-line">→</span>}
        </span>
      ))}
    </div>
  );
}
