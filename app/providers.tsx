// app/providers.tsx
"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/wagmi";
import { LibraryProvider } from "@/components/LibraryProvider";

/**
 * Tüm istemci sağlayıcıları tek noktada:
 * Wagmi (cüzdan) → React Query → RainbowKit (UI) → Library (içerik durumu).
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: "#0F3D3A",
            accentColorForeground: "#FAF7F1",
            borderRadius: "medium",
            fontStack: "system",
          })}
        >
          <LibraryProvider>{children}</LibraryProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
