// components/StudentView.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { STAGE_KEYS } from "@/lib/curriculum.config";
import { getPublishedLessons, fetchLessonBody } from "@/lib/catalog";
import { useRole } from "./RoleProvider";
import PixelMark from "./PixelMark";
import type { Lesson } from "@/lib/types";

/**
 * ÖĞRENCİ GÖRÜNÜMÜ — tamamen cüzdansız, çevrimdışı dostu.
 * Yayınlanmış dersleri MERKEZİYETSİZ katalogdan (zincir → IPFS, yoksa yerel)
 * okur. Hiçbir blokzincir/cüzdan öğesi göstermez.
 */
export default function StudentView() {
  const { clearRole } = useRole();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<string>("Hepsi");
  const [open, setOpen] = useState<Lesson | null>(null);

  useEffect(() => {
    let alive = true;
    getPublishedLessons()
      .then((ls) => {
        if (alive) setLessons(ls);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (stage === "Hepsi") return lessons;
    return lessons.filter((l) => (l.grade || "").startsWith(stage));
  }, [lessons, stage]);

  if (open) {
    return <Reader lesson={open} onBack={() => setOpen(null)} />;
  }
  return (
    <div className="min-h-[calc(100vh-58px)] bg-paper dark:bg-[#0C1614]">
      <div className="mx-auto max-w-5xl px-6 py-9">
        {/* başlık */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-brand text-tea">
              Öğrenci Kütüphanesi
            </p>
            <h1 className="mt-2 font-display text-[clamp(26px,4vw,36px)] font-bold tracking-tightest text-forest dark:text-[#34D0B6]">
              Bugün ne öğrenmek istersin?
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              Çevrimdışı çalışır · cüzdan gerekmez · her kademeye uygun
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href="/"
              className="rounded-lg border border-line px-3 py-1.5 text-[12px] text-muted hover:border-forest hover:text-forest dark:border-[#21342F]"
            >
              Ana sayfa
            </a>
            <button
              type="button"
              onClick={clearRole}
              className="rounded-lg border border-line px-3 py-1.5 text-[12px] text-muted hover:border-forest hover:text-forest dark:border-[#21342F]"
            >
              Rol değiştir
            </button>
          </div>
        </div>

        {/* kademe süzgeci */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Chip active={stage === "Hepsi"} onClick={() => setStage("Hepsi")}>
            Hepsi
          </Chip>
          {STAGE_KEYS.map((k) => (
            <Chip key={k} active={stage === k} onClick={() => setStage(k)}>
              {k}
            </Chip>
          ))}
        </div>

        {/* kütüphane */}
        {loading ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="animate-pulse">
              <PixelMark size={52} gap={4} />
            </div>
            <p className="mt-5 text-sm text-muted">Katalog yükleniyor…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <PixelMark size={52} gap={4} />
            <h2 className="mt-5 font-display text-xl font-bold text-forest dark:text-[#34D0B6]">
              Henüz ders yok
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Öğretmenlerin ürettiği dersler burada belirir. Çevrimdışıyken bile
              daha önce açtığın dersler burada kalır.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setOpen(l)}
                className="group flex flex-col rounded-2xl border border-line bg-white p-5 text-left transition-all hover:-translate-y-1 hover:border-forest/40 hover:shadow-[0_18px_40px_-26px_rgba(15,61,58,0.4)] dark:border-[#21342F] dark:bg-[#10201D]"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-sand px-2 py-0.5 text-[11px] font-semibold text-forest dark:bg-[#142824] dark:text-[#34D0B6]">
                    {(l.grade || "Genel").split("·")[0].trim()}
                  </span>
                  <span className="text-[11px] text-muted">{l.subject}</span>
                </div>
                <h3 className="mt-3 line-clamp-2 font-display text-[17px] font-semibold leading-snug tracking-tightest text-ink dark:text-[#EAF1EF]">
                  {l.title}
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-[13px] leading-relaxed text-muted">
                  {l.body?.slice(0, 130) || "Dersi açmak için dokun."}
                </p>
                <span className="mt-4 flex items-center gap-1.5 text-[13px] font-semibold text-forest dark:text-[#34D0B6]">
                  Dersi aç <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Reader({ lesson, onBack }: { lesson: Lesson; onBack: () => void }) {
  const [body, setBody] = useState<string>(lesson.body || "");
  const [loading, setLoading] = useState<boolean>(!lesson.body && !!lesson.cid);

  useEffect(() => {
    if (lesson.body || !lesson.cid) return;
    let alive = true;
    setLoading(true);
    fetchLessonBody(lesson.cid)
      .then((t) => {
        if (alive) setBody(t);
      })
      .catch(() => {
        if (alive) setBody("İçerik şu an alınamıyor. Çevrimiçi olunca tekrar deneyin.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [lesson]);
  return (
    <div className="min-h-[calc(100vh-58px)] bg-paper dark:bg-[#0C1614]">
      <div className="mx-auto max-w-2xl px-6 py-9">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-forest"
        >
          <span>←</span> Kütüphaneye dön
        </button>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-sand px-2 py-1 text-[12px] font-semibold text-forest dark:bg-[#142824] dark:text-[#34D0B6]">
            {lesson.grade || "Genel"}
          </span>
          <span className="text-[12px] text-muted">{lesson.subject}</span>
        </div>

        <h1 className="mt-3 font-display text-[clamp(24px,4vw,32px)] font-bold leading-tight tracking-tightest text-forest dark:text-[#34D0B6]">
          {lesson.title}
        </h1>

        <div className="mt-6 flex items-center gap-3 border-y border-line py-3 dark:border-[#21342F]">
          <SpeakButton text={body || lesson.title} />
          <span className="text-[12px] text-muted">Sesli dinle</span>
        </div>

        <article className="mt-6 whitespace-pre-wrap text-[15.5px] leading-[1.75] text-ink/90 dark:text-[#DCE7E4]">
          {loading ? "İçerik yükleniyor…" : body || "Bu dersin içeriği henüz hazırlanıyor."}
        </article>
      </div>
    </div>
  );
}

function SpeakButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);

  function toggle() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "tr-TR";
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`grid h-10 w-10 place-items-center rounded-xl border transition-colors ${
        speaking
          ? "border-hope bg-hope-soft text-hope-ink"
          : "border-line bg-white text-forest hover:border-forest/40 dark:border-[#21342F] dark:bg-[#10201D]"
      }`}
      title={speaking ? "Durdur" : "Sesli dinle"}
    >
      {speaking ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
        active
          ? "bg-forest text-paper dark:bg-[#1C4A44] dark:text-[#EAF6F3]"
          : "border border-line bg-white text-muted hover:border-forest/40 dark:border-[#21342F] dark:bg-[#10201D]"
      }`}
    >
      {children}
    </button>
  );
}
