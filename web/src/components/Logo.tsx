import React from "react";

// ─── Brand tokens ──────────────────────────────────────────────────────────────
export const B = {
  black:     "#0A0A0A",
  white:     "#FFFFFF",
  secondary: "#6B7280",
  border:    "#E5E7EB",
  accent:    "#E8930A",
} as const;

// ─── Typeface helpers ───────────────────────────────────────────────────────────
export const SANS  = "'Geist', 'Geist Variable', sans-serif";
export const MONO  = "'Geist Mono', 'Geist Variable Mono', monospace";

// ═══════════════════════════════════════════════════════════════════════════════
// LogoMark  — geometric V with dissolving interior
// ═══════════════════════════════════════════════════════════════════════════════
interface LogoMarkProps {
  size?: number;
  dark?: boolean;
  uid?: string;
}

export const LogoMark = ({ size = 48, dark = false, uid = "0" }: LogoMarkProps) => {
  const ink = dark ? B.white : B.black;
  // Unique IDs per instance to avoid SVG gradient collisions
  const gid   = `vg-${uid}-${dark ? "d" : "l"}`;
  const mid   = `vm-${uid}-${dark ? "d" : "l"}`;

  // Outer triangle: the full V silhouette (48×48 viewBox)
  // Inner triangle: creates the hollow interior (evenodd punches it out)
  // The radial gradient centre sits deep inside the hollow, making inner
  // edges of each stroke dissolve to transparent while outer edges stay solid.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        {/* Radial gradient: transparent at centre → fully opaque at perimeter */}
        <radialGradient
          id={gid}
          cx="24" cy="16" r="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor={ink} stopOpacity="0"   />
          <stop offset="42%"  stopColor={ink} stopOpacity="0"   />
          <stop offset="78%"  stopColor={ink} stopOpacity="0.88"/>
          <stop offset="100%" stopColor={ink} stopOpacity="1"   />
        </radialGradient>

        {/* Mask channels the gradient through the V shape */}
        <mask id={mid}>
          {/* White = show; transparent = hide */}
          <path
            d="M3,5 L24,45 L45,5 Z  M13,5 L24,37 L35,5 Z"
            fillRule="evenodd"
            fill="white"
          />
        </mask>
      </defs>

      {/* The gradient rect, clipped to the V shape via mask */}
      <rect
        x="0" y="0" width="48" height="48"
        fill={`url(#${gid})`}
        mask={`url(#${mid})`}
      />
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Wordmark  — "veclabs" in Geist Semibold
// ═══════════════════════════════════════════════════════════════════════════════
interface WordmarkProps {
  fontSize?: number;
  dark?: boolean;
}

export const Wordmark = ({ fontSize = 24, dark = false }: WordmarkProps) => (
  <span
    style={{
      fontFamily: SANS,
      fontWeight: 600,
      fontSize,
      letterSpacing: "-0.02em",
      color: dark ? B.white : B.black,
      lineHeight: 1,
      display: "inline-block",
      userSelect: "none",
    }}
  >
    veclabs
  </span>
);

// ═══════════════════════════════════════════════════════════════════════════════
// LogoLockup  — mark + wordmark, gap ≈ one character width
// ═══════════════════════════════════════════════════════════════════════════════
interface LogoLockupProps {
  markSize?: number;
  dark?: boolean;
  uid?: string;
}

export const LogoLockup = ({ markSize = 48, dark = false, uid = "0" }: LogoLockupProps) => {
  const wordSize = markSize * 0.52;
  const gap      = wordSize * 0.62; // ≈ one character width
  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      <LogoMark size={markSize} dark={dark} uid={uid} />
      <Wordmark fontSize={wordSize} dark={dark} />
    </div>
  );
};
