// components/ChatWindow.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { decodeEventLog, parseEther } from "viem";
import {
  CERTIFICATE_CONTRACT_ADDRESS,
  certificateAbi,
  isContractConfigured,
} from "@/lib/contract";
import { generateContent, persistContent, newLesson } from "@/lib/actions";
import { getBranch } from "@/lib/curriculum.config";
import { buildSuggestions } from "@/lib/suggestions";
import { useLibrary } from "./LibraryProvider";
import { useCurriculum } from "./CurriculumManager";
import MessageBubble, { type ChatMessage } from "./MessageBubble";
import Composer from "./Composer";
import WalletButton from "./WalletButton";
import { useRole } from "./RoleProvider";
import AIStatus from "./AIStatus";
import PixelMark from "./PixelMark";
import type { Lesson } from "@/lib/types";

type Phase = "idle" | "generating" | "pinning" | "registering" | "done" | "error";

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
  const { sel, setStage, setLevel, setSubject } = useCurriculum();
  const { clearRole } = useRole();

  const [prompt, setPrompt] = useState("");
  const [price, setPrice] = useState("0.01");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState<Lesson | null>(null);
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

      // TASLAK durur — öğrenciye gitmez. Öğretmen gözden geçirip "Yayınla" der.
      setDraft(full);
      setPhase("done");
      setNote(
        "📝 Taslak hazır ve IPFS'e pinlendi. Gözden geçirin; uygunsa aşağıdan yayınlayın. Yayınlanana kadar öğrenciler göremez.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bilinmeyen hata.");
      setPhase("error");
    }
  }

  /** Onaylanan taslağı yayınlar: zincire mint eder (cüzdan varsa) veya demo modda
   *  yerel olarak "published" işaretler. Yayınlanınca öğrenci kütüphanesine düşer. */
  async function publish(lesson: Lesson) {
    setError(null);
    setNote(null);

    // Demo modu / cüzdansız: yerel olarak yayınla (öğrenci localStorage'dan görür)
    if (!isConnected || !isContractConfigured || !publicClient) {
      const published = {
        ...lesson,
        status: "published" as const,
        reviewedAt: Date.now(),
      };
      updateLesson(lesson.id, {
        status: "published",
        reviewedAt: published.reviewedAt,
      });
      patchLastLesson(published);
      setDraft(null);
      setNote(
        isConnected
          ? "✅ Yayınlandı (demo modu — zincir kaydı atlandı). Öğrenci kütüphanesinde görünür."
          : "✅ Yayınlandı. Öğrenciler görebilir. Zincire NFT olarak basmak için cüzdan bağlayın.",
      );
      return;
    }

    try {
      setPhase("registering");
      const hash = await writeContractAsync({
        address: CERTIFICATE_CONTRACT_ADDRESS,
        abi: certificateAbi,
        functionName: "mintCertificate",
        args: [
          lesson.cid ?? "",
          parseEther(lesson.accessPrice || "0"),
          sel.stage,
          sel.subject,
          lesson.title,
        ],
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      let tokenId: number | null = null;
      for (const log of receipt.logs) {
        try {
          const ev = decodeEventLog({
            abi: certificateAbi,
            data: log.data,
            topics: log.topics,
          });
          if (ev.eventName === "CertificateMinted") {
            tokenId = Number((ev.args as { tokenId: bigint }).tokenId);
            break;
          }
        } catch {
          /* yoksay */
        }
      }
      const published = {
        ...lesson,
        contentId: tokenId,
        tokenId,
        txHash: hash,
        onChain: true,
        status: "published" as const,
        reviewedAt: Date.now(),
      };
      updateLesson(lesson.id, {
        contentId: tokenId,
        tokenId,
        txHash: hash,
        onChain: true,
        status: "published",
        reviewedAt: published.reviewedAt,
      });
      patchLastLesson(published);
      setDraft(null);
      setPhase("done");
      setNote(
        tokenId !== null
          ? `🎓 Yayınlandı ve Üretim Sertifikası NFT #${tokenId} cüzdanınıza basıldı. Öğrenciler artık görebilir.`
          : "✅ Yayınlandı ve zincire kaydedildi.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yayınlama başarısız.");
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
        <div className="flex items-center gap-2">
          <AIStatus />
          <a
            href="/"
            className="rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-muted hover:border-forest hover:text-forest dark:border-[#21342F]"
          >
            Ana sayfa
          </a>
          <button
            type="button"
            onClick={clearRole}
            className="rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-muted hover:border-forest hover:text-forest dark:border-[#21342F]"
          >
            Rol değiştir
          </button>
          <WalletButton />
        </div>
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
                {buildSuggestions(sel.stage, sel.subject, sel.level).map((s) => (
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

          {/* GÖZDEN GEÇİR & YAYINLA — denetim hattı */}
          {draft && phase !== "registering" && (
            <div className="mt-5 rounded-2xl border-2 border-hope/40 bg-hope-soft/50 p-5 dark:border-[#3A2F16] dark:bg-[#211B0E]">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-hope px-2.5 py-0.5 text-[11px] font-bold text-hope-ink">
                  TASLAK · DENETİMDE
                </span>
                <span className="text-[12.5px] text-muted">
                  Yayınlanana kadar öğrenciler göremez
                </span>
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink/80 dark:text-[#DCE7E4]">
                İçeriği yukarıdan gözden geçirin. Pedagojik olarak doğru ve
                kademeye uygunsa <strong>yayınlayın</strong>; değilse düzeltmek
                için aynı konuyu yeniden üretin.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => publish(draft)}
                  className="flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-[13.5px] font-bold text-paper transition-colors hover:bg-forest-600 dark:bg-[#1C4A44] dark:text-[#EAF6F3]"
                >
                  ✓ Yayınla{" "}
                  {isConnected && isContractConfigured
                    ? "(zincire NFT olarak bas)"
                    : "(öğrencilere aç)"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(null);
                    setNote("Taslak beklemede bırakıldı. İstediğinizde yeni içerik üretebilirsiniz.");
                  }}
                  className="rounded-xl border border-line px-4 py-2.5 text-[13.5px] font-semibold text-muted hover:border-forest/40 dark:border-[#21342F]"
                >
                  Şimdilik taslak kalsın
                </button>
                <label className="ml-auto flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-[12px] text-muted dark:border-[#21342F] dark:bg-[#10201D]">
                  <span>Erişim ücreti</span>
                  <input
                    value={draft.accessPrice}
                    onChange={(e) =>
                      setDraft({ ...draft, accessPrice: e.target.value })
                    }
                    inputMode="decimal"
                    className="w-12 bg-transparent text-[12px] font-semibold text-ink outline-none dark:text-[#EAF1EF]"
                  />
                  <span className="font-mono text-[11px] text-tea">ETH</span>
                </label>
              </div>
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
