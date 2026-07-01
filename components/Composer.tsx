// components/Composer.tsx
"use client";

import VoiceInput from "./VoiceInput";
import CurriculumManager, { type CurriculumSelection } from "./CurriculumManager";
import { extractText, clampForPrompt } from "@/lib/extract";
import { getUnits } from "@/lib/curriculum.config";
import { useRef, useState } from "react";

/**
 * Üretim Fabrikası composer'ı:
 * bağımlı müfredat seçicileri + metin + sesli yazma + dosya + ücret + "Üret".
 */
export default function Composer({
  sel,
  onStage,
  onLevel,
  onSubject,
  value,
  onChange,
  price,
  onPrice,
  onSend,
  busy,
  onError,
}: {
  sel: CurriculumSelection;
  onStage: (v: string) => void;
  onLevel: (v: string) => void;
  onSubject: (v: string) => void;
  value: string;
  onChange: (v: string) => void;
  price: string;
  onPrice: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  onError?: (msg: string) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // MEB kazanım ağacı: bu seçim için ünite/konu varsa opsiyonel seçici göster
  const units = getUnits(sel.stage, sel.subject, sel.level);

  function applyTopic(topic: string) {
    if (!topic) return;
    onChange(
      `"${topic}" konusunu ${sel.stage} ${sel.level} seviyesine uygun, ` +
        `${sel.subject} dersi kazanımlarına göre anlat.`,
    );
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    try {
      const { text, source } = await extractText(files[0]);
      if (!text) throw new Error("Belgeden metin çıkarılamadı.");
      setFileName(source);
      onChange(
        (value ? value.trim() + "\n\n" : "") +
          `[Belge: ${source}]\n` +
          clampForPrompt(text),
      );
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "Belge işlenemedi.");
    }
  }

  return (
    <div className="px-6 pb-5 pt-3.5">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2.5">
          <CurriculumManager
            sel={sel}
            onStage={onStage}
            onLevel={onLevel}
            onSubject={onSubject}
          />
        </div>

        {units.length > 0 && (
          <div className="mb-2.5 rounded-xl border border-line bg-white px-3.5 py-2.5 dark:border-[#21342F] dark:bg-[#10201D]">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-faint">
                MEB Kazanım — Ünite / Konu
              </span>
              <span className="rounded-full bg-sand px-2 py-0.5 text-[9.5px] font-semibold text-forest dark:bg-[#142824] dark:text-[#34D0B6]">
                müfredata bağlı
              </span>
            </div>
            <select
              defaultValue=""
              onChange={(e) => applyTopic(e.target.value)}
              className="w-full cursor-pointer bg-transparent text-[13.5px] font-medium text-ink outline-none dark:text-[#EAF1EF]"
            >
              <option value="" disabled>
                Konu seç → istem otomatik hazırlansın
              </option>
              {units.map((u) => (
                <optgroup key={u.unit} label={u.unit}>
                  {u.topics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}

        <div className="rounded-[18px] border border-line bg-white p-3 shadow-soft dark:border-[#21342F] dark:bg-[#10201D]">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={2}
            placeholder="Konuyu yazın, mikrofona konuşun veya belge bırakın… (Enter ile gönder)"
            className="w-full resize-none bg-transparent px-2 py-1.5 text-[15px] leading-relaxed text-ink outline-none placeholder:text-[#B8AE98] dark:text-[#EAF1EF]"
          />
          <div className="flex items-center gap-2 pt-1.5">
            <VoiceInput
              onFinal={(t) => onChange(value ? value + " " + t : t)}
            />

            <div
              onClick={() => fileRef.current?.click()}
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
              className={`flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-xl border border-dashed px-3 py-2.5 transition-colors ${
                dragOver
                  ? "border-forest bg-[#EFF4F2] dark:bg-[#13211F]"
                  : "border-line hover:border-forest/40 dark:border-[#21342F]"
              }`}
            >
              <DocGlyph />
              <span className="truncate text-[12.5px] font-semibold text-muted">
                {fileName ? `Eklendi: ${fileName}` : "Belge yükle (PDF · DOCX · TXT)"}
              </span>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            <label className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-2.5 py-2 text-[12px] text-muted dark:border-[#21342F] dark:bg-[#0C1614]">
              <input
                value={price}
                onChange={(e) => onPrice(e.target.value)}
                inputMode="decimal"
                className="w-9 bg-transparent text-[12px] font-semibold text-ink outline-none dark:text-[#EAF1EF]"
              />
              <span className="font-mono text-[11px] text-tea">ETH</span>
            </label>

            <button
              type="button"
              onClick={onSend}
              disabled={busy || !value.trim()}
              title={
                !value.trim()
                  ? "Önce bir konu yazın, konuşun veya belge yükleyin"
                  : "Üret → IPFS'e pinle (taslak)"
              }
              className="flex h-10 flex-shrink-0 items-center gap-2 rounded-xl bg-hope px-4 text-[13px] font-bold text-hope-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "İşleniyor…" : "Üret"}
              <SendGlyph />
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted">
          Yerel YZ ile üretilir · IPFS'e pinlenir · telif sözleşmesine kaydedilir.
          Üretici hakkı şeffaftır.
        </p>
      </div>
    </div>
  );
}

function DocGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke="currentColor"
        strokeWidth="1.6"
        className="text-forest"
        fill="none"
      />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" className="text-forest" fill="none" />
      <path d="M8 13h8M8 17h5" stroke="#E89B3C" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SendGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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
