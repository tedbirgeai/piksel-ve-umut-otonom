// lib/ipfs.ts
import type { Lesson, PinResult } from "./types";

/** İçerik okuma için IPFS ağ geçidi. */
export const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://ipfs.io/ipfs/";

/** Bir CID için tam ağ geçidi URL'si döndürür. */
export function ipfsUrl(cid: string): string {
  return `${IPFS_GATEWAY}${cid}`;
}

/**
 * Bir dersi IPFS'e pinler ve CID'sini döndürür.
 * İstek sunucu tarafındaki /api/ipfs route'una gider (yerel Kubo düğümü).
 */
export async function pinLesson(lesson: Lesson): Promise<string> {
  const res = await fetch("/api/ipfs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: JSON.stringify({
        title: lesson.title,
        subject: lesson.subject,
        grade: lesson.grade,
        body: lesson.body,
        createdAt: lesson.createdAt,
      }),
      name: `${lesson.subject}-${lesson.grade}.json`,
    }),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error ?? "IPFS pinleme başarısız oldu.");
  }

  const data: PinResult = await res.json();
  return data.cid;
}

/** CID'yi kısaltır: Qm…7bca */
export function shortCid(cid: string | null): string {
  if (!cid) return "—";
  if (cid.length <= 8) return cid;
  return `${cid.slice(0, 2)}…${cid.slice(-4)}`;
}
