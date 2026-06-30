// app/panel/page.tsx
"use client";

import { useState } from "react";
import ThemeProvider from "@/components/ThemeProvider";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

/**
 * Multimodal Çalışma Masası — SOHBET ARAYÜZÜ
 * ------------------------------------------
 * Gemini/Claude standardında: solda Otonom Kontrol Merkezi (Sidebar:
 * geçmiş · aktif projeler · telif kartı · tema), sağda sohbet ekranı
 * (ChatWindow: üst barda cüzdan + kademe, composer'da ses/dosya/kademe).
 * Cüzdan ChatWindow başlığındaki WalletButton ile; Alchemy RPC lib/wagmi.ts.
 */
export default function PanelPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  return (
    <ThemeProvider>
      <div className="flex h-[calc(100vh-58px)] overflow-hidden">
        <Sidebar
          activeId={activeId}
          onSelect={setActiveId}
          onNewChat={() => {
            setActiveId(null);
            setResetKey((k) => k + 1);
          }}
        />
        <ChatWindow
          key={resetKey}
          activeId={activeId}
          onActiveChange={setActiveId}
        />
      </div>
    </ThemeProvider>
  );
}
