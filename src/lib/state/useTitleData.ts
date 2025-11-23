"use client";

import { createContext, useContext } from "react";

export type TitleLoaderData = {
  title: string;
};

export type TitleDataDto = TitleLoaderData;

export const TitleDataContext = createContext<TitleDataDto | null>(null);

export function useTitleData(): string {
  const context = useContext(TitleDataContext);

  if (typeof window === "undefined") {
    return "";
  }

  if (!context) {
    return "";
  }
  try {
    if (!context.title) {
      return "";
    }
    return context.title.split("|")[0].trim() ?? "";
  } catch {
    return "";
  }
}

// Default export for consistency
export default useTitleData;

export function loadTitleData(title: string): TitleLoaderData {
  return { title };
}
