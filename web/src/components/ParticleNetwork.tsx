"use client";

import { useEffect, useRef } from "react";

export function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const NODE_COUNT    = 55;
    const CONNECT_DIST  = 160;
    const SPEED         = 0.28;

    const lineRgb = "45,74,62";   // #2D4A3E (green-light)
    const glowRgb = "45,74,62";

    let W = 0, H = 0;
    let raf: number;
    const mouse = { x: -9999, y: -9999 };

    interface Node {
      x: number; y: number;
      vx: number; vy: number;
      r: number;
      pulse: number;
      pulseSpeed: number;
      bright: boolean;
    }

    let nodes: Node[] = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      const rect = canvas!.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas!.width  = Math.floor(W * dpr);
      canvas!.height = Math.floor(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initNodes() {
      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        const r = 1.5 + Math.random() * 2.5;
        nodes.push({
          x:          Math.random() * W,
          y:          Math.random() * H,
          vx:         (Math.random() - 0.5) * SPEED,
          vy:         (Math.random() - 0.5) * SPEED,
          r,
          pulse:      Math.random() * Math.PI * 2,
          pulseSpeed: 0.008 + Math.random() * 0.012,
          bright:     Math.random() < 0.18,
        });
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      // Subtle vignette
      const vg = ctx!.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
      vg.addColorStop(0, "rgba(10,10,10,0.0)");
      vg.addColorStop(1, "rgba(10,10,10,0.55)");
      ctx!.fillStyle = vg;
      ctx!.fillRect(0, 0, W, H);

      // Edges
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.45;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.strokeStyle = `rgba(${lineRgb},${alpha.toFixed(3)})`;
            ctx!.lineWidth = 0.6;
            ctx!.stroke();
          }
        }

        // Mouse connection
        const mdx = a.x - mouse.x, mdy = a.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < CONNECT_DIST * 1.4) {
          const alpha = (1 - mdist / (CONNECT_DIST * 1.4)) * 0.7;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(mouse.x, mouse.y);
          ctx!.strokeStyle = `rgba(${glowRgb},${alpha.toFixed(3)})`;
          ctx!.lineWidth = 0.8;
          ctx!.stroke();
        }
      }

      // Nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += n.pulseSpeed;

        if (n.x < 0) { n.x = 0; n.vx *= -1; }
        if (n.x > W) { n.x = W; n.vx *= -1; }
        if (n.y < 0) { n.y = 0; n.vy *= -1; }
        if (n.y > H) { n.y = H; n.vy *= -1; }

        const pf = 0.75 + 0.25 * Math.sin(n.pulse);
        const r  = n.r * pf;

        if (n.bright) {
          const grd = ctx!.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 7);
          grd.addColorStop(0, `rgba(${glowRgb},${(0.18 * pf).toFixed(3)})`);
          grd.addColorStop(1, `rgba(${glowRgb},0)`);
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, r * 7, 0, Math.PI * 2);
          ctx!.fillStyle = grd;
          ctx!.fill();

          ctx!.beginPath();
          ctx!.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx!.fillStyle = "#2D4A3E";
          ctx!.fill();
        } else {
          const grd = ctx!.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4);
          grd.addColorStop(0, `rgba(${lineRgb},${(0.12 * pf).toFixed(3)})`);
          grd.addColorStop(1, `rgba(${lineRgb},0)`);
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
          ctx!.fillStyle = grd;
          ctx!.fill();

          ctx!.beginPath();
          ctx!.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx!.fillStyle = "#2D4A3E";
          ctx!.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }

    function onMouseLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    function onResize() {
      cancelAnimationFrame(raf);
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      resize();
      initNodes();
      raf = requestAnimationFrame(draw);
    }

    resize();
    initNodes();
    raf = requestAnimationFrame(draw);

    canvas.addEventListener("mousemove",  onMouseMove,  { passive: true });
    canvas.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize",     onResize,     { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove",  onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize",     onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "fixed",
        inset:         0,
        width:         "100%",
        height:        "100%",
        zIndex:        0,
        display:       "block",
        pointerEvents: "none",
      }}
    />
  );
}