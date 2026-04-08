import { useCallback, useRef } from "react";

type AudioState = {
  ctx: AudioContext;
  noise: AudioBuffer;
};

function createNoiseBuffer(ctx: AudioContext, seconds: number) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    // Slightly biased noise for a “paper” texture
    const x = Math.random() * 2 - 1;
    data[i] = x * x * (x < 0 ? -1 : 1) * 0.75;
  }
  return buffer;
}

export function useFlipSound() {
  const stateRef = useRef<AudioState | null>(null);
  const MASTER_GAIN = 2.0;

  const ensure = useCallback(() => {
    if (stateRef.current) return stateRef.current;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx: AudioContext = new AudioCtx();
    const noise = createNoiseBuffer(ctx, 0.22);
    const state = { ctx, noise };
    stateRef.current = state;
    return state;
  }, []);

  const play = useCallback(
    (intensity: number = 1) => {
      try {
        const { ctx, noise } = ensure();
        const now = ctx.currentTime;

        // Noise source (paper rustle)
        const src = ctx.createBufferSource();
        src.buffer = noise;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.value = 1400;
        bandpass.Q.value = 0.9;

        const highpass = ctx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 500;

        const gain = ctx.createGain();
        const base = 0.055 * intensity * MASTER_GAIN;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(base, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        // Tiny “tick” at the start (fingernail/edge catch)
        const tick = ctx.createOscillator();
        tick.type = "triangle";
        tick.frequency.setValueAtTime(520, now);
        tick.frequency.exponentialRampToValueAtTime(240, now + 0.03);
        const tickGain = ctx.createGain();
        tickGain.gain.setValueAtTime(0.0001, now);
        tickGain.gain.exponentialRampToValueAtTime(
          0.022 * intensity * MASTER_GAIN,
          now + 0.005,
        );
        tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

        src.connect(bandpass);
        bandpass.connect(highpass);
        highpass.connect(gain);
        gain.connect(ctx.destination);

        tick.connect(tickGain);
        tickGain.connect(ctx.destination);

        src.start(now);
        src.stop(now + 0.22);

        tick.start(now);
        tick.stop(now + 0.045);
      } catch {
        // ignore audio errors
      }
    },
    [ensure],
  );

  return { play };
}

