// app/panel/page.tsx
"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";

/**
 * Gemini benzeri çalışma alanı: sol sidebar + sağ chat ekranı.
 * Navbar/Footer global layout'tadır; panel tam yükseklik çalışır.
 */
export default function PanelPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="flex h-[calc(100vh-58px)] overflow-hidden">
      <Sidebar
        activeId={activeId}
        onSelect={setActiveId}
        onNewChat={() => {
          setActiveId(null);
          setResetKey((k) => k + 1);
        }}
      />
      <ChatInterface
        key={resetKey}
        activeId={activeId}
        onActiveChange={setActiveId}
      />
    </div>
  );
}
