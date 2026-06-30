// components/DigitalLibrary.tsx
"use client";

import { useLibrary } from "./LibraryProvider";
import { ipfsUrl, shortCid } from "@/lib/ipfs";
import AccessButton from "./AccessButton";

/** IPFS üzerinde pinlenmiş ders içeriklerinin katalog görünümü. */
export default function DigitalLibrary() {
  const { lessons } = useLibrary();

  return (
    <div>
      <h3 className="font-display text-2xl font-semibold text-ink">
        Dijital Kütüphane
      </h3>
      <p className="mt-1 text-sm text-muted">
        IPFS üzerinde kalıcı, silinemez pedagojik içerik arşivi.
      </p>

      {lessons.length === 0 ? (
        <div className="card mt-6 text-center text-sm text-muted">
          Henüz içerik yok. <strong className="text-forest">Üretim
          Fabrikası</strong> sekmesinden ilk dersinizi üretin.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((l) => (
            <article
              key={l.id}
              className="overflow-hidden rounded-2xl border border-line bg-white"
            >
              <div
                className="flex h-24 items-end p-2"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg,#EFF4F2,#EFF4F2 8px,#E4EEEC 8px,#E4EEEC 16px)",
                }}
              >
                <span className="font-mono text-[10px] text-[#5F827C]">
                  {l.subject}
                </span>
              </div>
              <div className="p-3.5">
                <div className="truncate text-[13.5px] font-semibold text-ink">
                  {l.title}
                </div>
                <div className="mt-0.5 text-[11.5px] text-muted">
                  {l.grade} · {l.subject}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[10.5px] text-[#B8AE98]">
                    {shortCid(l.cid)}
                  </span>
                  {l.onChain && l.contentId !== null && (
                    <span className="rounded-full bg-hope-soft px-2 py-0.5 font-mono text-[10px] font-semibold text-hope-ink">
                      🎓 NFT #{l.contentId}
                    </span>
                  )}
                </div>
                {/* Erişim / satın alma — yalnızca zincirdeki içerikte */}
                <div className="mt-3 flex items-center justify-between gap-2">
                  {l.cid && (
                    <a
                      href={ipfsUrl(l.cid)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[10.5px] text-tea hover:text-forest"
                    >
                      IPFS’te aç →
                    </a>
                  )}
                  <AccessButton lesson={l} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
