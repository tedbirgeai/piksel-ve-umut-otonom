// next.config.ts
import type { NextConfig } from "next";
import path from "path";

/**
 * ============================================================================
 *  PİKSEL VE UMUT — FRONTEND İZOLASYON & BUILD-SYNC YAPILANDIRMASI
 * ============================================================================
 *
 *  SORUN: Monorepo benzeri yapıda kökte Hardhat/blockchain (package.json +
 *  lockfile) bulunduğu için Next.js "workspace root"u YANLIŞ çıkarsıyor;
 *  açılışta "inferred workspace root" uyarısı veriyor ve bazen kök paketleri
 *  derlemeye katarak drift/karışıklık yaratıyor.
 *
 *  ÇÖZÜM: Workspace kökünü açıkça BU klasöre (frontend) sabitliyoruz.
 *  Böylece Next.js + Turbopack, kökteki Hardhat dosyalarını ve package.json'ı
 *  TAMAMEN yok sayar; yalnızca frontend'e odaklanır. Manuel dizin değişikliği
 *  veya dosya silme GEREKMEZ.
 * ----------------------------------------------------------------------------
 */
const isDev = process.env.NODE_ENV !== "production";

// Bu config dosyasının bulunduğu klasör = frontend kökü. Tek doğruluk noktası.
const FRONTEND_ROOT = path.resolve(__dirname);

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /* ---- 1) FRONTEND İZOLASYONU (workspace root sabitleme) ---- */

  // Turbopack'in kök tespitini bu klasöre kilitler — üst dizindeki Hardhat
  // package.json / lockfile artık dikkate alınmaz, "inferred root" uyarısı biter.
  turbopack: {
    root: FRONTEND_ROOT,
  },

  // Üretim derlemesinde (next build) dosya-izleme kökünü de buraya sabitler;
  // çıktı, kökteki blockchain dosyalarından bağımsız ve izole olur.
  outputFileTracingRoot: FRONTEND_ROOT,

  /* ---- 2) BUILD-SYNC / DRIFT ONARIMI ---- */

  // Geliştirmede her başlatmada taze build kimliği → eski .next cache yapışamaz.
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

  // Derlenen rotalar bellekte minimum tutulur → dosyaya dokununca anında derlenir.
  onDemandEntries: {
    maxInactiveAge: 10 * 1000,
    pagesBufferLength: 1,
  },
};

export default nextConfig;
