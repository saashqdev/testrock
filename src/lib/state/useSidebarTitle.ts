"use client";

import { createContext, useContext } from "react";

export type SidebarTitleContextType = {
  activeTitle: string;
  activeParentTitle: string;
  setActiveTitle: (title: string, parentTitle?: string) => void;
};

export const SidebarTitleContext = createContext<SidebarTitleContextType | null>(null);

export function useSidebarTitle() {
  const context = useContext(SidebarTitleContext);
  
  if (!context) {
    return {
      activeTitle: "",
      activeParentTitle: "",
      setActiveTitle: () => {},
    };
  }
  
  return context;
}

export default useSidebarTitle;
