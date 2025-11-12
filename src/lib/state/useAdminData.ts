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
    if (typeof window === 'undefined') {
      // During SSR, return a minimal object with default values that match the expected structure
      // This ensures consistent rendering between server and client
      return {
        user: null as any, // Will be populated on client side
        myTenants: [],
        currentTenant: null,
        allRoles: [],
        roles: [],
        permissions: [],
        entities: [],
        entityGroups: [],
        isSuperUser: false,
        isSuperAdmin: false,
        myGroups: [],
        onboardingSession: null,
        tenantTypes: [],
      } as AppOrAdminData;
    }
    // Return null instead of throwing an error to allow graceful fallback
    return null;
  }
  EntitiesSingleton.getInstance().setEntities(context.entities);
  return context;
}

// Named export for consistency
export { useAdminData };
