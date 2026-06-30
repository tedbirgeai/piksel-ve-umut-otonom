// components/Footer.tsx
import PixelMark from "./PixelMark";

export default function Footer() {
  return (
    <footer className="bg-ink px-7 pb-10 pt-16 text-[#A9C8C2]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
        <div className="max-w-sm">
          <div className="mb-4 flex items-center gap-3">
            <PixelMark size={30} variant="dark" gap={2.5} />
            <span className="font-display text-lg font-bold text-white">
              Piksel ve Umut
            </span>
          </div>
          <p className="text-[13.5px] leading-relaxed">
            Otonom eğitim ekosistemi. Bilgiyi özgürleştiren, üretene hakkını
            veren, geleceğe inanan açık bir altyapı.
          </p>
        </div>

        <div className="font-mono text-xs leading-loose text-tea/90">
          <div className="mb-1.5 font-medium text-white">Bileşenler</div>
          <div>Ollama / Forge — yerel YZ</div>
          <div>IPFS — merkeziyetsiz depolama</div>
          <div>Akıllı sözleşme — adil telif</div>
        </div>
      </div>

      <div className="mx-auto mt-9 flex max-w-6xl flex-wrap justify-between gap-2 border-t border-[#2A3A36] pt-6 font-mono text-[11.5px] text-[#5C7570]">
        <span>© 2026 Piksel ve Umut · MIT Lisansı</span>
        <span>Her piksel bir umut.</span>
      </div>
    </footer>
  );
}
