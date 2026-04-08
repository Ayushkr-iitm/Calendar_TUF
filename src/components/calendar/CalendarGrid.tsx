import { useCallback, useMemo } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday,
  isSameDay, isWithinInterval, isBefore, startOfDay,
} from 'date-fns';
import { NotesPanel, type NotesStore } from "./NotesPanel";
import type { CalendarRange } from "@/hooks/useRangeSelection";

interface CalendarGridProps {
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

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const CalendarGrid = ({
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
}: CalendarGridProps) => {
  const currentDate = useMemo(() => new Date(year, month, 1), [month, year]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentDate]);

  const isInRange = useCallback((day: Date) => {
    const end = range.end || hoverDate;
    if (!range.start || !end) return false;
    const start = isBefore(end, range.start) ? end : range.start;
    const finish = isBefore(end, range.start) ? range.start : end;
    return isWithinInterval(day, { start, end: finish });
  }, [range.start, range.end, hoverDate]);

  const isDisabled = useCallback(
    (day: Date) => {
      if (!disablePast) return false;
      const today = startOfDay(new Date());
      return isBefore(startOfDay(day), today);
    },
    [disablePast],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const k = e.key;
      if (
        k !== "ArrowLeft" &&
        k !== "ArrowRight" &&
        k !== "ArrowUp" &&
        k !== "ArrowDown" &&
        k !== "Enter" &&
        k !== " " &&
        k !== "Escape"
      ) {
        return;
      }
      e.preventDefault();

      if (k === "Escape") {
        onHoverDate(null);
        return;
      }

      const move = (delta: number) => {
        const next = new Date(focusedDate);
        next.setDate(next.getDate() + delta);
        onFocusDate(next);
      };

      if (k === "ArrowLeft") move(-1);
      if (k === "ArrowRight") move(1);
      if (k === "ArrowUp") move(-7);
      if (k === "ArrowDown") move(7);

      if (k === "Enter" || k === " ") {
        if (!isDisabled(focusedDate)) onSelectDate(focusedDate);
      }
    },
    [focusedDate, isDisabled, onFocusDate, onHoverDate, onSelectDate],
  );

  return (
    <div className="flex flex-row gap-0 px-3 sm:px-5 pb-4 sm:pb-6 pt-3 sm:pt-4">
      {/* Notes section */}
      <NotesPanel
        month={month}
        year={year}
        store={store}
        setStore={setStore}
        selection={range}
        onPickRange={onPickRange}
      />

      {/* Calendar grid */}
      <div className="flex-1 pl-3 sm:pl-4">
        <div
          role="grid"
          tabIndex={0}
          aria-label={`Calendar grid for ${format(currentDate, "MMMM yyyy")}`}
          onKeyDown={handleKeyDown}
          onMouseLeave={() => onHoverDate(null)}
          className="outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-calendar-selected/40"
        >
          <div className="grid grid-cols-7 gap-0">
            {DAYS.map((d) => (
              <div
                key={d}
                role="columnheader"
                className={`text-center text-[15px] sm:text-[18px] md:text-[19px] font-bold pb-3 sm:pb-4 tracking-[0.18em] font-body ${
                  d === 'SAT' || d === 'SUN' ? 'text-[hsl(205,80%,55%)]' : 'text-paper-foreground/70'
                }`}
              >
                {d}
              </div>
            ))}

            {days.map((day) => {
              const inMonth = isSameMonth(day, currentDate);
              const today = isToday(day);
              const isStart = range.start && isSameDay(day, range.start);
              const isEnd = range.end && isSameDay(day, range.end);
              const inRange = isInRange(day);
              const dayOfWeek = day.getDay();
              const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;
              const disabled = isDisabled(day);
              const focused = isSameDay(day, focusedDate);

              return (
                <div
                  key={day.toISOString()}
                  className={`
                    relative flex items-center justify-center
                    h-11 sm:h-14 md:h-16 text-xl sm:text-2xl cursor-pointer
                    transition-all duration-150 select-none
                    ${!inMonth ? 'opacity-20' : ''}
                    ${disabled ? 'opacity-35 cursor-not-allowed' : ''}
                    ${inRange && !isStart && !isEnd ? 'bg-calendar-range' : ''}
                    ${isStart ? 'bg-calendar-selected rounded-l-sm text-white' : ''}
                    ${isEnd ? 'bg-calendar-selected rounded-r-sm text-white' : ''}
                  `}
                  role="gridcell"
                  aria-selected={inRange}
                  onFocus={() => onFocusDate(day)}
                  onClick={() => inMonth && !disabled && onSelectDate(day)}
                  onMouseEnter={() => inMonth && !disabled && onHoverDate(day)}
                  onMouseLeave={() => onHoverDate(null)}
                >
                  <span
                    className={`
                      relative z-10 flex items-center justify-center
                      w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full text-[18px] sm:text-[22px] md:text-[24px]
                      transition-all duration-150 font-body
                      ${today ? 'bg-calendar-today text-white font-bold' : ''}
                      ${isWeekend && inMonth && !today && !isStart && !isEnd ? 'text-[hsl(205,80%,55%)] font-semibold' : ''}
                      ${inMonth && !today && !isStart && !isEnd ? 'hover:bg-calendar-hover' : ''}
                      ${isStart || isEnd ? 'font-bold' : ''}
                      ${focused ? 'ring-2 ring-calendar-selected/45 ring-offset-0' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
