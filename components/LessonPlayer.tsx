// components/LessonPlayer.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * DUYUSAL ANLATIM KATMANI — üretilen dersi yaşa göre çok-duyusal deneyime çevirir.
 *
 * Farklılaştırıcı: Kreş bir çocuk METİN okuyamaz. Aynı içerik kademeye göre
 * FARKLI DUYUSAL BİÇİM alır:
 *   Kreş / İlkokul → "Hikâye Modu": tek seferde bir kart, DEV renkli tipografi,
 *      otomatik sesli anlatım (tr-TR), piksel maskot, her kartta yıldız, sonda kutlama.
 *   Ortaokul+      → yapılandırılmış, bölüm-vurgulu, sesli takipli okuyucu.
 *
 * Tamamen tarayıcıda (Web Speech API), çevrimdışı-uyumlu, cüzdansız, veri toplamaz.
 */

/** Ham ders metnini anlamlı anlatım parçalarına böler. */
function toSegments(text: string): string[] {
  return text
    .replace(/[#*_`>]/g, "") // markdown işaretlerini temizle
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    // çok uzun paragrafları cümlelere ayır (küçük yaş için sindirimli)
    .flatMap((p) =>
      p.length > 160
        ? p.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean)
        : [p],
    );
}

// Kart arka planları — sıcak, çocuk dostu, marka paleti
const CARD_BG = [
  "linear-gradient(150deg,#FBEFD6,#F6E2BC)",
  "linear-gradient(150deg,#E7F1EE,#D6E9E2)",
  "linear-gradient(150deg,#FBE4E0,#F6D4CC)",
  "linear-gradient(150deg,#E9E7F6,#DAD6EF)",
];
const CARD_EMOJI = ["🌟", "🎈", "🦋", "🌈", "🐢", "🍎", "🎨", "🚀"];

export default function LessonPlayer({
  title,
  body,
  young,
  onClose,
  onComplete,
}: {
  title: string;
  body: string;
  young: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const segments = useMemo(() => toSegments(body), [body]);
  const [i, setI] = useState(0);
  const [finished, setFinished] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [auto, setAuto] = useState(false);
  const mutedRef = useRef(false);
  const autoRef = useRef(false);

  const atEnd = i >= segments.length - 1;

  // Bir parçayı seslendir
  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (mutedRef.current) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "tr-TR";
    u.rate = young ? 0.9 : 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  // Kart değişince otomatik anlat (elle gezinme modunda)
  useEffect(() => {
    if (!auto && !finished && segments[i]) speak(segments[i]);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, finished]);

  // SİNEMA MODU — otomatik oynatma: anlat → ses bitince ilerle → sonda kutlama
  useEffect(() => {
    if (!auto || finished) return;
    const seg = segments[i];
    if (!seg) return;
    let cancelled = false;
    const advance = () => {
      if (cancelled) return;
      if (atEnd) {
        setFinished(true);
        onComplete();
      } else {
        setI((n) => n + 1);
      }
    };
    if (!mutedRef.current && typeof window !== "undefined" && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(seg);
      u.lang = "tr-TR";
      u.rate = young ? 0.9 : 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => {
        setSpeaking(false);
        if (!cancelled) setTimeout(advance, young ? 700 : 400);
      };
      u.onerror = () => {
        setSpeaking(false);
        if (!cancelled) setTimeout(advance, 1500);
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      return () => {
        cancelled = true;
        window.speechSynthesis.cancel();
      };
    }
    // sessiz: metin uzunluğuna göre süre
    const ms = Math.max(2600, seg.length * 85);
    const t = setTimeout(advance, ms);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, i, finished]);

  function toggleAuto() {
    const a = !auto;
    setAuto(a);
    autoRef.current = a;
    if (!a && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }

  function next() {
    if (atEnd) {
      setFinished(true);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      onComplete();
      return;
    }
    setI((n) => n + 1);
  }
  function prev() {
    setI((n) => Math.max(0, n - 1));
  }
  function toggleMute() {
    const m = !muted;
    setMuted(m);
    mutedRef.current = m;
    if (m && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      speak(segments[i]);
    }
  }

  // Klavye erişimi (WCAG)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        prev();
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atEnd, i]);

  // ---- KUTLAMA EKRANI ----
  if (finished) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-forest to-forest-600 px-6 text-center">
        <div className="text-[80px]" aria-hidden>
          🎉
        </div>
        <h2 className="mt-4 font-display text-[clamp(28px,5vw,44px)] font-bold tracking-tightest text-paper">
          Aferin! Dersi bitirdin
        </h2>
        <div className="mt-3 flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((s) => (
            <span key={s} className="text-[32px]">
              ⭐
            </span>
          ))}
        </div>
        <p className="mt-3 max-w-sm text-[15px] text-paper/80">
          Harika iş çıkardın. Yeni bir şey öğrendin!
        </p>
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-hope px-6 py-3 text-[15px] font-bold text-hope-ink"
          >
            Kütüphaneye dön
          </button>
        </div>
      </div>
    );
  }

  const seg = segments[i] ?? title;
  const pct = Math.round(((i + 1) / Math.max(1, segments.length)) * 100);

  // ---- KREŞ / İLKOKUL: HİKÂYE MODU ----
  if (young) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: CARD_BG[i % CARD_BG.length] }}
      >
        {/* üst bar */}
        <div className="flex items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="grid h-11 w-11 place-items-center rounded-full bg-white/70 text-[20px] text-forest"
          >
            ←
          </button>
          <div className="flex items-center gap-1" aria-hidden>
            {segments.map((_, idx) => (
              <span
                key={idx}
                className="h-2.5 rounded-full transition-all"
                style={{
                  width: idx === i ? 22 : 9,
                  background: idx <= i ? "#0F3D3A" : "rgba(15,61,58,0.2)",
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAuto}
              aria-label={auto ? "Duraklat" : "Otomatik oynat"}
              className="grid h-11 w-11 place-items-center rounded-full bg-forest text-[18px] text-paper"
            >
              {auto ? "⏸" : "▶"}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Sesi aç" : "Sesi kapat"}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/70 text-[18px] text-forest"
            >
              {muted ? "🔇" : speaking ? "🔊" : "🔈"}
            </button>
          </div>
        </div>

        {/* dev kart */}
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div
            key={i}
            className="text-[72px]"
            style={{ animation: "puKenBurns 6s ease-out both" }}
            aria-hidden
          >
            {CARD_EMOJI[i % CARD_EMOJI.length]}
          </div>
          <p className="mt-6 max-w-2xl font-display text-[clamp(24px,4.5vw,40px)] font-bold leading-[1.25] tracking-tightest text-[#15211F]">
            {seg}
          </p>
          <button
            type="button"
            onClick={() => speak(seg)}
            className="mt-6 flex items-center gap-2 rounded-full bg-white/70 px-5 py-2.5 text-[15px] font-semibold text-forest"
          >
            🔊 Tekrar dinle
          </button>
        </div>

        {/* alt gezinme — büyük dokunma hedefleri */}
        <div className="flex items-center justify-between gap-4 px-6 pb-8">
          <button
            type="button"
            onClick={prev}
            disabled={i === 0}
            className="grid h-16 w-16 place-items-center rounded-full bg-white/70 text-[26px] text-forest disabled:opacity-30"
            aria-label="Geri"
          >
            ←
          </button>
          <button
            type="button"
            onClick={next}
            className="flex h-16 flex-1 items-center justify-center gap-2 rounded-full bg-forest text-[20px] font-bold text-paper"
          >
            {atEnd ? "Bitir 🎉" : "Devam →"}
          </button>
        </div>
      </div>
    );
  }

  // ---- ORTAOKUL+: YAPILANDIRILMIŞ ANLATIM ----
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper dark:bg-[#0C1614]">
      <div className="flex items-center justify-between border-b border-line px-6 py-4 dark:border-[#21342F]">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-forest"
        >
          <span>←</span> Kapat
        </button>
        <span className="truncate px-4 font-display text-[15px] font-bold tracking-tightest text-forest dark:text-[#34D0B6]">
          {title}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleAuto}
            aria-label={auto ? "Duraklat" : "Otomatik oynat"}
            className="flex items-center gap-1.5 rounded-xl bg-forest px-3 py-2 text-[13px] font-bold text-paper dark:bg-[#1C4A44] dark:text-[#EAF6F3]"
          >
            {auto ? "⏸ Duraklat" : "▶ Sinema"}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Sesi aç" : "Sesi kapat"}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line text-forest dark:border-[#21342F] dark:text-[#34D0B6]"
          >
            {muted ? "🔇" : speaking ? "🔊" : "🔈"}
          </button>
        </div>
      </div>

      {/* ilerleme */}
      <div className="h-1 bg-line dark:bg-[#21342F]">
        <div
          className="h-full bg-gradient-to-r from-forest to-hope transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-10">
        <div className="max-w-2xl">
          <span className="font-mono text-[11px] uppercase tracking-brand text-tea">
            Bölüm {i + 1} / {segments.length}
          </span>
          <p className="mt-4 text-[clamp(18px,2.4vw,24px)] leading-[1.6] text-ink dark:text-[#EAF1EF]">
            {seg}
          </p>
          <button
            type="button"
            onClick={() => speak(seg)}
            className="mt-5 flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-[13px] font-semibold text-forest hover:bg-[#EFF4F2] dark:border-[#21342F] dark:text-[#34D0B6] dark:hover:bg-[#142824]"
          >
            🔊 Bu bölümü dinle
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line px-6 py-4 dark:border-[#21342F]">
        <button
          type="button"
          onClick={prev}
          disabled={i === 0}
          className="rounded-xl border border-line px-5 py-2.5 text-[14px] font-semibold text-muted disabled:opacity-30 dark:border-[#21342F]"
        >
          ← Önceki
        </button>
        <button
          type="button"
          onClick={next}
          className="rounded-xl bg-forest px-6 py-2.5 text-[14px] font-bold text-paper dark:bg-[#1C4A44] dark:text-[#EAF6F3]"
        >
          {atEnd ? "Bitir 🎉" : "Sonraki →"}
        </button>
      </div>
    </div>
  );
}
