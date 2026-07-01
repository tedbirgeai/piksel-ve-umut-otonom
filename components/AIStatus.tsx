// components/AIStatus.tsx
"use client";

import { useEffect, useState } from "react";

/**
 * Canlı yerel YZ durumu: motor açık mı, hedef model yüklü mü?
 * /api/ollama (GET) sağlık ucunu yoklar. Kurulum sorunlarını anında gösterir.
 */
interface Health {
  online: boolean;
  model: string;
  hasModel: boolean;
}

export default function AIStatus() {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    let alive = true;
    async function check() {
      try {
        const res = await fetch("/api/ollama", { cache: "no-store" });
        const data = (await res.json()) as Health;
        if (alive) setHealth(data);
      } catch {
        if (alive) setHealth({ online: false, model: "?", hasModel: false });
      }
    }
    check();
    const t = setInterval(check, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (!health) {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11px] text-muted dark:border-[#21342F]">
        <span className="h-1.5 w-1.5 rounded-full bg-line" />
        YZ kontrol ediliyor…
      </span>
    );
  }

  const ok = health.online && health.hasModel;
  const color = ok ? "#4ADE80" : health.online ? "#E89B3C" : "#E07A5F";
  const label = ok
    ? `${health.model}`
    : health.online
      ? `Model yüklü değil`
      : `Motor kapalı`;

  const title = ok
    ? "Yerel YZ hazır"
    : health.online
      ? `Terminalde: ollama pull ${health.model}`
      : "Terminalde: ollama serve";

  return (
    <span
      title={title}
      className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11px] text-muted dark:border-[#21342F]"
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: color }}
      />
      <span className="font-mono">{label}</span>
    </span>
  );
}
