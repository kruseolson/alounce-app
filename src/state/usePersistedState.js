import { useEffect, useRef, useState } from "react";

export function usePersistedState(key, version, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== version) return defaultValue;
      return { ...defaultValue, ...parsed };
    } catch (_) {
      return defaultValue;
    }
  });

  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify({ ...state, version }));
    } catch (_) {
      // quota exceeded or blocked — fail silently
    }
  }, [key, version, state]);

  return [state, setState];
}
