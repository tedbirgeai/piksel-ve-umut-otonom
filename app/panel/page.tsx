// app/panel/page.tsx
"use client";

import { useState } from "react";
import ThemeProvider from "@/components/ThemeProvider";
import RoleProvider, { useRole } from "@/components/RoleProvider";
import RoleSelect from "@/components/RoleSelect";
import StudentView from "@/components/StudentView";
import SchoolDashboard from "@/components/SchoolDashboard";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import ErrorBoundary from "@/components/ErrorBoundary";

/**
 * OTONOM EĞİTİM EKOSİSTEMİ — rol-tabanlı giriş.
 *
 *   Rol seçilmemiş  → RoleSelect (öğrenci / öğretmen / okul)
 *   Öğrenci         → StudentView   (cüzdansız, çevrimdışı kütüphane)
 *   Öğretmen        → Sidebar + ChatWindow (YZ üretim + NFT + telif)
 *   Okul & Kurum    → SchoolDashboard (sınıf/öğrenci/dağıtım)
 */
export default function PanelPage() {
  return (
    <ThemeProvider>
      <RoleProvider>
        <ErrorBoundary>
          <PanelGate />
        </ErrorBoundary>
      </RoleProvider>
    </ThemeProvider>
  );
}

function PanelGate() {
  const { role, ready } = useRole();

  // localStorage okunana kadar markalı yükleme ekranı (beyaz ekran değil)
  if (!ready) {
    return (
      <div className="flex min-h-[calc(100vh-58px)] items-center justify-center bg-paper dark:bg-[#0C1614]">
        <div className="grid h-12 w-12 animate-pulse grid-cols-3 grid-rows-3 gap-1">
          <span />
          <span />
          <span className="rounded-sm bg-hope" />
          <span />
          <span className="rounded-sm bg-hope" />
          <span className="rounded-sm bg-forest" />
          <span className="rounded-sm bg-hope" />
          <span className="rounded-sm bg-forest" />
          <span className="rounded-sm bg-forest" />
        </div>
      </div>
    );
  }

  if (!role) return <RoleSelect />;
  if (role === "student") return <StudentView />;
  if (role === "school") return <SchoolDashboard />;
  return <TeacherWorkspace />;
}

/** Öğretmen çalışma alanı — sidebar + sohbet odaklı üretim. */
function TeacherWorkspace() {
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
      <ChatWindow
        key={resetKey}
        activeId={activeId}
        onActiveChange={setActiveId}
      />
    </div>
  );
}
