// components/CodeBlock.tsx
"use client";

import { useState } from "react";

/** Kopyalama düğmeli kod bloğu (Gemini/Claude tarzı). */
export default function CodeBlock({
  code,
  lang = "kod",
}: {
  code: string;
  lang?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard izni yok */
    }
  }

  return (
    <div className="my-2.5 overflow-hidden rounded-xl border border-[#0B2421] dark:border-black/40">
      <div className="flex items-center justify-between bg-[#0B2421] px-3 py-1.5 dark:bg-[#0A1A17]">
        <span className="font-mono text-[11px] text-tea">{lang}</span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#D7E6E2] opacity-85 transition-opacity hover:opacity-100"
        >
          {copied ? "Kopyalandı ✓" : "Kopyala"}
        </button>
      </div>
      <pre className="m-0 overflow-x-auto bg-[#10302D] px-3.5 py-3 font-mono text-[12.5px] leading-relaxed text-[#D7E6E2] dark:bg-[#06100E]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
