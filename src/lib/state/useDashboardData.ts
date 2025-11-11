"use client"

import { createContext, useContext } from "react";

export type DashboardLoaderData = {
  users: number;
};

export type DashboardDataDto = DashboardLoaderData;

export const DashboardDataContext = createContext<DashboardDataDto | null>(null);

export default function useDashboardData(): DashboardLoaderData {
  const context = useContext(DashboardDataContext);
  
  if (typeof window === 'undefined') {
    throw new Error("useDashboardData cannot be used during SSR");
  }
  
  if (!context) {
    throw new Error("useDashboardData must be used within a DashboardDataContext.Provider");
  }
  return context;
}

// Named export for consistency
export { useDashboardData };

