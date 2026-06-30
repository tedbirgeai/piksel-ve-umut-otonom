// components/RoleProvider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Role } from "@/lib/roles";

const KEY = "piksel-umut.role";

interface RoleCtx {
  role: Role | null;
  ready: boolean; // localStorage okundu mu (hydration güvenliği)
  setRole: (r: Role) => void;
  clearRole: () => void;
}

const Ctx = createContext<RoleCtx | null>(null);

/**
 * Seçilen rolü bu cihazda saklar (localStorage). `ready` false iken
 * hiçbir şey çizilmez — SSR/hydration uyuşmazlığını önler.
 */
export default function RoleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRoleState] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as Role | null;
      if (saved === "student" || saved === "teacher" || saved === "school") {
        setRoleState(saved);
      }
    } catch {
      /* yoksay */
    }
    setReady(true);
  }, []);

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    try {
      localStorage.setItem(KEY, r);
    } catch {
      /* yoksay */
    }
  }, []);

  const clearRole = useCallback(() => {
    setRoleState(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* yoksay */
    }
  }, []);

  return (
    <Ctx.Provider value={{ role, ready, setRole, clearRole }}>
      {children}
    </Ctx.Provider>
  );
}

export function useRole() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useRole, <RoleProvider> içinde kullanılmalıdır.");
  return c;
}
