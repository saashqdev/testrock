"use client"

import { createContext, useContext, useEffect, useRef } from "react";
import { TenantUserType } from "@/lib/enums/tenants/TenantUserType";
import { TenantDto } from "@/db/models/accounts/TenantsModel";
import { TenantSubscriptionWithDetailsDto } from "@/db/models/subscriptions/TenantSubscriptionsModel";
import { AppOrAdminData } from "./useAppOrAdminData";
import EntitiesSingleton from "@/modules/rows/repositories/EntitiesSingleton";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

export type AppLoaderData = AppOrAdminData & {
  currentTenant: TenantDto;
  mySubscription: TenantSubscriptionWithDetailsDto | null;
  currentRole: TenantUserType;
};

export type AppDataDto = AppLoaderData;

export const AppDataContext = createContext<AppDataDto | null>(null);

export default function useAppData(): AppLoaderData | null {
  const context = useContext(AppDataContext);
  
  // Only set entities singleton when context.entities actually changes
  const entitiesRef = useRef<EntityWithDetailsDto[] | null>(null);
  
  useEffect(() => {
    if (context?.entities && context.entities !== entitiesRef.current) {
      entitiesRef.current = context.entities;
      EntitiesSingleton.getInstance().setEntities(context.entities);
    }
  }, [context?.entities]);
  
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
  return context;
}

// Named export for consistency
export { useAppData };
