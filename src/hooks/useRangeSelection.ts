import { useCallback, useMemo, useState } from "react";
import { isBefore, isSameDay, startOfDay } from "date-fns";

export type CalendarRange = {
  start: Date | null;
  end: Date | null;
};

function normalize(start: Date, end: Date) {
  return isBefore(end, start) ? { start: end, end: start } : { start, end };
}

export function useRangeSelection() {
  const [range, setRange] = useState<CalendarRange>({ start: null, end: null });
  const [hovered, setHovered] = useState<Date | null>(null);

  const isSelecting = Boolean(range.start && !range.end);

  const committed = useMemo(() => {
    if (!range.start) return null;
    if (range.start && range.end) return normalize(range.start, range.end);
    return null;
  }, [range.start, range.end]);

  const preview = useMemo(() => {
    if (!range.start) return null;
    if (committed) return committed;
    if (hovered) return normalize(range.start, hovered);
    return null;
  }, [range.start, committed, hovered]);

  const clickDate = useCallback((d: Date) => {
    const day = startOfDay(d);
    setHovered(null);
    setRange((curr) => {
      if (!curr.start || curr.end) return { start: day, end: null };
      if (isSameDay(curr.start, day)) return { start: day, end: day };
      const normalized = normalize(curr.start, day);
      return { start: normalized.start, end: normalized.end };
    });
  }, []);

  const hoverDate = useCallback(
    (d: Date | null) => {
      if (!isSelecting) return;
      setHovered(d ? startOfDay(d) : null);
    },
    [isSelecting],
  );

  const reset = useCallback(() => {
    setRange({ start: null, end: null });
    setHovered(null);
  }, []);

  const setFromExternal = useCallback((start: Date, end: Date) => {
    const a = startOfDay(start);
    const b = startOfDay(end);
    const normalized = normalize(a, b);
    setRange({ start: normalized.start, end: normalized.end });
    setHovered(null);
  }, []);

  const isInPreview = useCallback(
    (d: Date) => {
      if (!preview) return false;
      return d >= preview.start && d <= preview.end;
    },
    [preview],
  );

  const isStart = useCallback(
    (d: Date) => (range.start ? isSameDay(d, range.start) : false),
    [range.start],
  );
  const isEnd = useCallback(
    (d: Date) => (range.end ? isSameDay(d, range.end) : false),
    [range.end],
  );

  return {
    range,
    hovered,
    committed,
    preview,
    isSelecting,
    clickDate,
    hoverDate,
    reset,
    setFromExternal,
    isInPreview,
    isStart,
    isEnd,
  };
}

