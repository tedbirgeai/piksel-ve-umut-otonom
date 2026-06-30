// components/WalletButton.tsx
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

/** RainbowKit cüzdan bağlama düğmesi — ferah temaya uyumlu sarmalayıcı. */
export default function WalletButton() {
  return (
    <ConnectButton
      accountStatus="address"
      chainStatus="icon"
      showBalance={false}
      label="Cüzdan Bağla"
    />
  );
}
