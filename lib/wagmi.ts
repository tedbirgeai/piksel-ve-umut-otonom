// lib/wagmi.ts
"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";

/**
 * Wagmi + RainbowKit yapılandırması.
 * WalletConnect projectId'sini https://cloud.walletconnect.com adresinden alıp
 * .env.local içine NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID olarak ekleyin.
 */
export const wagmiConfig = getDefaultConfig({
  appName: "Piksel ve Umut",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "DEMO_PROJECT_ID",
  chains: [mainnet, sepolia],
  ssr: true,
});
