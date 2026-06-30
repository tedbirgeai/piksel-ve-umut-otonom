// lib/wagmi.ts
"use client";

import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

/**
 * Wagmi yapılandırması — yalnızca TARAYICI CÜZDANI (MetaMask / injected).
 *
 * WalletConnect KASTEN kullanılmaz: geçerli bir relay anahtarı olmadan
 * "WebSocket ... 3000 (Unauthorized: invalid key)" hata seli yaratıyordu.
 * MetaMask ile tam çalışır. (Mobil QR / WalletConnect istenirse aşağıdaki
 * nota bakın.)
 *
 * RPC: Halka açık uç nokta yerine ADANMIŞ Alchemy.
 *   .env.local → NEXT_PUBLIC_ALCHEMY_API_KEY (dashboard.alchemy.com → Apps → API Key)
 */
const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "";

const sepoliaRpc = ALCHEMY_KEY
  ? `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`
  : undefined; // tanımsızsa wagmi varsayılan public transport'a düşer

const mainnetRpc = ALCHEMY_KEY
  ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`
  : undefined;

export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(sepoliaRpc),
    [mainnet.id]: http(mainnetRpc),
  },
  ssr: true,
});

/*
 * WalletConnect (mobil cüzdan / QR) eklemek isterseniz:
 *   1) cloud.reown.com'dan ücretsiz Project ID alın
 *   2) .env.local → NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<32 haneli gerçek id>
 *   3) Bu dosyada injected() yerine RainbowKit getDefaultConfig kullanın.
 * Geçersiz/placeholder bir id ASLA girmeyin — relay hata seli verir.
 */
