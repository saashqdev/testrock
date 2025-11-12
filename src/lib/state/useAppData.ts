"use client"

import { createContext, useContext } from "react";
import { TenantUserType } from "@/lib/enums/tenants/TenantUserType";
import { TenantDto } from "@/db/models/accounts/TenantsModel";
import { TenantSubscriptionWithDetailsDto } from "@/db/models/subscriptions/TenantSubscriptionsModel";
import { AppOrAdminData } from "./useAppOrAdminData";
import EntitiesSingleton from "@/modules/rows/repositories/EntitiesSingleton";

export type AppLoaderData = AppOrAdminData & {
  currentTenant: TenantDto;
  mySubscription: TenantSubscriptionWithDetailsDto | null;
  currentRole: TenantUserType;
};

export type AppDataDto = AppLoaderData;

export const AppDataContext = createContext<AppDataDto | null>(null);

export default function useAppData(): AppLoaderData | null {
  const context = useContext(AppDataContext);
  
  if (!context) {
    if (typeof window === 'undefined') {
      // During SSR, return a minimal object with default values that match the expected structure
      // This ensures consistent rendering between server and client
      return {
        user: null as any, // Will be populated on client side
        myTenants: [],
        currentTenant: null as any,
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
        mySubscription: null,
        currentRole: 0, // TenantUserType.OWNER
      } as AppLoaderData;
    }
    // Return null instead of throwing an error to allow graceful fallback
    // This allows the hook to be used in components that may not always be within AppDataContext
    return null;
  }
  EntitiesSingleton.getInstance().setEntities(context.entities);
  return context;
}

// Named export for consistency
export { useAppData };
