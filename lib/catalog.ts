// lib/catalog.ts
"use client";

import { formatEther } from "viem";
import {
  CERTIFICATE_CONTRACT_ADDRESS,
  certificateAbi,
  isContractConfigured,
} from "./contract";
import { publicReadClient } from "./publicClient";
import { ipfsUrl } from "./ipfs";
import type { Lesson } from "./types";

/**
 * MERKEZİYETSİZ KATALOG — uçtan uca otonom içerik akışının kalbi.
 *
 * Öğretmen bir ders mint ettiğinde, sözleşmedeki `certificates(tokenId)` kaydı
 * (cid, kademe, ders, başlık, üretici) HERKESE AÇIK kataloğa dönüşür. Öğrenci,
 * herhangi bir cihazda, cüzdansız biçimde bu zinciri okuyup dersleri keşfeder;
 * içeriği IPFS'ten CID ile çeker. Merkezî sunucu/veritabanı YOKTUR.
 *
 * Katmanlı strateji:
 *   - Sözleşme tanımlıysa  → ZİNCİRDEN oku (gerçek merkeziyetsiz, cihazlar arası).
 *   - Tanımlı değilse      → localStorage'a düş (demo, aynı cihaz).
 */

const LIBRARY_KEY = "piksel-umut.library.v1";

/** Zincirdeki tek bir sertifika kaydını Lesson'a çevirir. */
function certToLesson(tokenId: number, c: readonly unknown[]): Lesson {
  const [creator, accessPrice, active, cid, stage, subject, title] = c as [
    string,
    bigint,
    boolean,
    string,
    string,
    string,
    string,
    bigint,
  ];
  return {
    id: `chain-${tokenId}`,
    title: title || `${subject} · ${stage}`,
    subject,
    grade: stage,
    prompt: "",
    body: "", // gövde açılışta IPFS'ten yüklenir
    cid: cid || null,
    createdAt: Date.now(),
    contentId: tokenId,
    tokenId,
    accessPrice: accessPrice ? formatEther(accessPrice) : "0",
    txHash: null,
    onChain: true,
    status: "published",
    reviewedAt: null,
    _active: active,
  } as Lesson & { _active: boolean };
}

/** Yayınlanmış tüm dersleri döndürür (zincir → yoksa localStorage). */
export async function getPublishedLessons(): Promise<Lesson[]> {
  if (isContractConfigured) {
    try {
      const next = (await publicReadClient.readContract({
        address: CERTIFICATE_CONTRACT_ADDRESS,
        abi: certificateAbi,
        functionName: "nextTokenId",
      })) as bigint;

      const count = Number(next) - 1;
      if (count <= 0) return [];

      const ids = Array.from({ length: count }, (_, i) => i + 1);
      const records = await Promise.all(
        ids.map((id) =>
          publicReadClient.readContract({
            address: CERTIFICATE_CONTRACT_ADDRESS,
            abi: certificateAbi,
            functionName: "certificates",
            args: [BigInt(id)],
          }),
        ),
      );

      return ids
        .map((id, i) => certToLesson(id, records[i] as readonly unknown[]))
        .filter((l) => (l as Lesson & { _active?: boolean })._active !== false)
        .reverse(); // en yeni önce
    } catch {
      // Zincir okunamazsa sessizce yerele düş
      return readLocal();
    }
  }
  return readLocal();
}

/** Bir dersin gövdesini IPFS'ten çeker (cüzdansız, herkese açık ağ geçidi). */
export async function fetchLessonBody(cid: string): Promise<string> {
  const res = await fetch(ipfsUrl(cid));
  if (!res.ok) throw new Error("İçerik IPFS'ten alınamadı.");
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return json.body ?? text;
  } catch {
    return text;
  }
}

function readLocal(): Lesson[] {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) return [];
    // Öğrenci yalnızca YAYINLANMIŞ dersleri görür (taslaklar gizli).
    return (JSON.parse(raw) as Lesson[]).filter(
      (l) => (l.body || l.cid) && l.status === "published",
    );
  } catch {
    return [];
  }
}
