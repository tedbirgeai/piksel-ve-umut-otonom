// components/MessageBubble.tsx
"use client";

import PixelMark from "./PixelMark";
import CodeBlock from "./CodeBlock";
import type { Lesson } from "@/lib/types";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  lesson?: Lesson;
}

/** Metni ```fence``` bloklarına ve düz metne ayırır. */
function parseSegments(text: string) {
  const out: { type: "text" | "code"; content: string; lang?: string }[] = [];
  const re = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) {
      const t = text.slice(last, m.index).trim();
      if (t) out.push({ type: "text", content: t });
    }
    out.push({ type: "code", content: m[2].replace(/\n$/, ""), lang: m[1] || "kod" });
    last = re.lastIndex;
  }
  if (last < text.length) {
    const t = text.slice(last).trim();
    if (t) out.push({ type: "text", content: t });
  }
  if (out.length === 0) out.push({ type: "text", content: text });
  return out;
}

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-forest px-4 py-3 text-[14.5px] leading-relaxed text-paper dark:bg-[#1C4A44] dark:text-[#EAF6F3]">
          {message.text}
        </div>
      </div>
    );
  }

  const segments = parseSegments(message.text);
  const l = message.lesson;

  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex-shrink-0">
        <PixelMark size={30} gap={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-bold text-ink dark:text-[#EAF1EF]">
            Piksel·Umut
          </span>
          {l?.onChain && l.contentId !== null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-hope-soft px-2.5 py-0.5 font-mono text-[10.5px] font-semibold text-hope-ink dark:bg-[#2A2415] dark:text-[#F4C781]">
              🎓 Sertifika NFT #{l.contentId}
            </span>
          )}
          {l?.cid && (
            <span className="rounded-full bg-[#EFF4F2] px-2.5 py-0.5 font-mono text-[10.5px] font-semibold text-tea dark:bg-[#13211F]">
              IPFS {l.cid.slice(0, 8)}…
            </span>
          )}
        </div>
        <div className="rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3.5 text-[14.5px] leading-relaxed text-ink/90 dark:border-[#21342F] dark:bg-[#142824] dark:text-[#DCE7E4]">
          {segments.map((s, i) =>
            s.type === "code" ? (
              <CodeBlock key={i} code={s.content} lang={s.lang} />
            ) : (
              <p key={i} className="m-0 whitespace-pre-wrap break-words [&:not(:first-child)]:mt-2">
                {s.content}
              </p>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
