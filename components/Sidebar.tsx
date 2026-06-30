// components/Sidebar.tsx
"use client";

import Link from "next/link";
import PixelMark from "./PixelMark";
import { useLibrary } from "./LibraryProvider";

/**
 * Gemini benzeri minimalist sidebar:
 * marka · yeni sohbet · geçmiş (üretilen dersler) · kademe rozetleri · alt bilgi.
 */
export default function Sidebar({
  onNewChat,
  activeId,
  onSelect,
}: {
  onNewChat: () => void;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const { lessons } = useLibrary();

  return (
    <aside className="flex h-full w-[264px] flex-shrink-0 flex-col border-r border-line bg-white">
      {/* marka */}
      <div className="flex items-center gap-2.5 px-4 py-4">
        <PixelMark size={24} />
        <span className="font-display text-[15px] font-bold tracking-tightest text-forest">
          Piksel<span className="text-hope">·</span>Umut
        </span>
      </div>

      {/* yeni sohbet */}
      <div className="px-3">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center gap-2.5 rounded-xl bg-forest px-3.5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-forest-600"
        >
          <PlusGlyph />
          Yeni içerik
        </button>
      </div>

      {/* geçmiş */}
      <div className="mt-5 flex-1 overflow-y-auto px-3">
        <div className="px-1.5 pb-2 font-mono text-[10.5px] uppercase tracking-wide text-muted">
          Üretilenler
        </div>
        {lessons.length === 0 ? (
          <div className="px-1.5 text-[12.5px] leading-relaxed text-muted">
            Henüz içerik yok. İlk dersinizi üretin — burada listelenecek.
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {lessons.map((l) => {
              const active = l.id === activeId;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onSelect(l.id)}
                  className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                    active ? "bg-[#EFF4F2]" : "hover:bg-sand"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 flex-shrink-0 rounded-sm ${
                      l.onChain ? "bg-hope" : l.cid ? "bg-tea" : "bg-line"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink">
                      {l.title}
                    </span>
                    <span className="block truncate text-[11px] text-muted">
                      {l.grade}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* alt bilgi */}
      <div className="border-t border-line p-3">
        <Link
          href="/"
          className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[12.5px] text-muted hover:bg-sand hover:text-forest"
        >
          <span>Ana sayfa</span>
          <span>↗</span>
        </Link>
        <div className="mt-1 flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-tea" />
          Yerel motor · çevrimdışı
        </div>
      </div>
    </aside>
  );
}

function PlusGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
