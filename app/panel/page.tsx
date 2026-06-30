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
        <PanelGate />
      </RoleProvider>
    </ThemeProvider>
  );
}

function PanelGate() {
  const { role, ready } = useRole();

  // localStorage okunana kadar boş ekran (hydration güvenliği)
  if (!ready) return <div className="min-h-[calc(100vh-58px)] bg-paper dark:bg-[#0C1614]" />;

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
