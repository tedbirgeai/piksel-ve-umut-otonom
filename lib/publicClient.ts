// lib/publicClient.ts
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

/**
 * CÜZDANSIZ OKUMA İSTEMCİSİ.
 * ----------------------------
 * Zincirden veri okumak ÜCRETSİZDİR ve cüzdan GEREKTİRMEZ. Öğrenci tarafı
 * bu istemciyle yayınlanmış ders kataloğunu okur — hiçbir kripto öğesi görmez.
 * Yazma (mint, telif) hâlâ wagmi + cüzdan ile öğretmen tarafında yapılır.
 *
 * RPC: Adanmış Alchemy varsa onu, yoksa herkese açık Sepolia uç noktasını kullanır.
 */
const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "";

const sepoliaRpc = ALCHEMY_KEY
  ? `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`
  : "https://rpc.sepolia.org";

export const publicReadClient = createPublicClient({
  chain: sepolia,
  transport: http(sepoliaRpc),
});
