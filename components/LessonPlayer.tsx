// components/LessonPlayer.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PikoMascot from "./PikoMascot";
import SceneObject from "./SceneObject";
import { buildScenes, SCENE_BG, type Scene } from "@/lib/sceneDirector";

/**
 * PİKSEL STÜDYO — gerçek eğitim videosu motoru (canlı, çevrimdışı, sıfır maliyet).
 *
 * Katmanlar:  arka plan → gökkuşağı sihir → sahne nesnesi (hareketli) → Piko
 *             (konuşan maskot) → karaoke altyazı → efekt.
 * Zaman çizelgesi: sahneler anlatım sesiyle senkron otomatik ilerler.
 * Ses: Piko anlatımı (Web Speech) + yumuşak fon müziği (Web Audio, kapatılabilir).
 * Paylaşım: "Videoyu Kaydet" — tarayıcı ekran kaydıyla .webm dosyası üretir.
 */
export default function LessonPlayer({
  title,
  body,
  subject = "",
  young,
  onClose,
  onComplete,
}: {
  title: string;
  body: string;
  subject?: string;
  young: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const scenes = useMemo<Scene[]>(
    () => buildScenes(title, body, subject),
    [title, body, subject],
  );

  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [music, setMusic] = useState(true);
  const [spoken, setSpoken] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [finished, setFinished] = useState(false);

  const mutedRef = useRef(false);
  const playingRef = useRef(true);
  const scene = scenes[i] ?? scenes[0];
  const atEnd = i >= scenes.length - 1;

  // ---- Fon müziği (Web Audio, yumuşak arpej) ----
  const audioRef = useRef<{ ctx: AudioContext; gain: GainNode; timer: number } | null>(null);
  const startMusic = useCallback(() => {
    if (audioRef.current || typeof window === "undefined") return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const gain = ctx.createGain();
    gain.gain.value = 0.04;
    gain.connect(ctx.destination);
    const notes = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33]; // C D E G E D
    let n = 0;
    const tick = () => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = notes[n % notes.length];
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      o.connect(g);
      g.connect(gain);
      o.start();
      o.stop(ctx.currentTime + 0.95);
      n++;
    };
    const timer = window.setInterval(tick, 620);
    audioRef.current = { ctx, gain, timer };
  }, []);
  const stopMusic = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    clearInterval(a.timer);
    a.ctx.close();
    audioRef.current = null;
  }, []);

  useEffect(() => {
    if (music && !finished) startMusic();
    else stopMusic();
    return stopMusic;
  }, [music, finished, startMusic, stopMusic]);

  // ---- Anlatım + otomatik ilerleme (zaman çizelgesi) ----
  useEffect(() => {
    if (finished) return;
    const seg = scene?.text ?? "";
    setSpoken(0);
    let cancelled = false;
    const advance = () => {
      if (cancelled || !playingRef.current) return;
      if (atEnd) {
        setFinished(true);
        onComplete();
      } else {
        setI((n) => n + 1);
      }
    };
    const hasTTS = typeof window !== "undefined" && "speechSynthesis" in window;
    if (playing && !mutedRef.current && hasTTS) {
      const u = new SpeechSynthesisUtterance(seg);
      u.lang = "tr-TR";
      u.rate = young ? 0.9 : 1;
      u.onstart = () => setSpeaking(true);
      u.onboundary = (e) => setSpoken(e.charIndex);
      u.onend = () => {
        setSpeaking(false);
        setSpoken(seg.length);
        if (!cancelled) setTimeout(advance, young ? 650 : 400);
      };
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      return () => {
        cancelled = true;
        window.speechSynthesis.cancel();
      };
    }
    if (playing) {
      const ms = Math.max(2600, seg.length * 85);
      const t = setTimeout(advance, ms);
      return () => {
        cancelled = true;
        clearTimeout(t);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, playing, finished]);

  function togglePlay() {
    const p = !playing;
    setPlaying(p);
    playingRef.current = p;
    if (!p && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }
  function toggleMute() {
    const m = !muted;
    setMuted(m);
    mutedRef.current = m;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
  function go(delta: number) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setFinished(false);
    setI((n) => Math.max(0, Math.min(scenes.length - 1, n + delta)));
  }

  // ---- Klavye ----
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, i]);

  // ---- Video kaydı (tarayıcı ekran kaydı → .webm) ----
  const [recording, setRecording] = useState(false);
  async function recordVideo() {
    try {
      const media = navigator.mediaDevices as unknown as {
        getDisplayMedia?: (c: unknown) => Promise<MediaStream>;
      };
      if (!media.getDisplayMedia) {
        alert("Tarayıcınız video kaydını desteklemiyor. Chrome/Edge önerilir.");
        return;
      }
      const stream = await media.getDisplayMedia({ video: { frameRate: 30 }, audio: true });
      const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.slice(0, 40) || "piksel-umut-ders"}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
      };
      setRecording(true);
      setI(0);
      setFinished(false);
      setPlaying(true);
      playingRef.current = true;
      rec.start();
      stream.getVideoTracks()[0].onended = () => rec.state !== "inactive" && rec.stop();
    } catch {
      setRecording(false);
    }
  }

  // ---------- KUTLAMA ----------
  if (finished) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-forest to-forest-600 px-6 text-center">
        <PikoMascot talking wave size={150} />
        <h2 className="mt-4 font-display text-[clamp(28px,5vw,44px)] font-bold tracking-tightest text-paper">
          Aferin! Dersi bitirdin
        </h2>
        <div className="mt-3 flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((s) => (
            <span key={s} className="text-[32px]">⭐</span>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setI(0);
              setFinished(false);
              setPlaying(true);
              playingRef.current = true;
            }}
            className="rounded-xl border border-paper/40 px-6 py-3 text-[15px] font-bold text-paper"
          >
            ↻ Tekrar izle
          </button>
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

  const seg = scene?.text ?? title;

  // ---------- SAHNE (katmanlı video karesi) ----------
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: SCENE_BG[scene?.bg ?? 0], transition: "background .6s" }}
    >
      {/* üst kontrol çubuğu */}
      <div className="flex items-center justify-between px-5 py-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/70 text-[18px] text-forest"
        >
          ←
        </button>
        <div className="flex items-center gap-1" aria-hidden>
          {scenes.map((_, idx) => (
            <span
              key={idx}
              className="h-2 rounded-full transition-all"
              style={{
                width: idx === i ? 20 : 8,
                background: idx <= i ? "#0F3D3A" : "rgba(15,61,58,0.2)",
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setMusic((m) => !m)} aria-label="Müzik" className="grid h-10 w-10 place-items-center rounded-full bg-white/70 text-[16px]">
            {music ? "🎵" : "🎶"}
          </button>
          <button type="button" onClick={toggleMute} aria-label="Ses" className="grid h-10 w-10 place-items-center rounded-full bg-white/70 text-[16px]">
            {muted ? "🔇" : speaking ? "🔊" : "🔈"}
          </button>
        </div>
      </div>

      {/* SAHNE ALANI */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-8 text-center">
        {/* gökkuşağı sihir girdabı */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "10%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "conic-gradient(#E0463A,#E8963C,#EBD24A,#3FA96A,#2E86C1,#7E57C2,#E0463A)",
            filter: "blur(46px)",
            opacity: speaking ? 0.45 : 0.24,
            animation: "pikoSwirl 9s linear infinite",
            transition: "opacity .4s",
          }}
        />

        {/* sahne nesnesi (hareketli, konuya özel) */}
        <div key={`obj-${i}`} className="relative z-[1]" style={{ animation: "puKenBurns 6s ease-out both" }}>
          <SceneObject name={scene?.object ?? "star"} size={young ? 150 : 120} />
        </div>

        {/* Piko + altyazı */}
        <div className="relative z-[1] mt-2 flex items-end gap-3">
          <PikoMascot talking={speaking} size={young ? 110 : 92} />
        </div>
        <p
          className={`relative z-[1] mt-4 max-w-2xl font-display font-bold leading-[1.25] tracking-tightest text-[#15211F] ${
            young ? "text-[clamp(22px,4vw,38px)]" : "text-[clamp(18px,2.6vw,28px)]"
          }`}
        >
          <Karaoke text={seg} upTo={spoken} />
        </p>
      </div>

      {/* alt kontrol çubuğu */}
      <div className="flex items-center justify-between gap-3 px-6 pb-7">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={i === 0}
          className="grid h-14 w-14 place-items-center rounded-full bg-white/70 text-[22px] text-forest disabled:opacity-30"
          aria-label="Geri"
        >
          ←
        </button>
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-forest text-[18px] font-bold text-paper"
        >
          {playing ? "⏸ Duraklat" : "▶ Oynat"}
        </button>
        <button
          type="button"
          onClick={recordVideo}
          disabled={recording}
          className="flex h-14 items-center gap-2 rounded-full bg-hope px-5 text-[15px] font-bold text-hope-ink disabled:opacity-50"
          title="Videoyu kaydet ve paylaş (.webm)"
        >
          {recording ? "● Kaydediliyor" : "🎬 Video"}
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="grid h-14 w-14 place-items-center rounded-full bg-white/70 text-[22px] text-forest"
          aria-label="İleri"
        >
          →
        </button>
      </div>
    </div>
  );
}

/** Karaoke — seslendirilen kelimeye kadar vurgular (sesle senkron). */
function Karaoke({ text, upTo }: { text: string; upTo: number }) {
  if (upTo <= 0 || upTo >= text.length) return <>{text}</>;
  return (
    <>
      <span style={{ color: "#0F3D3A" }}>{text.slice(0, upTo)}</span>
      <span style={{ opacity: 0.4 }}>{text.slice(upTo)}</span>
    </>
  );
}
