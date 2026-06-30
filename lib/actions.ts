// lib/actions.ts
"use client";

import { generateLesson } from "./ollama";
import { pinLesson } from "./ipfs";
import type { Lesson } from "./types";

/**
 * İçerik üretim orkestrasyonu (zincirden bağımsız saf adımlar).
 * Cüzdan/sözleşme işlemleri React hook gerektirdiği için ChatInterface'te
 * kalır; bu modül YZ üretimi + IPFS pinleme akışını sağlar.
 */

export interface GenerateInput {
  subject: string;
  stage: string; // eğitim kademesi
  level: string; // sınıf / seviye
  prompt: string;
}

/** Kademe + seviye + dersi tek bir pedagojik isteme dönüştürür. */
export function buildPrompt(input: GenerateInput): string {
  const { subject, stage, level, prompt } = input;
  return (
    `Kademe: ${stage} · Seviye: ${level} · Ders: ${subject}\n\n` +
    `İstek:\n${prompt}`
  );
}

/** YZ ile üretir; üretilen ham metni döndürür. */
export async function generateContent(input: GenerateInput): Promise<string> {
  const { text } = await generateLesson({
    subject: input.subject,
    grade: input.stage, // route LEVEL_GUIDE'ı kademeye göre seçer
    prompt: buildPrompt(input),
  });
  return text;
}

/** Dersi IPFS'e pinler, CID döndürür. */
export async function persistContent(lesson: Lesson): Promise<string> {
  return pinLesson(lesson);
}

/** Yeni boş bir Lesson taslağı üretir. */
export function newLesson(
  input: GenerateInput,
  accessPrice: string,
): Lesson {
  return {
    id: crypto.randomUUID(),
    title: input.prompt.trim().slice(0, 56) || `${input.subject} · ${input.level}`,
    subject: input.subject,
    grade: `${input.stage} · ${input.level}`,
    prompt: input.prompt,
    body: "",
    cid: null,
    createdAt: Date.now(),
    contentId: null,
    accessPrice,
    txHash: null,
    onChain: false,
  };
}
