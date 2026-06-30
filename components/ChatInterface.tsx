// components/ChatInterface.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { decodeEventLog, parseEther } from "viem";
import {
  ROYALTY_CONTRACT_ADDRESS,
  royaltyAbi,
  isContractConfigured,
} from "@/lib/contract";
import {
  generateContent,
  persistContent,
  newLesson,
} from "@/lib/actions";
import { getStage } from "@/lib/curriculum";
import { useLibrary } from "./LibraryProvider";
import LevelSelector from "./LevelSelector";
import VoiceInput from "./VoiceInput";
import FileDrop from "./FileDrop";
import PixelMark from "./PixelMark";
import WalletButton from "./WalletButton";
import type { Lesson } from "@/lib/types";

type Phase = "idle" | "generating" | "pinning" | "registering" | "done" | "error";

interface ChatMsg {
  role: "user" | "assistant";
  text: string;
  lesson?: Lesson;
}

const SUGGESTIONS = [
  "Fotosentezi günlük hayattan örneklerle anlat.",
  "Kesirler konusunu oyunlaştırarak öğret.",
  "Cumhuriyet'in ilanını hikâye diliyle anlat.",
  "Newton'un hareket yasalarını sınav odaklı özetle.",
];

export default function ChatInterface({
  activeId,
  onActiveChange,
}: {
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
}) {
  const { addLesson, updateLesson, lessons } = useLibrary();
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const initial = getStage("İlkokul");
  const [stage, setStage] = useState("İlkokul");
  const [level, setLevel] = useState(initial.levels[0]);
  const [subject, setSubject] = useState(initial.subjects[0]);
  const [accessPrice, setAccessPrice] = useState("0.01");

  const [prompt, setPrompt] = useState("");
  const [interim, setInterim] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const busy =
    phase === "generating" || phase === "pinning" || phase === "registering";

  // Sidebar'dan geçmiş seçimi → mesaj olarak yükle
  useEffect(() => {
    if (!activeId) return;
    const l = lessons.find((x) => x.id === activeId);
    if (l && l.body) {
      setMessages([
        { role: "user", text: l.prompt },
        { role: "assistant", text: l.body, lesson: l },
      ]);
    }
  }, [activeId, lessons]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, phase]);

  async function handleSend() {
    const text = (prompt + " " + interim).trim();
    if (!text || busy) return;
    setError(null);
    setNote(null);
    setInterim("");
    setPrompt("");

    setMessages((m) => [...m, { role: "user", text }]);

    const lesson = newLesson({ subject, stage, level, prompt: text }, accessPrice);

    try {
      setPhase("generating");
      const body = await generateContent({ subject, stage, level, prompt: text });
      let full: Lesson = { ...lesson, body };
      addLesson(full);
      onActiveChange(full.id);
      setMessages((m) => [...m, { role: "assistant", text: body, lesson: full }]);

      setPhase("pinning");
      const cid = await persistContent(full);
      full = { ...full, cid };
      updateLesson(full.id, { cid });
      patchLast(full);

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
      patchLast(full);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bilinmeyen hata.");
      setPhase("error");
    }
  }

  function patchLast(lesson: Lesson) {
    setMessages((m) => {
      const copy = [...m];
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === "assistant") {
          copy[i] = { ...copy[i], lesson };
          break;
        }
      }
      return copy;
    });
  }

  const empty = messages.length === 0;

  return (
    <div className="flex h-full flex-1 flex-col bg-paper">
      {/* üst bar */}
      <header className="flex items-center justify-between border-b border-line px-6 py-3">
        <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
          <span className="rounded-md bg-sand px-2 py-1 text-[12px] font-semibold text-forest">
            {stage}
          </span>
          <span className="text-line">/</span>
          <span>{level}</span>
          <span className="text-line">/</span>
          <span>{subject}</span>
        </div>
        <WalletButton />
      </header>

      {/* mesaj akışı */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-3xl">
          {empty ? (
            <EmptyState onPick={(s) => setPrompt(s)} stage={stage} />
          ) : (
            <div className="flex flex-col gap-6">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <UserBubble key={i} text={m.text} />
                ) : (
                  <AssistantBubble key={i} text={m.text} lesson={m.lesson} />
                ),
              )}
              {busy && <ThinkingRow phase={phase} />}
            </div>
          )}
          {note && (
            <div className="mx-auto mt-4 max-w-3xl rounded-xl border border-[#DCE9E5] bg-[#EFF4F2] px-4 py-3 text-[13px] text-[#2A4A45]">
              {note}
            </div>
          )}
          {error && (
            <div className="mx-auto mt-4 max-w-3xl rounded-xl border border-[#E7C9C3] bg-[#FBE9E5] px-4 py-3 text-[13px] text-[#9A3B2E]">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* composer */}
      <div className="border-t border-line bg-white px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-2.5">
            <LevelSelector
              stage={stage}
              level={level}
              subject={subject}
              onChange={(n) => {
                setStage(n.stage);
                setLevel(n.level);
                setSubject(n.subject);
              }}
            />
          </div>

          <div className="rounded-2xl border border-line bg-paper p-2.5 shadow-soft">
            <textarea
              value={interim ? `${prompt} ${interim}`.trim() : prompt}
              onChange={(e) => {
                setInterim("");
                setPrompt(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              placeholder="Konuyu yazın, mikrofona konuşun veya belge bırakın… (Enter ile gönder)"
              className="w-full resize-none bg-transparent px-2 py-1.5 text-[15px] leading-relaxed text-ink outline-none placeholder:text-[#B8AE98]"
            />
            <div className="flex items-center gap-2 px-1 pt-1">
              <VoiceInput
                onFinal={(t) => setPrompt((p) => (p ? p + " " + t : t))}
                onInterim={(t) => setInterim(t)}
              />
              <div className="min-w-0 flex-1">
                <FileDrop
                  compact
                  onText={(text, fileName) =>
                    setPrompt((p) =>
                      (p ? p.trim() + "\n\n" : "") + `[Belge: ${fileName}]\n` + text,
                    )
                  }
                  onError={(m) => setError(m)}
                />
              </div>
              <label className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-2.5 py-2 text-[12px] text-muted">
                <span>Ücret</span>
                <input
                  value={accessPrice}
                  onChange={(e) => setAccessPrice(e.target.value)}
                  inputMode="decimal"
                  className="w-12 bg-transparent text-[12px] font-semibold text-ink outline-none"
                />
                <span className="font-mono text-[11px] text-tea">ETH</span>
              </label>
              <button
                type="button"
                onClick={handleSend}
                disabled={busy}
                className="grid h-10 w-10 place-items-center rounded-xl bg-hope text-hope-ink transition-colors hover:bg-[#d98b2a] disabled:opacity-50"
                title="Üret → Pinle → Zincire kaydet"
              >
                <SendGlyph />
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted">
            İçerik yerel YZ ile üretilir, IPFS'e pinlenir ve telif sözleşmesine
            kaydedilir. Üretici hakkı şeffaftır.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  onPick,
  stage,
}: {
  onPick: (s: string) => void;
  stage: string;
}) {
  return (
    <div className="flex flex-col items-center pt-12 text-center">
      <PixelMark size={56} gap={4} />
      <h2 className="mt-5 font-display text-[28px] font-bold tracking-tightest text-forest">
        Ne öğretelim?
      </h2>
      <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-muted">
        {stage} kademesine uygun pedagojik içerik üret. Yaz, konuş ya da bir
        belge bırak — gerisini ekosistem halleder.
      </p>
      <div className="mt-7 grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-xl border border-line bg-white px-4 py-3 text-left text-[13.5px] text-ink transition-colors hover:border-forest/40 hover:bg-[#EFF4F2]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-forest px-4 py-3 text-[14.5px] leading-relaxed text-paper">
        {text}
      </div>
    </div>
  );
}

function AssistantBubble({ text, lesson }: { text: string; lesson?: Lesson }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex-shrink-0">
        <PixelMark size={28} gap={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        {lesson && (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {lesson.onChain && lesson.contentId !== null && (
              <span className="rounded-full bg-hope-soft px-2.5 py-1 font-mono text-[11px] font-semibold text-hope-ink">
                zincirde #{lesson.contentId}
              </span>
            )}
            {lesson.cid && (
              <span className="rounded-full bg-[#EFF4F2] px-2.5 py-1 font-mono text-[11px] font-semibold text-forest">
                IPFS: {lesson.cid.slice(0, 10)}…
              </span>
            )}
          </div>
        )}
        <div className="whitespace-pre-wrap rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3 text-[14.5px] leading-relaxed text-ink/90">
          {text}
        </div>
      </div>
    </div>
  );
}

function ThinkingRow({ phase }: { phase: Phase }) {
  const label =
    phase === "generating"
      ? "Yerel YZ içeriği üretiyor…"
      : phase === "pinning"
        ? "IPFS'e pinleniyor…"
        : "Telif sözleşmesine kaydediliyor…";
  return (
    <div className="flex items-center gap-3">
      <PixelMark size={28} gap={2.5} />
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3">
        <span className="flex gap-1">
          <Dot d="0" />
          <Dot d="0.15s" />
          <Dot d="0.3s" />
        </span>
        <span className="text-[13px] text-muted">{label}</span>
      </div>
    </div>
  );
}

function Dot({ d }: { d: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-tea"
      style={{ animation: "fade-up 0.8s ease-in-out infinite alternate", animationDelay: d }}
    />
  );
}

function SendGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h13M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
