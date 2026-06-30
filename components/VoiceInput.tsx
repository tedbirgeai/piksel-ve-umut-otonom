// components/VoiceInput.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Web Speech API ile sesli yazma düğmesi (tr-TR).
 * onTranscript: kesinleşen metin parçalarını üst bileşene aktarır.
 * onInterim: anlık (geçici) metni canlı önizleme için verir.
 */
export default function VoiceInput({
  onFinal,
  onInterim,
  className,
}: {
  onFinal: (text: string) => void;
  onInterim?: (text: string) => void;
  className?: string;
}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition })
        .webkitSpeechRecognition;
    setSupported(Boolean(SR));
    return () => recRef.current?.abort();
  }, []);

  const toggle = useCallback(() => {
    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition })
        .webkitSpeechRecognition;
    if (!SR) return;

    if (listening) {
      recRef.current?.stop();
      return;
    }

    const rec = new SR();
    rec.lang = "tr-TR";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let finalTxt = "";
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTxt += t;
        else interim += t;
      }
      if (finalTxt) onFinal(finalTxt.trim());
      if (interim && onInterim) onInterim(interim.trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    rec.start();
    recRef.current = rec;
    setListening(true);
  }, [listening, onFinal, onInterim]);

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        title="Tarayıcınız sesli girişi desteklemiyor (Chrome/Edge önerilir)"
        className={`grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-[#B8AE98] ${className ?? ""}`}
      >
        <MicGlyph />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={listening}
      title={listening ? "Dinleniyor — durdur" : "Sesli yaz"}
      className={`relative grid h-10 w-10 place-items-center rounded-xl border transition-colors ${
        listening
          ? "border-[#E07A5F] bg-[#FBE4E0] text-[#B23A2E]"
          : "border-line bg-white text-ink hover:border-forest/40"
      } ${className ?? ""}`}
    >
      <MicGlyph />
      {listening && (
        <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E07A5F] opacity-70" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-[#E07A5F]" />
        </span>
      )}
    </button>
  );
}

function MicGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
