"use client";

import { useState } from "react";
import Spline from "@splinetool/react-spline";

export default function SplineScene() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-full w-full">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
            <span className="text-xs tracking-wider text-white/30">
              Loading scene...
            </span>
          </div>
        </div>
      )}
      <Spline
        scene="https://prod.spline.design/vI8aXteT1OpMS8NC/scene.splinecode" 
        onLoad={() => setLoaded(true)}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}


