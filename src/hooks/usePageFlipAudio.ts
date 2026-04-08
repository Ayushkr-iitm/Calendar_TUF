import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFlipSound } from "@/hooks/useFlipSound";

type State = {
  audio: HTMLAudioElement | null;
  canPlay: boolean;
};

/**
 * Plays a real recorded page flip if the asset exists at:
 *   /sounds/page-flip-47177.mp3
 *
 * Falls back to a synthesized flip if the asset can't be loaded.
 */
export function usePageFlipAudio() {
  const fallback = useFlipSound();
  const ref = useRef<State>({ audio: null, canPlay: false });

  const src = useMemo(() => "/sounds/page-flip-47177.mp3", []);

  useEffect(() => {
    const a = new Audio(src);
    a.preload = "auto";
    a.volume = 0.9;
    ref.current.audio = a;

    const onCanPlay = () => {
      ref.current.canPlay = true;
    };
    const onError = () => {
      ref.current.canPlay = false;
    };

    a.addEventListener("canplaythrough", onCanPlay);
    a.addEventListener("error", onError);
    // Trigger load
    a.load();

    return () => {
      a.pause();
      a.src = "";
      a.removeEventListener("canplaythrough", onCanPlay);
      a.removeEventListener("error", onError);
    };
  }, [src]);

  const play = useCallback(
    async (volumeBoost: number = 1) => {
      const st = ref.current;
      const a = st.audio;
      if (!a || !st.canPlay) {
        fallback.play(volumeBoost);
        return;
      }

      try {
        // Restart from the beginning for rapid flips
        a.currentTime = 0;
        a.volume = Math.min(1, 0.95 * volumeBoost);
        await a.play();
      } catch {
        fallback.play(volumeBoost);
      }
    },
    [fallback],
  );

  return { play, src };
}

