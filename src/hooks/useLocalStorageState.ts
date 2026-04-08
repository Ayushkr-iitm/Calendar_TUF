import { useEffect, useMemo, useState } from "react";

export function useLocalStorageState<T>(key: string, initial: T | (() => T)) {
  const initialValue = useMemo(() => {
    return typeof initial === "function" ? (initial as () => T)() : initial;
  }, [initial]);

  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return initialValue;
      return JSON.parse(raw) as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota / privacy errors; state still works in-memory.
    }
  }, [key, value]);

  return [value, setValue] as const;
}

