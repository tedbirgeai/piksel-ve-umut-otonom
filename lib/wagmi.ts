// lib/wagmi.ts
"use client";

import { http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";

/**
 * Wagmi + RainbowKit yapılandırması.
 *
 * RPC: Halka açık rpc.sepolia.org yerine ADANMIŞ Alchemy uç noktası kullanılır.
 * .env.local içine NEXT_PUBLIC_ALCHEMY_API_KEY ekleyin
 * (https://dashboard.alchemy.com → Apps → API Key).
 * Cüzdan için NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID gerekir.
 */
const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "";

const sepoliaRpc = ALCHEMY_KEY
  ? `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`
  : undefined; // tanımsızsa wagmi varsayılan public transport'a düşer

const mainnetRpc = ALCHEMY_KEY
  ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`
  : undefined;

export const wagmiConfig = getDefaultConfig({
  appName: "Piksel ve Umut",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "DEMO_PROJECT_ID",
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(sepoliaRpc),
    [mainnet.id]: http(mainnetRpc),
  },
  ssr: true,
});
