// components/FileDrop.tsx
"use client";

import { useRef, useState } from "react";
import { extractText, clampForPrompt } from "@/lib/extract";

/**
 * Sürükle-bırak destekli profesyonel dosya yükleme alanı.
 * PDF/DOCX/TXT metnini tarayıcıda çıkarır ve onText ile verir.
 */
export default function FileDrop({
  onText,
  onError,
  compact = false,
}: {
  onText: (text: string, fileName: string) => void;
  onError?: (msg: string) => void;
  compact?: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handle(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    setBusy(true);
    try {
      const { text, source } = await extractText(file);
      if (!text) throw new Error("Belgeden metin çıkarılamadı.");
      setName(source);
      onText(clampForPrompt(text), source);
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "Belge işlenemedi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handle(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed transition-colors ${
        compact ? "px-3 py-2.5" : "px-4 py-5 justify-center"
      } ${
        dragOver
          ? "border-forest bg-[#EFF4F2]"
          : "border-line bg-paper hover:border-forest/40"
      }`}
    >
      <DocGlyph />
      <div className={compact ? "" : "text-left"}>
        <div className="text-[13px] font-semibold text-ink">
          {busy
            ? "Belge okunuyor…"
            : name
              ? `Eklendi: ${name}`
              : "Belge sürükleyin ya da tıklayın"}
        </div>
        {!compact && (
          <div className="text-[11.5px] text-muted">
            PDF · DOCX · TXT — metin otomatik çıkarılır, sunucuya gitmez
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
    </div>
  );
}

function DocGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
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
