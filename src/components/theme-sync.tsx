import { useEffect } from "react";

import { useAppState } from "@/lib/store";

/**
 * Applies the saved theme preference to <html> so the whole app follows it.
 * "system" tracks the OS colour-scheme live.
 */
export function ThemeSync() {
  const theme = useAppState((s) => s.settings.theme);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      root.classList.toggle("dark", dark);
    };
    apply();
    if (theme === "system") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [theme]);

  return null;
}
