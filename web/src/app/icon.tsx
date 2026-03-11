import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 48 48"
          fill="none"
        >
          <defs>
            <radialGradient id="g" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#F0EDE6" stopOpacity="0" />
              <stop offset="60%" stopColor="#F0EDE6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F0EDE6" stopOpacity="1" />
            </radialGradient>
          </defs>
          <path
            d="M8 10 L24 38 L40 10"
            stroke="url(#g)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}