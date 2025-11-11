"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface ThemeProviderProps {
  scheme: string;
}

export default function ThemeProvider({ scheme }: ThemeProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    const htmlElement = document.documentElement;
    const shouldBeDark = ["/app/", "/admin/"].some((p) => pathname.startsWith(p)) 
      ? false 
      : scheme === "dark";
    
    if (shouldBeDark) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
  }, [pathname, scheme]);

  return null;
}