// app/page.tsx
import PixelMark from "@/components/PixelMark";

const PILLARS = [
  {
    dot: "bg-forest",
    title: "İçerik Üretim Fabrikası",
    desc: "Yerel yapay zekâ (Ollama / Forge) ile pedagojik ders içeriğini saniyeler içinde üretin — internet bağlantısı gerekmez.",
  },
  {
    dot: "bg-tea",
    title: "Dijital Kütüphane",
    desc: "Üretilen her içerik IPFS üzerinde kalıcı olarak saklanır; silinemez, sansürlenemez, her yerden erişilebilir.",
  },
  {
    dot: "bg-hope",
    title: "Adil Telif Dağıtımı",
    desc: "Akıllı sözleşme, içerik her erişildiğinde telifi otomatik ve şeffaf biçimde üreticiye aktarır.",
  },
];

const STATS = [
  { value: "%100", label: "Yerel çalışır — buluta bağımlı değil" },
  { value: "0₺", label: "Sunucu maliyeti — içerik IPFS'te yaşar" },
  { value: "∞", label: "Kalıcı arşiv — silinemez, kapatılamaz" },
  { value: "Adil", label: "Üretene şeffaf, blokzincir tabanlı telif" },
];

const ROYALTIES = [
  { title: "Kesirler · 4. Sınıf", reach: "2,1B erişim", eth: "0,18 ETH" },
  { title: "Fotosentez · 6. Sınıf", reach: "3,4B erişim", eth: "0,15 ETH" },
  { title: "Cumhuriyet · 8. Sınıf", reach: "1,7B erişim", eth: "0,09 ETH" },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative px-7 py-24 text-center sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 hero-grid opacity-70"
          style={{
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 38%, #000, transparent 75%)",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 38%, #000, transparent 75%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl animate-fade-up">
          <div className="mx-auto mb-7 w-fit">
            <PixelMark size={84} gap={6} />
          </div>
          <p className="eyebrow mb-5">Otonom Eğitim Ekosistemi</p>
          <h1 className="text-[clamp(44px,7vw,80px)] font-bold leading-[0.98] text-forest">
            Piksel <span className="text-hope">ve</span> Umut
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Her çocuğun bir pikseli, her pikselin bir umudu var. Yerel yapay zekâ
            ve merkeziyetsiz depolama ile bilgiyi{" "}
            <strong className="font-semibold text-ink">özgürleştiren</strong>{" "}
            bağımsız eğitim ekosistemi.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-2.5">
            <span className="chip"><span className="h-1.5 w-1.5 rounded-sm bg-forest" />İçerik Üretim Fabrikası</span>
            <span className="chip"><span className="h-1.5 w-1.5 rounded-sm bg-tea" />Dijital Kütüphane</span>
            <span className="chip"><span className="h-1.5 w-1.5 rounded-sm bg-hope" />Adil Telif Dağıtımı</span>
          </div>
        </div>
      </section>

      {/* MANİFESTO BANDI */}
      <section id="marka" className="bg-forest px-7 py-24 text-paper">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-brand text-tea/90">// Manifesto</p>
          <p className="mt-7 max-w-4xl font-display text-[clamp(26px,3.6vw,40px)] font-medium leading-snug tracking-tightest">
            Bilgi bir ayrıcalık değil, herkesin hakkıdır. İnternet kesildiğinde,
            sansür geldiğinde ya da kaynak tükendiğinde bile öğrenme durmamalı.{" "}
            <span className="text-hope">Piksel ve Umut</span>, eğitimi merkezlerden
            bağımsız kılmak için kuruldu.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-forest-600 bg-forest-600 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-forest px-6 py-7">
                <div className="font-display text-3xl font-bold text-hope">{s.value}</div>
                <div className="mt-1.5 text-sm text-[#A9C8C2]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ÜRÜN / SÜTUNLAR */}
      <section id="urun" className="mx-auto max-w-6xl px-7 py-24">
        <p className="eyebrow mb-3.5">// Ekosistem</p>
        <h2 className="text-[clamp(28px,4vw,42px)] font-bold text-forest">
          Üç bileşen, tek bir bağımsız altyapı
        </h2>
        <div className="mt-11 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PILLARS.map((p) => (
            <article key={p.title} className="card">
              <span className={`mb-5 inline-block h-3 w-3 rounded-sm ${p.dot}`} />
              <h3 className="text-xl font-semibold text-ink">{p.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{p.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* TELİF DAĞITIM RAPORU — ferah / açık tema (eski koyu bileşenin yeniden tasarımı) */}
      <section id="telif" className="border-y border-line bg-sand px-7 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow mb-3.5">// Telif &amp; Dağıtım</p>
          <h2 className="text-[clamp(28px,4vw,42px)] font-bold text-forest">
            Üretene hakkı, şeffafça
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
            İçerikleriniz her erişildiğinde, akıllı sözleşme telifi otomatik ve
            denetlenebilir biçimde size aktarır. Aracı yok, kesinti yok.
          </p>

          <div className="mt-9 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.3fr]">
            {/* Cüzdan kartı */}
            <div className="rounded-2xl bg-gradient-to-br from-forest to-forest-600 p-7 text-paper shadow-lift">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[13px] text-[#A9C8C2]">Bağlı cüzdan</span>
                <span className="font-mono text-[11.5px] text-hope">0x7a…3Fb</span>
              </div>
              <div className="text-[13px] text-[#A9C8C2]">Çekilebilir telif</div>
              <div className="mb-6 mt-1 font-display text-[40px] font-bold leading-none">
                0,42 <span className="text-xl text-hope">ETH</span>
              </div>
              <button
                type="button"
                className="w-full rounded-xl bg-hope py-3 font-sans text-sm font-bold text-hope-ink transition-colors hover:bg-[#d98b2a]"
              >
                Telifleri Çek
              </button>
              <p className="mt-2.5 text-center font-mono text-[11px] text-tea/90">
                min. çekim 0,01 ETH
              </p>
            </div>

            {/* İçerik bazında kazanç */}
            <div className="card p-6">
              <div className="mb-3.5 text-[13px] font-semibold text-ink">
                İçerik bazında kazanç
              </div>
              <ul>
                {ROYALTIES.map((r, i) => (
                  <li
                    key={r.title}
                    className={`flex items-center justify-between py-2.5 ${
                      i < ROYALTIES.length - 1 ? "border-b border-sand" : ""
                    }`}
                  >
                    <span className="text-[13.5px] text-ink/90">{r.title}</span>
                    <span className="flex items-center gap-4">
                      <span className="text-xs text-muted">{r.reach}</span>
                      <span className="font-mono text-[13px] font-semibold text-forest">{r.eth}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#DCE9E5] bg-[#EFF4F2] px-4 py-3.5">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-sm bg-tea" />
                <span className="text-[13px] leading-snug text-[#2A4A45]">
                  Tüm dağıtımlar <strong className="text-forest">akıllı sözleşmede</strong>{" "}
                  kayıtlıdır — kimse aracılık etmez, kimse kesinti yapamaz.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
