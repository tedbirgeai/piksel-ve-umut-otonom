// tailwind.config.ts
// NOT: Tailwind v4 kullanıyorsunuz. Tema (renk/font) artık app/globals.css
// içindeki @theme bloğunda tanımlıdır; bu dosya v4 tarafından OTOMATİK OKUNMAZ.
// Yalnızca içerik taraması için referans olarak bırakılmıştır ve silinebilir.
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
