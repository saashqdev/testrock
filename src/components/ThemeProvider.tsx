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
    
    if (shouldBeDark) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }

    // Remove all existing theme classes
    const themeClasses = Array.from(htmlElement.classList).filter((cls) => cls.startsWith("theme-"));
    themeClasses.forEach((cls) => htmlElement.classList.remove(cls));

    // Add the new theme class
    if (theme) {
      htmlElement.classList.add(`theme-${theme}`);
    }
  }, [pathname, scheme, theme]);

  return null;
}