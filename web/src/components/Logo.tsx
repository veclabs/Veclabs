import React from "react";

export const MONO =
  "var(--font-geist-mono), 'Geist Mono', 'Courier New', monospace";

interface LogoMarkProps {
  size?: number;
  dark?: boolean;
  uid?: string;
}

/** Solid V mark — no gradients (brand system) */
export const LogoMark = ({
  size = 48,
  dark = true,
  uid = "0",
}: LogoMarkProps) => {
  const ink = dark ? "#FFFFFF" : "#0A0A0A";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
      aria-hidden
    >
      <path
        d="M3,5 L24,45 L45,5 Z  M13,5 L24,37 L35,5 Z"
        fillRule="evenodd"
        fill={ink}
      />
    </svg>
  );
};

interface WordmarkProps {
  fontSize?: number;
  dark?: boolean;
}

export const Wordmark = ({ fontSize = 24, dark = true }: WordmarkProps) => (
  <span
    style={{
      fontFamily: MONO,
      fontWeight: 600,
      fontSize,
      letterSpacing: "-0.02em",
      color: dark ? "#FFFFFF" : "#0A0A0A",
      lineHeight: 1,
      display: "inline-block",
      userSelect: "none",
    }}
  >
    veclabs
  </span>
);

interface LogoLockupProps {
  markSize?: number;
  dark?: boolean;
  uid?: string;
}

export const LogoLockup = ({
  markSize = 48,
  dark = true,
  uid = "0",
}: LogoLockupProps) => {
  const wordSize = markSize * 0.52;
  const gap = wordSize * 0.62;
  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      <LogoMark size={markSize} dark={dark} uid={uid} />
      <Wordmark fontSize={wordSize} dark={dark} />
    </div>
  );
};
