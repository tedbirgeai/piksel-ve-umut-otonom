// components/PixelMark.tsx
import type { CSSProperties } from "react";

/**
 * Marka sembolü — "Yükselen Piksel".
 * Koyu pikseller bilgi temelini, kehribar pikseller umudu/büyümeyi temsil eder.
 * variant="dark" koyu zeminler (footer vb.) içindir.
 */
export default function PixelMark({
  size = 28,
  gap = 2,
  variant = "light",
  className,
}: {
  size?: number;
  gap?: number;
  variant?: "light" | "dark";
  className?: string;
}) {
  const base = variant === "dark" ? "#EAF1EF" : "#0F3D3A";
  const cells: ("hope" | "base" | "empty")[] = [
    "empty", "empty", "hope",
    "empty", "hope", "base",
    "hope", "base", "base",
  ];

  const wrapStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(3, 1fr)",
    gap,
    width: size,
    height: size,
  };

  return (
    <span aria-hidden className={className} style={wrapStyle}>
      {cells.map((c, i) => (
        <span
          key={i}
          style={{
            borderRadius: Math.max(1, size * 0.06),
            background:
              c === "hope" ? "#E89B3C" : c === "base" ? base : "transparent",
          }}
        />
      ))}
    </span>
  );
}
