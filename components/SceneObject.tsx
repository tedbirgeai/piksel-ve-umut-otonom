// components/SceneObject.tsx
"use client";

/**
 * SAHNE NESNE KÜTÜPHANESİ — konuya özel, ekrana zıplayarak/dönerek giren SVG'ler.
 * Videoyu "canlı" yapan katman. Tamamen vektör, sıfır maliyet, çevrimdışı.
 * Yeni nesne eklemek için buraya bir case ekleyin; yönetmen otomatik kullanır.
 */
export default function SceneObject({
  name,
  size = 150,
}: {
  name: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        animation: "sceneObjIn 0.7s cubic-bezier(.2,1.4,.4,1) both",
      }}
      aria-hidden
    >
      {render(name)}
    </div>
  );
}

function render(name: string) {
  const S = { width: "100%", height: "100%" } as const;
  switch (name) {
    case "apple":
      return (
        <svg viewBox="0 0 100 100" style={S}>
          <path d="M50 30c-8-12-30-8-30 12 0 18 16 38 30 38s30-20 30-38c0-20-22-24-30-12Z" fill="#E0463A" />
          <path d="M50 30c0-8 6-14 14-14" stroke="#7A4B2A" strokeWidth="4" fill="none" strokeLinecap="round" />
          <ellipse cx="64" cy="20" rx="8" ry="5" fill="#3FA96A" />
          <ellipse cx="40" cy="48" rx="6" ry="9" fill="#fff" opacity="0.4" />
        </svg>
      );
    case "number":
      return (
        <svg viewBox="0 0 100 100" style={S}>
          <rect x="14" y="14" width="72" height="72" rx="16" fill="#2A6FDB" />
          <text x="50" y="68" fontSize="52" fontWeight="800" fill="#fff" textAnchor="middle" fontFamily="system-ui">
            123
          </text>
        </svg>
      );
    case "palette":
      return (
        <svg viewBox="0 0 100 100" style={S}>
          <path d="M50 18c-20 0-34 14-34 32 0 12 10 18 18 18 6 0 8 4 8 8 0 6 4 8 8 8 18 0 32-14 32-34S70 18 50 18Z" fill="#F4EFE4" stroke="#D8CFBC" strokeWidth="2" />
          <circle cx="36" cy="38" r="6" fill="#E0463A" />
          <circle cx="58" cy="32" r="6" fill="#E8963C" />
          <circle cx="70" cy="50" r="6" fill="#3FA96A" />
          <circle cx="40" cy="60" r="6" fill="#2A6FDB" />
        </svg>
      );
    case "shapes":
      return (
        <svg viewBox="0 0 100 100" style={S}>
          <circle cx="32" cy="34" r="16" fill="#E0463A" />
          <rect x="52" y="20" width="30" height="30" rx="5" fill="#2A6FDB" />
          <path d="M50 58l18 30H32Z" fill="#E8963C" />
        </svg>
      );
    case "animal":
      return (
        <svg viewBox="0 0 100 100" style={S}>
          <circle cx="50" cy="54" r="30" fill="#E8963C" />
          <circle cx="34" cy="30" r="11" fill="#E8963C" />
          <circle cx="66" cy="30" r="11" fill="#E8963C" />
          <circle cx="40" cy="50" r="5" fill="#15211F" />
          <circle cx="60" cy="50" r="5" fill="#15211F" />
          <ellipse cx="50" cy="62" rx="8" ry="6" fill="#7A4B2A" />
        </svg>
      );
    case "letter":
      return (
        <svg viewBox="0 0 100 100" style={S}>
          <rect x="14" y="14" width="72" height="72" rx="16" fill="#3FA96A" />
          <text x="50" y="70" fontSize="54" fontWeight="800" fill="#fff" textAnchor="middle" fontFamily="system-ui">
            Aa
          </text>
        </svg>
      );
    case "flask":
      return (
        <svg viewBox="0 0 100 100" style={S}>
          <path d="M42 20h16v24l16 30a8 8 0 0 1-7 12H33a8 8 0 0 1-7-12l16-30Z" fill="#CFE6DD" stroke="#2E807A" strokeWidth="3" />
          <path d="M34 64h32l8 14a4 4 0 0 1-3 6H29a4 4 0 0 1-3-6Z" fill="#3FA96A" opacity="0.8" />
          <circle cx="44" cy="74" r="3" fill="#fff" />
          <circle cx="56" cy="70" r="2.5" fill="#fff" />
        </svg>
      );
    case "music":
      return (
        <svg viewBox="0 0 100 100" style={S}>
          <path d="M40 24l34-8v44" stroke="#7E57C2" strokeWidth="6" fill="none" strokeLinecap="round" />
          <circle cx="34" cy="70" r="12" fill="#7E57C2" />
          <circle cx="70" cy="62" r="12" fill="#7E57C2" />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 100 100" style={S}>
          <path d="M50 82S18 60 18 38c0-12 9-20 20-20 7 0 12 4 12 4s5-4 12-4c11 0 20 8 20 20 0 22-32 44-32 44Z" fill="#E0463A" />
        </svg>
      );
    case "star":
    default:
      return (
        <svg viewBox="0 0 100 100" style={S}>
          <path d="M50 12l11 24 26 3-19 18 5 26-23-13-23 13 5-26-19-18 26-3Z" fill="#E8963C" />
        </svg>
      );
  }
}
