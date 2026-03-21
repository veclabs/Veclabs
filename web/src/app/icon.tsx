import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#0A0A0A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
          <path
            d="M3,5 L24,45 L45,5 Z  M13,5 L24,37 L35,5 Z"
            fillRule="evenodd"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
