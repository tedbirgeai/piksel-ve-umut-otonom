// components/ThemeProvider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark";
const KEY = "piksel-umut.theme";

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

/**
 * Dark/Light tema sağlayıcısı.
 * `.dark` sınıfını <html>'e ekler/çıkarır; tercih localStorage'da saklanır.
 * Tailwind v4 tarafında globals.css'teki `@custom-variant dark` ile çalışır.
 */
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as Theme | null) ?? null;
    const initial: Theme =
      saved ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    apply(initial);
    setThemeState(initial);
  }, []);

  const apply = (t: Theme) => {
    document.documentElement.classList.toggle("dark", t === "dark");
  };

  const setTheme = useCallback((t: Theme) => {
    apply(t);
    setThemeState(t);
    localStorage.setItem(KEY, t);
  }, []);

  const toggle = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme],
  );

  return (
    <Ctx.Provider value={{ theme, toggle, setTheme }}>{children}</Ctx.Provider>
  );
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme, <ThemeProvider> içinde kullanılmalıdır.");
  return c;
}
