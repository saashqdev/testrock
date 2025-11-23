"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface ThemeProviderProps {
  scheme: string;
  theme: string;
}

export default function ThemeProvider({ scheme, theme }: ThemeProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    const htmlElement = document.documentElement;
    const shouldBeDark = scheme === "dark";
    const isDark = htmlElement.classList.contains("dark");

    // Only update if there's a mismatch
    if (shouldBeDark && !isDark) {
      htmlElement.classList.add("dark");
    } else if (!shouldBeDark && isDark) {
      htmlElement.classList.remove("dark");
    }

    // Handle theme classes
    const currentThemeClass = `theme-${theme}`;
    const themeClasses = Array.from(htmlElement.classList).filter((cls) => cls.startsWith("theme-"));

    // Only update if the theme class is different
    if (!themeClasses.includes(currentThemeClass)) {
      themeClasses.forEach((cls) => htmlElement.classList.remove(cls));
      if (theme) {
        htmlElement.classList.add(currentThemeClass);
      }
    }
  }, [pathname, scheme, theme]);

  return null;
}
