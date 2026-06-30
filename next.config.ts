// next.config.ts
import type { NextConfig } from "next";

/**
 * BUILD-SYNC / DRIFT ONARIMI
 * --------------------------
 * "GitHub'daki commit ile localhost zıt çalışıyor / eski arayüz render ediliyor"
 * sorununun mimari çözümü:
 *  - generateBuildId: geliştirmede her başlatmada TAZE bir build kimliği üretir,
 *    böylece eski .next derleme önbelleği asla yapışıp kalmaz.
 *  - headers: geliştirmede tüm yanıtlar `no-store` — tarayıcı eski HTML/asset
 *    tutamaz.
 *  - onDemandEntries: derlenen sayfalar bellekte uzun süre tutulmaz; dosyaya
 *    dokunduğunuz an taze derlenir.
 */
const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Geliştirmede her seferinde benzersiz build → kalıcı cache drift'i imkânsız.
  // Üretimde null döndürerek Next'in içerik-hash'li stabil kimliğini kullanırız.
  generateBuildId: async () => (isDev ? `pu-dev-${Date.now()}` : null),

  async headers() {
    if (!isDev) return [];
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
    ];
  },

  // Derlenen rotaları bellekte minimum tut → kaynak değişince anında yeniden derle.
  onDemandEntries: {
    maxInactiveAge: 10 * 1000,
    pagesBufferLength: 1,
  },
};

export default nextConfig;
