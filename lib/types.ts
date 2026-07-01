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
  // Zincir kaydı (mintCertificate sonrası dolar)
  contentId: number | null; // sözleşmedeki tokenId (NFT kimliği)
  tokenId: number | null; // NFT token kimliği (contentId ile aynı — açıklık için)
  accessPrice: string; // ETH cinsinden erişim ücreti (örn. "0.01")
  txHash: string | null; // mint işlem hash'i
  onChain: boolean; // zincire (NFT olarak) kaydedildi mi
  // İçerik onay/denetim hattı
  status: "draft" | "published"; // taslak = öğrenci görmez; yayın = katalogda
  reviewedAt?: number | null; // yayınlanma zamanı
}

export interface OllamaResult {
  text: string;
  model: string;
}

export interface PinResult {
  cid: string;
}
