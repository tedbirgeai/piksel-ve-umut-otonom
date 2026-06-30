// lib/types.ts

/** Üretilen bir pedagojik ders içeriği. */
export interface Lesson {
  id: string;
  title: string;
  subject: string;
  grade: string;
  prompt: string;
  body: string;
  cid: string | null; // IPFS CID — pinlendiğinde dolar
  createdAt: number;
  // Zincir kaydı (registerContent sonrası dolar)
  contentId: number | null; // sözleşmedeki içerik kimliği
  accessPrice: string; // ETH cinsinden erişim ücreti (örn. "0.01")
  txHash: string | null; // kayıt işlem hash'i
  onChain: boolean; // zincire kaydedildi mi
}

export interface OllamaResult {
  text: string;
  model: string;
}

export interface PinResult {
  cid: string;
}
