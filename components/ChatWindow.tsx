// components/ChatWindow.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { decodeEventLog, parseEther } from "viem";
import {
  ROYALTY_CONTRACT_ADDRESS,
  royaltyAbi,
  isContractConfigured,
} from "@/lib/contract";
import { generateContent, persistContent, newLesson } from "@/lib/actions";
import { getBranch } from "@/lib/curriculum.config";
import { useLibrary } from "./LibraryProvider";
import { useCurriculum } from "./CurriculumManager";
import MessageBubble, { type ChatMessage } from "./MessageBubble";
import Composer from "./Composer";
import WalletButton from "./WalletButton";
import PixelMark from "./PixelMark";
import type { Lesson } from "@/lib/types";

type Phase = "idle" | "generating" | "pinning" | "registering" | "done" | "error";

const SUGGESTIONS = [
  { icon: "🌱", text: "Fotosentezi günlük hayattan örneklerle anlat." },
  { icon: "🧩", text: "Kesirler konusunu oyunlaştırarak öğret." },
  { icon: "📜", text: "Cumhuriyet'in ilanını hikâye diliyle anlat." },
  { icon: "⚙️", text: "Newton yasalarını bir kod örneğiyle simüle et." },
];

export default function ChatWindow({
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
  const { sel, setStage, setLevel, setSubject } = useCurriculum("İlkokul");

  const [prompt, setPrompt] = useState("");
  const [price, setPrice] = useState("0.01");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const busy =
    phase === "generating" || phase === "pinning" || phase === "registering";

  useEffect(() => {
    if (!activeId) return;
    const l = lessons.find((x) => x.id === activeId);
    if (l?.body) {
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

  function patchLastLesson(lesson: Lesson) {
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

  async function handleSend() {
    const text = prompt.trim();
    if (!text || busy) return;
    setError(null);
    setNote(null);
    setPrompt("");
    setMessages((m) => [...m, { role: "user", text }]);

    const lesson = newLesson(
      { subject: sel.subject, stage: sel.stage, level: sel.level, prompt: text },
      price,
    );

    try {
      setPhase("generating");
      const body = await generateContent({
        subject: sel.subject,
        stage: sel.stage,
        level: sel.level,
        prompt: text,
      });
      let full: Lesson = { ...lesson, body };
      addLesson(full);
      onActiveChange(full.id);
      setMessages((m) => [...m, { role: "assistant", text: body, lesson: full }]);

      setPhase("pinning");
      const cid = await persistContent(full);
      full = { ...full, cid };
      updateLesson(full.id, { cid });
      patchLastLesson(full);

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
        args: [cid, parseEther(price || "0")],
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
          /* yoksay */
        }
      }
      full = { ...full, contentId, txHash: hash, onChain: true };
      updateLesson(full.id, { contentId, txHash: hash, onChain: true });
      patchLastLesson(full);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bilinmeyen hata.");
      setPhase("error");
    }
  }

  const empty = messages.length === 0;
  const branch = getBranch(sel.stage);

  return (
    <div className="flex h-full flex-1 flex-col bg-paper dark:bg-[#0C1614]">
      {/* üst bar */}
      <header className="flex items-center justify-between border-b border-line px-6 py-3 dark:border-[#21342F]">
        <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
          <span className="rounded-md bg-sand px-2 py-1 text-[12px] font-semibold text-forest dark:bg-[#142824] dark:text-[#34D0B6]">
            {sel.stage}
          </span>
          <span className="text-line">/</span>
          <span>{sel.level}</span>
          <span className="text-line">/</span>
          <span>{sel.subject}</span>
        </div>
        <WalletButton />
      </header>

      {/* akış */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-7">
        <div className="mx-auto max-w-3xl">
          {empty ? (
            <div className="flex flex-col items-center pt-10 text-center">
              <PixelMark size={60} gap={5} />
              <h2 className="mt-5 font-display text-[30px] font-bold tracking-tightest text-forest dark:text-[#34D0B6]">
                Bugün ne öğretelim?
              </h2>
              <p className="mt-2.5 max-w-md text-[14.5px] leading-relaxed text-muted">
                {branch.label} ({branch.context}) kademesine uygun pedagojik içerik
                üret. Yaz, konuş ya da bir belge bırak — bilgiyi özgürleştir.
              </p>
              <div className="mt-7 grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.text}
                    type="button"
                    onClick={() => setPrompt(s.text)}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-left text-[13.5px] text-ink transition-colors hover:border-forest/40 hover:bg-[#EFF4F2] dark:border-[#21342F] dark:bg-[#10201D] dark:text-[#EAF1EF] dark:hover:bg-[#142824]"
                  >
                    <span className="text-base">{s.icon}</span>
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}
              {busy && <ThinkingRow phase={phase} />}
            </div>
          )}

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
        </div>
      </div>

      {/* composer */}
      <Composer
        sel={sel}
        onStage={setStage}
        onLevel={setLevel}
        onSubject={setSubject}
        value={prompt}
        onChange={setPrompt}
        price={price}
        onPrice={setPrice}
        onSend={handleSend}
        busy={busy}
        onError={setError}
      />
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
    <div className="flex gap-3">
      <PixelMark size={30} gap={2.5} />
      <div>
        <div className="mb-1.5 text-[12.5px] font-bold text-ink dark:text-[#EAF1EF]">
          Piksel·Umut
        </div>
        <div className="inline-flex items-center gap-2.5 rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3 dark:border-[#21342F] dark:bg-[#142824]">
          <span className="flex gap-1">
            <Dot d="0s" />
            <Dot d="0.15s" />
            <Dot d="0.3s" />
          </span>
          <span className="text-[13px] text-muted">{label}</span>
        </div>
      </div>
    </div>
  );
}

function Dot({ d }: { d: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-tea"
      style={{
        animation: "fade-up 0.7s ease-in-out infinite alternate",
        animationDelay: d,
      }}
    />
  );
}
