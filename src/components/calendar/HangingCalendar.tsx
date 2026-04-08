import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarPage } from './CalendarPage';
import { DustParticles } from './DustParticles';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { startOfDay } from "date-fns";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useRangeSelection } from "@/hooks/useRangeSelection";
import type { NotesStore } from "./NotesPanel";
import { monthImages } from "@/lib/monthImages";
import { useHeroTheme } from "@/hooks/useHeroTheme";
import type React from "react";
import { WallCanvas } from "./WallCanvas";
import { usePageFlipAudio } from "@/hooks/usePageFlipAudio";

export const HangingCalendar = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [direction, setDirection] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [disablePast, setDisablePast] = useLocalStorageState<boolean>(
    "cinematic-calendar:disablePast:v1",
    true,
  );

  const rangeSel = useRangeSelection();
  const [focusedDate, setFocusedDate] = useState<Date>(() => startOfDay(now));
  const [notes, setNotes] = useLocalStorageState<NotesStore>("cinematic-calendar:notes:v1", {
    monthly: {},
    ranges: {},
  });

  const { vars: roomVars } = useHeroTheme(monthImages[month]!);
  const flipSound = usePageFlipAudio();

  const goNext = useCallback(() => {
    flipSound.play(1);
    setDirection(1);
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }, [flipSound, month]);

  const goPrev = useCallback(() => {
    flipSound.play(1);
    setDirection(-1);
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }, [flipSound, month]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen wall-texture flex items-start justify-center overflow-auto"
      onMouseMove={handleMouseMove}
      style={{ perspective: '1200px', ...(roomVars as React.CSSProperties) }}
    >
      <WallCanvas />
      <DustParticles />

      {/* Side controls (far edges, vertically centered) */}
      <button
        type="button"
        onClick={() => setDisablePast(!disablePast)}
        className="fixed left-4 sm:left-8 top-1/2 z-40 -translate-y-1/2
          h-12 sm:h-14 px-5 sm:px-6 rounded-full
          bg-[hsl(var(--calendar-selected))] text-white
          shadow-[0_22px_60px_rgba(0,0,0,0.40)]
          hover:brightness-[0.98] active:brightness-[0.95]
          transition backdrop-blur
          text-base sm:text-lg font-body font-semibold tracking-wide"
        aria-pressed={disablePast}
      >
        Past: {disablePast ? "Locked" : "Open"}
      </button>

      <button
        type="button"
        onClick={rangeSel.reset}
        className="fixed right-4 sm:right-8 top-1/2 z-40 -translate-y-1/2
          h-12 sm:h-14 px-5 sm:px-6 rounded-full
          bg-white/90 text-black
          border border-black/10
          shadow-[0_22px_60px_rgba(0,0,0,0.34)]
          hover:bg-white active:bg-white/80
          transition backdrop-blur
          text-base sm:text-lg font-body font-semibold tracking-wide
          disabled:opacity-50"
        disabled={!rangeSel.range.start}
      >
        Clear
      </button>

      <div
        className="absolute pointer-events-none"
        style={{
          width: '700px',
          height: '700px',
          top: '-120px',
          left: '50%',
          transform: `translateX(-50%) translateX(${mousePos.x * 20}px)`,
          background: 'radial-gradient(ellipse, hsl(var(--spotlight-color) / 0.24) 0%, transparent 70%)',
          transition: 'transform 0.3s ease-out',
        }}
      />

      <div className="relative z-10 mt-4 sm:mt-6 flex flex-col items-center pb-8">
        <div
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
          style={{
            background: 'linear-gradient(135deg, hsl(30 10% 50%) 0%, hsl(30 8% 30%) 100%)',
            boxShadow: '0 2px 6px hsl(220 20% 5% / 0.6)',
          }}
        />
        <div className="w-px h-4 sm:h-6 bg-black/25" />

        <motion.div
          className="calendar-swing relative"
          style={{
            transformStyle: 'preserve-3d',
            rotateY: mousePos.x * 1.2,
            rotateX: mousePos.y * -0.4,
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 30 }}
        >
          <button
            onClick={goPrev}
            className="absolute left-0 top-1/2 -translate-x-10 sm:-translate-x-14 -translate-y-1/2 z-20
              w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/70 backdrop-blur
              flex items-center justify-center text-black/65
              hover:bg-white/85 hover:text-black transition-all duration-200
              shadow-lg"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-0 top-1/2 translate-x-10 sm:translate-x-14 -translate-y-1/2 z-20
              w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/70 backdrop-blur
              flex items-center justify-center text-black/65
              hover:bg-white/85 hover:text-black transition-all duration-200
              shadow-lg"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div
            className="relative w-[460px] sm:w-[620px] md:w-[760px] lg:w-[860px]"
            style={{ perspective: '1200px' }}
          >
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div
                key={`${year}-${month}`}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                variants={{
                  enter: (d: number) => ({
                    rotateX: d > 0 ? -98 : 98,
                    rotateZ: d > 0 ? 1.2 : -1.2,
                    y: d > 0 ? 18 : -18,
                    opacity: 0,
                    scale: 0.935,
                    z: -150,
                    filter: 'brightness(0.5)',
                    transformOrigin: d > 0 ? 'bottom center' : 'top center',
                  }),
                  center: {
                    rotateX: 0,
                    rotateZ: 0,
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    z: 0,
                    filter: 'brightness(1)',
                    transformOrigin: 'top center',
                  },
                  exit: (d: number) => ({
                    rotateX: d > 0 ? 102 : -102,
                    rotateZ: d > 0 ? -1.0 : 1.0,
                    y: d > 0 ? -22 : 22,
                    opacity: 0,
                    scale: 0.93,
                    z: -150,
                    filter: 'brightness(0.3)',
                    transformOrigin: d > 0 ? 'top center' : 'bottom center',
                  }),
                }}
                transition={{
                  duration: 1.7,
                  ease: [0.12, 0.92, 0.18, 1],
                  opacity: { duration: 0.7 },
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
              >
                <div className="pointer-events-none absolute inset-0 rounded-b-sm" style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.10), transparent 32%, transparent 78%, rgba(0,0,0,0.14))",
                }} />
                <CalendarPage
                  month={month}
                  year={year}
                  range={rangeSel.range}
                  hoverDate={rangeSel.hovered}
                  focusedDate={focusedDate}
                  disablePast={disablePast}
                  store={notes}
                  setStore={setNotes}
                  onSelectDate={(d) => {
                    const day = startOfDay(d);
                    setFocusedDate(day);
                    rangeSel.clickDate(day);
                  }}
                  onHoverDate={(d) => rangeSel.hoverDate(d)}
                  onFocusDate={(d) => setFocusedDate(startOfDay(d))}
                  onPickRange={(s, e) => {
                    rangeSel.setFromExternal(s, e);
                    setFocusedDate(startOfDay(s));
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
