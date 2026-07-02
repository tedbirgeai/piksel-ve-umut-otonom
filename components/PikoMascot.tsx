// components/PikoMascot.tsx
"use client";

/**
 * PİKO — Piksel ve Umut'un maskotu. Konsept görsele sadık: mavi voxel/küp robot,
 * parlayan cam-mavi yüz paneli, iki ışıklı göz + sevimli gülümseme.
 *
 * Canlı: konuşurken ağzı oynar (talking), gözü kırpar, hafifçe zıplar.
 * Tamamen SVG + CSS — sıfır maliyet, çevrimdışı, zayıf donanımda akıcı.
 *
 * props:
 *   talking  — anlatım sırasında ağız + zıplama animasyonu
 *   size     — piksel cinsinden genişlik
 *   wave     — kolunu sallasın (selam/işaret)
 */
export default function PikoMascot({
  talking = false,
  size = 180,
  wave = false,
  pose = "idle",
}: {
  talking?: boolean;
  size?: number;
  wave?: boolean;
  pose?: "idle" | "point" | "think" | "celebrate";
}) {
  // Voxel gövde için mavi tonları (konsept görseldeki gibi)
  const C = {
    light: "#7CC7FF",
    mid: "#3CA0F5",
    dark: "#2176D6",
    face: "#0B2C52",
    glow: "#BEEAFF",
    eye: "#DFF4FF",
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        animation: talking
          ? "pikoHop 0.5s ease-in-out infinite"
          : "pikoFloat 3.2s ease-in-out infinite",
        transformOrigin: "center bottom",
      }}
      aria-label="Piko, Piksel ve Umut maskotu"
      role="img"
    >
      <svg viewBox="0 0 120 130" width={size} height={size} fill="none">
        <defs>
          <filter id="pikoGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* zemin gölgesi */}
        <ellipse cx="60" cy="123" rx="34" ry="5" fill="#0F3D3A" opacity="0.14" />

        {/* SOL KOL (işaret/sallama/poz) */}
        <g
          style={{
            transformOrigin: "38px 78px",
            transform:
              pose === "celebrate"
                ? "rotate(-45deg)"
                : pose === "think"
                  ? "rotate(-70deg)"
                  : "none",
            animation: wave
              ? "pikoWave 1.1s ease-in-out infinite"
              : talking
                ? "pikoArm 0.9s ease-in-out infinite"
                : "none",
          }}
        >
          <rect x="18" y="74" width="12" height="12" rx="2.5" fill={C.mid} />
          <rect x="10" y="66" width="12" height="12" rx="2.5" fill={C.light} />
        </g>

        {/* SAĞ KOL (poz: işaret / kutlama) */}
        <g
          style={{
            transformOrigin: "96px 80px",
            transform:
              pose === "celebrate"
                ? "rotate(45deg)"
                : pose === "point"
                  ? "rotate(-20deg)"
                  : "none",
          }}
        >
          <rect x="90" y="74" width="12" height="12" rx="2.5" fill={C.mid} />
          <rect x="98" y="80" width="12" height="12" rx="2.5" fill={C.dark} />
        </g>

        {/* GÖVDE — voxel bloklar */}
        <g>
          <rect x="34" y="66" width="52" height="40" rx="6" fill={C.mid} />
          <rect x="34" y="66" width="52" height="12" rx="6" fill={C.light} />
          <rect x="34" y="94" width="52" height="12" rx="6" fill={C.dark} />
          {/* göğüs kalp/enerji göstergesi */}
          <rect x="52" y="80" width="16" height="10" rx="2" fill={C.glow} opacity="0.9" />
          <rect x="55" y="82.5" width="10" height="5" rx="1.5" fill={C.mid} />
        </g>

        {/* BACAKLAR */}
        <rect x="42" y="106" width="12" height="12" rx="2.5" fill={C.dark} />
        <rect x="66" y="106" width="12" height="12" rx="2.5" fill={C.dark} />

        {/* BAŞ — parlayan cam-mavi yüz paneli */}
        <g filter="url(#pikoGlow)">
          <rect x="30" y="20" width="60" height="46" rx="12" fill={C.mid} />
          <rect x="30" y="20" width="60" height="14" rx="12" fill={C.light} />
          {/* yüz paneli */}
          <rect x="37" y="28" width="46" height="32" rx="9" fill={C.face} />
        </g>

        {/* anten */}
        <rect x="57" y="12" width="6" height="9" rx="3" fill={C.dark} />
        <circle cx="60" cy="10" r="4" fill={C.glow}>
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </circle>

        {/* GÖZLER — kırpan */}
        <g fill={C.eye}>
          <rect x="45" y="37" width="10" height="12" rx="3">
            <animate
              attributeName="height"
              values="12;12;2;12;12"
              keyTimes="0;0.45;0.5;0.55;1"
              dur="3.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              values="37;37;42;37;37"
              keyTimes="0;0.45;0.5;0.55;1"
              dur="3.4s"
              repeatCount="indefinite"
            />
          </rect>
          <rect x="65" y="37" width="10" height="12" rx="3">
            <animate
              attributeName="height"
              values="12;12;2;12;12"
              keyTimes="0;0.45;0.5;0.55;1"
              dur="3.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              values="37;37;42;37;37"
              keyTimes="0;0.45;0.5;0.55;1"
              dur="3.4s"
              repeatCount="indefinite"
            />
          </rect>
        </g>

        {/* AĞIZ — konuşurken açılıp kapanır, sabitken gülümser */}
        {talking ? (
          <rect x="52" y="52" width="16" height="6" rx="3" fill={C.glow}>
            <animate
              attributeName="height"
              values="3;8;3;7;3"
              dur="0.42s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              values="54;51;54;51.5;54"
              dur="0.42s"
              repeatCount="indefinite"
            />
          </rect>
        ) : (
          <path
            d="M51 52 Q60 60 69 52"
            stroke={C.glow}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </svg>
    </div>
  );
}
