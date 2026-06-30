// app/panel/page.tsx
"use client";

import { useState } from "react";
import ThemeProvider from "@/components/ThemeProvider";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

/**
 * Otonom Eğitim Ekosistemi çalışma alanı:
 * ThemeProvider → (Otonom Kontrol Merkezi Sidebar + Profesyonel ChatWindow).
 * Tam yükseklikte, Gemini/Claude standardında.
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
