import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* Çalışma alanını bu klasöre sabitleyerek Turbopack uyarılarını susturuyoruz */
  experimental: {} as any,
  
  /* Eğer ileride medya dosyalarını (asset/video) dışarıdan çekeceksen 
     buraya ek konfigürasyonlar ekleyebiliriz. */
  reactStrictMode: true,
};

export default nextConfig;