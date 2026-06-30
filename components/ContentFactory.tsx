// components/ContentFactory.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { decodeEventLog, parseEther } from "viem";
import { generateLesson } from "@/lib/ollama";
import { pinLesson } from "@/lib/ipfs";
import { extractText, clampForPrompt } from "@/lib/extract";
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

const SUBJECTS = ["Matematik", "Fen Bilimleri", "Türkçe", "Tarih", "İngilizce", "Sosyal Bilgiler"];

/** Profesyonel eğitim kademeleri — YZ pedagojik dili buna göre ayarlar. */
const LEVELS: { key: string; hint: string }[] = [
  { key: "Kreş", hint: "3–5 yaş" },
  { key: "İlkokul", hint: "6–10 yaş" },
  { key: "Ortaokul", hint: "11–14 yaş" },
  { key: "Lise", hint: "15–18 yaş" },
  { key: "Üniversite", hint: "Lisans" },
  { key: "Akademik", hint: "Araştırma" },
];

export default function ContentFactory() {
  const { addLesson, updateLesson } = useLibrary();
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [subject, setSubject] = useState(SUBJECTS[1]);
  const [level, setLevel] = useState(LEVELS[1].key);
  const [prompt, setPrompt] = useState(
    "Fotosentezi günlük hayattan örneklerle anlat.",
  );
  const [accessPrice, setAccessPrice] = useState("0.01");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  // Multimodal durum
  const [listening, setListening] = useState(false);
  const [docName, setDocName] = useState<string | null>(null);
  const [docBusy, setDocBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const recRef = useRef<unknown>(null);
  const baseRef = useRef<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const busy =
    phase === "generating" || phase === "pinning" || phase === "registering";

  // --- Mikrofon: Web Speech API (tr-TR) ---
  const toggleMic = useCallback(() => {
    setError(null);
    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition })
        .SpeechRecognition ??
      (
        window as unknown as {
          webkitSpeechRecognition?: new () => SpeechRecognition;
        }
      ).webkitSpeechRecognition;

    if (!SR) {
      setNote(
        "Tarayıcınız sesli girişi desteklemiyor (Chrome/Edge önerilir).",
      );
      return;
    }

    if (listening) {
      (recRef.current as SpeechRecognition | null)?.stop();
      return;
    }

    const rec = new SR();
    rec.lang = "tr-TR";
    rec.continuous = true;
    rec.interimResults = true;
    baseRef.current = prompt ? prompt.trim() + " " : "";

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let finalTxt = "";
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTxt += t;
        else interim += t;
      }
      if (finalTxt) baseRef.current += finalTxt + " ";
      setPrompt((baseRef.current + interim).trimStart());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    rec.start();
    recRef.current = rec;
    setListening(true);
  }, [listening, prompt]);

  // --- Doküman: PDF / DOCX / TXT metin çıkarımı ---
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setError(null);
    setNote(null);
    setDocBusy(true);
    try {
      const { text, source } = await extractText(file);
      if (!text) throw new Error("Belgeden metin çıkarılamadı.");
      setDocName(source);
      setPrompt((prev) =>
        (prev ? prev.trim() + "\n\n" : "") +
        `[Belge: ${source}]\n` +
        clampForPrompt(text),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Belge işlenemedi.");
    } finally {
      setDocBusy(false);
    }
  }, []);

  async function handleGenerate() {
    setError(null);
    setNote(null);
    setResult(null);

    const id = crypto.randomUUID();
    const draft: Lesson = {
      id,
      title: prompt.replace(/\[Belge:[^\]]*\]/g, "").trim().slice(0, 48) ||
        `${subject} · ${level}`,
      subject,
      grade: level,
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
      setPhase("generating");
      const { text } = await generateLesson({ subject, grade: level, prompt });
      let lesson: Lesson = { ...draft, body: text };
      addLesson(lesson);
      setResult(lesson);

      setPhase("pinning");
      const cid = await pinLesson(lesson);
      lesson = { ...lesson, cid };
      updateLesson(id, { cid });
      setResult(lesson);

      if (!isConnected) {
        setNote(
          "Cüzdan bağlı değil — ders üretildi ve IPFS'e pinlendi. Zincire kaydetmek için cüzdan bağlayın.",
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

      let contentId: number | null = null;
      for (const log of receipt.logs) {
        try {
          const ev = decodeEventLog({
            abi: royaltyAbi,
            data: log.data,
            topics: log.topics,
          });
          if (ev.eventName === "ContentRegistered") {
            contentId = Number((ev.args as { contentId: bigint }).contentId);
            break;
          }
        } catch {
          /* bizim olayımız değil */
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-semibold text-ink">
            Çalışma Masası
          </h3>
          <p className="mt-1 text-sm text-muted">
            Yazın, konuşun ya da belge bırakın — üret, IPFS'e pinle, zincire kaydet.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[11.5px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-tea" />
          Yerel motor · gizli ve çevrimdışı
        </div>
      </div>

      {/* Ders + erişim ücreti */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
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

      {/* Eğitim kademesi — segmented seçici */}
      <div className="mt-3">
        <span className="mb-2 block text-[11.5px] text-muted">
          Eğitim kademesi
        </span>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => {
            const active = level === l.key;
            return (
              <button
                key={l.key}
                type="button"
                onClick={() => setLevel(l.key)}
                className={`flex flex-col items-start rounded-xl border px-3.5 py-2 transition-colors ${
                  active
                    ? "border-forest bg-forest text-paper"
                    : "border-line bg-white text-ink hover:border-forest/40"
                }`}
              >
                <span className="text-[13px] font-semibold">{l.key}</span>
                <span
                  className={`text-[10.5px] ${active ? "text-paper/70" : "text-muted"}`}
                >
                  {l.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Konu istemi — mikrofonlu */}
      <div className="card mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11.5px] text-muted">Konu istemi</span>
          <button
            type="button"
            onClick={toggleMic}
            aria-pressed={listening}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              listening
                ? "bg-[#FBE4E0] text-[#B23A2E]"
                : "bg-sand text-ink hover:bg-[#EAE3D4]"
            }`}
          >
            <MicIcon active={listening} />
            {listening ? "Dinleniyor… (durdur)" : "Sesli yaz"}
          </button>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          placeholder="Konuyu yazın, mikrofona konuşun veya aşağıya belge bırakın…"
          className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-ink outline-none placeholder:text-[#B8AE98]"
        />

        {/* Doküman bırakma alanı */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-3 flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors ${
            dragOver
              ? "border-forest bg-[#EFF4F2]"
              : "border-line bg-paper hover:border-forest/40"
          }`}
        >
          <DocIcon />
          <div className="text-left">
            <div className="text-[13px] font-semibold text-ink">
              {docBusy
                ? "Belge okunuyor…"
                : docName
                  ? `Eklendi: ${docName}`
                  : "Belge sürükleyin ya da tıklayın"}
            </div>
            <div className="text-[11.5px] text-muted">
              PDF · DOCX · TXT — metin otomatik çıkarılır
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        <div className="mt-4 flex justify-end">
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
      </div>

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
                {result.cid ? `CID: ${result.cid.slice(0, 12)}…` : "pinleniyor…"}
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

function MicIcon({ active }: { active: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {active && <circle cx="20" cy="5" r="3" fill="#E07A5F" />}
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke="#0F3D3A"
        strokeWidth="1.6"
        fill="#fff"
      />
      <path d="M14 2v6h6" stroke="#0F3D3A" strokeWidth="1.6" fill="none" />
      <path
        d="M8 13h8M8 17h5"
        stroke="#E89B3C"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
