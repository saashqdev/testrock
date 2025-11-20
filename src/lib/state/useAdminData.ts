"use client"

import { createContext, useContext } from "react";
import { AppOrAdminData } from "./useAppOrAdminData";
import EntitiesSingleton from "@/modules/rows/repositories/EntitiesSingleton";

export type AdminLoaderData = AppOrAdminData;

export type AdminDataDto = AdminLoaderData;

export const AdminDataContext = createContext<AdminDataDto | null>(null);

export default function useAdminData(): AppOrAdminData | null {
  const context = useContext(AdminDataContext);
  
  if (!context) {
    // Return null instead of throwing an error to allow graceful fallback
    // During SSR, components should handle null gracefully and wait for client-side hydration
    return null;
  }
  EntitiesSingleton.getInstance().setEntities(context.entities);
  return context;
}

// Named export for consistency
export { useAdminData };
