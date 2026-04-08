import { useEffect, useMemo, useState } from "react";

type Hsl = { h: number; s: number; l: number };

function rgbToHsl(r: number, g: number, b: number): Hsl {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  return { h, s: s * 100, l: l * 100 };
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

function hslString(hsl: Hsl) {
  return `${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(hsl.l)}%`;
}

async function extractVibrantHsl(src: string): Promise<Hsl | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 36;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return resolve(null);

      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      // Pick the most saturated non-dark pixel as “accent”.
      let bestScore = -1;
      let best: Hsl | null = null;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]!;
        const g = data[i + 1]!;
        const b = data[i + 2]!;
        const a = data[i + 3]!;
        if (a < 220) continue;

        const hsl = rgbToHsl(r, g, b);
        if (hsl.l < 18 || hsl.l > 92) continue; // avoid near-black/white

        const score = hsl.s * 1.2 + (50 - Math.abs(hsl.l - 55));
        if (score > bestScore) {
          bestScore = score;
          best = hsl;
        }
      }

      resolve(best);
    };
    img.onerror = () => resolve(null);
  });
}

export function useHeroTheme(imageSrc: string) {
  const [accent, setAccent] = useState<Hsl | null>(null);

  useEffect(() => {
    let alive = true;
    extractVibrantHsl(imageSrc).then((hsl) => {
      if (!alive) return;
      setAccent(hsl);
    });
    return () => {
      alive = false;
    };
  }, [imageSrc]);

  const vars = useMemo(() => {
    const a = accent ?? { h: 205, s: 80, l: 55 };
    const selected = { ...a, s: clamp(a.s + 10, 30, 92), l: clamp(a.l, 34, 58) };
    const range = { ...a, s: clamp(a.s - 20, 20, 70), l: 86 };
    const hover = { ...a, s: clamp(a.s - 30, 15, 60), l: 90 };
    const spotlight = { h: a.h, s: clamp(a.s - 45, 12, 30), l: 70 };
    const wall = { h: a.h, s: clamp(a.s - 55, 6, 16), l: 92 };
    const wallLight = { h: a.h, s: clamp(a.s - 60, 5, 14), l: 97 };

    return {
      "--calendar-selected": hslString(selected),
      "--calendar-range": hslString(range),
      "--calendar-hover": hslString(hover),
      "--spotlight-color": hslString(spotlight),
      "--wall": hslString(wall),
      "--wall-light": hslString(wallLight),
    } as const;
  }, [accent]);

  return { vars, accent };
}

