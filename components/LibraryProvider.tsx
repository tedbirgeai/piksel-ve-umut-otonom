// components/LibraryProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Lesson } from "@/lib/types";

const STORAGE_KEY = "piksel-umut.library.v1";

interface LibraryContextValue {
  lessons: Lesson[];
  addLesson: (lesson: Lesson) => void;
  updateLesson: (id: string, patch: Partial<Lesson>) => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

/** Üretilen dersleri tutan ve localStorage'a kalıcılaştıran paylaşımlı durum. */
export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // İlk yüklemede localStorage'dan oku
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLessons(JSON.parse(raw));
    } catch {
      /* yok say */
    }
  }, []);

  // Değişiklikleri yaz
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
    } catch {
      /* yok say */
    }
  }, [lessons]);

  const addLesson = useCallback((lesson: Lesson) => {
    setLessons((prev) => [lesson, ...prev]);
  }, []);

  const updateLesson = useCallback((id: string, patch: Partial<Lesson>) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    );
  }, []);

  return (
    <LibraryContext.Provider value={{ lessons, addLesson, updateLesson }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx)
    throw new Error("useLibrary, <LibraryProvider> içinde kullanılmalıdır.");
  return ctx;
}
