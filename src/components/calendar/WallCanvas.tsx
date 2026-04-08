import { useEffect, useRef } from "react";

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

export function WallCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let start = performance.now();

    const resize = () => {
      const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = (t: number) => {
      const time = (t - start) / 1000;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      // Bright wall: soft spotlight + grain (hero-tinted wall vars)
      const wall = getComputedStyle(document.documentElement).getPropertyValue("--wall").trim();
      const wallLight = getComputedStyle(document.documentElement).getPropertyValue("--wall-light").trim();
      const base = ctx.createLinearGradient(0, 0, 0, h);
      base.addColorStop(0, `hsl(${wallLight} / 1)`);
      base.addColorStop(0.55, `hsl(${wall} / 1)`);
      base.addColorStop(1, `hsl(${wallLight} / 1)`);
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      // Slow moving spotlight “breath”
      const cx = w * 0.5 + Math.sin(time * 0.18) * 26;
      const cy = h * 0.22 + Math.cos(time * 0.14) * 12;
      const r = Math.min(w, h) * (0.55 + Math.sin(time * 0.12) * 0.03);
      const spot = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      spot.addColorStop(0, "rgba(255,255,255,0.26)");
      spot.addColorStop(0.35, "rgba(255,255,255,0.12)");
      spot.addColorStop(1, "rgba(255,255,255,0.0)");
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, w, h);

      // Vignette
      const vig = ctx.createRadialGradient(w * 0.5, h * 0.6, Math.min(w, h) * 0.15, w * 0.5, h * 0.6, Math.min(w, h) * 0.95);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.10)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      // Subtle grain
      const grainAlpha = 0.035;
      const size = 90;
      ctx.save();
      ctx.globalAlpha = grainAlpha;
      for (let y = 0; y < h; y += size) {
        for (let x = 0; x < w; x += size) {
          const n = Math.floor(18 + (Math.sin(x * 0.03 + time * 0.6) + Math.cos(y * 0.03 - time * 0.5)) * 6);
          ctx.fillStyle = `rgba(0,0,0,${n / 255})`;
          ctx.fillRect(x, y, size, size);
        }
      }
      ctx.restore();

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}

