"use client"

import { Tenant, TenantUser } from "@prisma/client";
import { createContext, useContext } from "react";

export type AdminTenantLoaderData = {
  title: string;
  tenant: (Tenant & { users: TenantUser[] }) | null;
};

export type AdminTenantDataDto = AdminTenantLoaderData;

export const AdminTenantDataContext = createContext<AdminTenantDataDto | null>(null);

export default function useAdminTenantData(): AdminTenantLoaderData {
  const context = useContext(AdminTenantDataContext);
  
  if (typeof window === 'undefined') {
    throw new Error("useAdminTenantData cannot be used during SSR");
  }
  
  if (!context) {
    throw new Error("useAdminTenantData must be used within an AdminTenantDataContext.Provider");
  }
  return context;
}

// Named export for consistency
export { useAdminTenantData };
