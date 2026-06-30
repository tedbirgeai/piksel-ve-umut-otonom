// components/Navbar.tsx
import Link from "next/link";
import PixelMark from "./PixelMark";

const LINKS = [
  { href: "/#marka", label: "Marka" },
  { href: "/#urun", label: "Ürün" },
  { href: "/#telif", label: "Telif" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-7 py-3.5">
        <Link href="/" className="flex items-center gap-3">
          <PixelMark size={26} />
          <span className="font-display text-[17px] font-bold tracking-tightest text-forest">
            Piksel<span className="text-hope">·</span>Umut
          </span>
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium text-muted">
          <div className="hidden items-center gap-6 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-forest"
              >
                {l.label}
              </a>
            ))}
            <Link href="/panel" className="transition-colors hover:text-forest">
              Panel
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
