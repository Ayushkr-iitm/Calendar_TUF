import { HeroSection } from './HeroSection';
import { CalendarGrid } from './CalendarGrid';
import { SpiralBinding } from './SpiralBinding';
import type { NotesStore } from "./NotesPanel";
import type { CalendarRange } from "@/hooks/useRangeSelection";
import { monthImages } from "@/lib/monthImages";
import { useHeroTheme } from "@/hooks/useHeroTheme";
import type React from "react";

interface CalendarPageProps {
  month: number;
  year: number;
  range: CalendarRange;
  hoverDate: Date | null;
  focusedDate: Date;
  disablePast: boolean;
  store: NotesStore;
  setStore: (next: NotesStore | ((prev: NotesStore) => NotesStore)) => void;
  onSelectDate: (day: Date) => void;
  onHoverDate: (day: Date | null) => void;
  onFocusDate: (day: Date) => void;
  onPickRange: (start: Date, end: Date) => void;
}

export const CalendarPage = ({
  month,
  year,
  range,
  hoverDate,
  focusedDate,
  disablePast,
  store,
  setStore,
  onSelectDate,
  onHoverDate,
  onFocusDate,
  onPickRange,
}: CalendarPageProps) => {
  const { vars } = useHeroTheme(monthImages[month]!);

  return (
    <div className="relative flex flex-col items-center">
      {/* Spiral binding at the top */}
      <SpiralBinding />
      
      {/* Calendar paper body */}
      <div
        className="calendar-paper rounded-b-sm w-full -mt-2 sm:-mt-3"
        style={vars as React.CSSProperties}
      >
        <HeroSection month={month} year={year} />
        <CalendarGrid
          month={month}
          year={year}
          range={range}
          hoverDate={hoverDate}
          focusedDate={focusedDate}
          disablePast={disablePast}
          store={store}
          setStore={setStore}
          onSelectDate={onSelectDate}
          onHoverDate={onHoverDate}
          onFocusDate={onFocusDate}
          onPickRange={onPickRange}
        />
      </div>
    </div>
  );
};
