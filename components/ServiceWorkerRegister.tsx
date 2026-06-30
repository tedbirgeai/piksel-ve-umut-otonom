// components/ServiceWorkerRegister.tsx
"use client";

import { useEffect } from "react";

/**
 * Service worker'ı yalnızca üretim derlemesinde kaydeder.
 * (Geliştirme modunda Next.js HMR ile çakışmaması için devre dışıdır.)
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }
    const onLoad = () => {
      navigator.serviceWorker.register("/service-worker.js").catch(() => {
        /* sessizce yok say */
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
