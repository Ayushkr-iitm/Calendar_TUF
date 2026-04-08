import { format, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { CalendarRange } from "@/hooks/useRangeSelection";

export type RangeNote = {
  id: string;
  start: string;
  end: string;
  note: string;
  createdAt: number;
  updatedAt: number;
};

export type NotesStore = {
  monthly: Record<string, string>;
  ranges: Record<string, RangeNote>;
};

function monthKey(year: number, month: number) {
  const m = String(month + 1).padStart(2, "0");
  return `${year}-${m}`;
}

function rangeId(start: Date, end: Date) {
  return `${format(start, "yyyy-MM-dd")}..${format(end, "yyyy-MM-dd")}`;
}

export function NotesPanel(props: {
  month: number;
  year: number;
  store: NotesStore;
  setStore: (next: NotesStore | ((prev: NotesStore) => NotesStore)) => void;
  selection: CalendarRange;
  onPickRange: (start: Date, end: Date) => void;
}) {
  const key = useMemo(() => monthKey(props.year, props.month), [props.year, props.month]);
  const monthly = props.store.monthly[key] ?? "";

  const selectedId = useMemo(() => {
    if (!props.selection.start || !props.selection.end) return null;
    return rangeId(props.selection.start, props.selection.end);
  }, [props.selection.start, props.selection.end]);

  const existing = selectedId ? props.store.ranges[selectedId] : null;
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setDraft(existing?.note ?? "");
  }, [existing?.note, selectedId]);

  const saveRange = () => {
    if (!props.selection.start || !props.selection.end) return;
    const now = Date.now();
    const id = rangeId(props.selection.start, props.selection.end);
    props.setStore((prev) => ({
      ...prev,
      ranges: {
        ...prev.ranges,
        [id]: {
          id,
          start: props.selection.start!.toISOString(),
          end: props.selection.end!.toISOString(),
          note: draft.trim(),
          createdAt: prev.ranges[id]?.createdAt ?? now,
          updatedAt: now,
        },
      },
    }));
  };

  const deleteRange = () => {
    if (!existing) return;
    props.setStore((prev) => {
      const next = { ...prev.ranges };
      delete next[existing.id];
      return { ...prev, ranges: next };
    });
  };

  const savedForMonth = useMemo(() => {
    const monthStart = new Date(props.year, props.month, 1);
    const monthEnd = new Date(props.year, props.month + 1, 0, 23, 59, 59);
    const all = Object.values(props.store.ranges);
    return all
      .filter((r) => {
        const s = parseISO(r.start);
        const e = parseISO(r.end);
        return s <= monthEnd && e >= monthStart;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);
  }, [props.month, props.year, props.store.ranges]);

  return (
    <div className="w-[34%] min-w-[260px] pr-4 sm:pr-5 border-r border-paper-foreground/10 flex-shrink-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-lg sm:text-2xl font-body font-semibold text-paper-foreground mb-2 tracking-wide">
          Notes
        </p>
        <span className="text-base sm:text-xl text-paper-foreground/70 font-body font-semibold">
          Local
        </span>
      </div>

      <label className="block text-base sm:text-xl font-body font-semibold tracking-wide text-paper-foreground">
        Monthly
      </label>
      <textarea
        value={monthly}
        onChange={(e) => {
          const v = e.target.value;
          props.setStore((prev) => ({
            ...prev,
            monthly: { ...prev.monthly, [key]: v },
          }));
        }}
        placeholder="A line or two…"
        rows={3}
        className={cn(
          "mt-2 w-full resize-none rounded-sm bg-transparent",
          "border border-paper-foreground/15 px-3 py-2",
          "text-base sm:text-xl leading-snug font-body text-paper-foreground",
          "placeholder:text-paper-foreground/45 outline-none",
          "focus:border-paper-foreground/30 focus:ring-2 focus:ring-calendar-selected/30",
        )}
      />

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <label className="text-base sm:text-xl font-body font-semibold tracking-wide text-paper-foreground">
            Selected range
          </label>
          <span className="text-base sm:text-xl text-paper-foreground/75 font-body font-semibold">
            {props.selection.start
              ? props.selection.end
                ? `${format(props.selection.start, "MMM d")}–${format(props.selection.end, "MMM d")}`
                : `${format(props.selection.start, "MMM d")}…`
              : "—"}
          </span>
        </div>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Attach a note to the selected range…"
          rows={4}
          disabled={!props.selection.start || !props.selection.end}
          className={cn(
            "mt-2 w-full resize-none rounded-sm bg-white/40",
            "border border-paper-foreground/15 px-3 py-2",
            "text-base sm:text-xl leading-snug font-body text-paper-foreground",
            "placeholder:text-paper-foreground/45 outline-none",
            "focus:border-paper-foreground/30 focus:ring-2 focus:ring-calendar-selected/30",
            (!props.selection.start || !props.selection.end) && "opacity-50",
          )}
        />

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={saveRange}
            disabled={!props.selection.start || !props.selection.end}
            className={cn(
              "h-10 px-4 rounded-sm text-base sm:text-xl font-body font-semibold tracking-wide",
              "bg-calendar-selected text-white shadow-sm",
              "hover:brightness-[0.98] disabled:opacity-50",
            )}
          >
            {existing ? "Update" : "Save"}
          </button>
          {existing && (
            <button
              type="button"
              onClick={deleteRange}
              className="h-10 px-4 rounded-sm text-base sm:text-xl font-body font-semibold tracking-wide border border-paper-foreground/15 text-paper-foreground hover:bg-black/5"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-base sm:text-xl font-body font-semibold tracking-wide text-paper-foreground">
            Recent
          </span>
          <span className="text-base sm:text-xl text-paper-foreground/70 font-body font-semibold">
            {savedForMonth.length}
          </span>
        </div>
        <div className="mt-2 space-y-2">
          {savedForMonth.length === 0 ? (
            <div className="text-base sm:text-xl font-body text-paper-foreground/70">
              Select a range, then save a note.
            </div>
          ) : (
            savedForMonth.map((r) => {
              const s = parseISO(r.start);
              const e = parseISO(r.end);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => props.onPickRange(s, e)}
                  className="w-full text-left rounded-sm border border-paper-foreground/15 bg-white/30 px-3 py-2 hover:bg-white/40 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-base sm:text-xl font-body font-semibold text-paper-foreground">
                      {format(s, "MMM d")}–{format(e, "MMM d")}
                    </div>
                    <div className="text-base sm:text-xl font-body text-paper-foreground/70">
                      {format(r.updatedAt, "MMM d")}
                    </div>
                  </div>
                  <div className="mt-1 line-clamp-2 text-base sm:text-xl font-body text-paper-foreground/80">
                    {r.note || "—"}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

