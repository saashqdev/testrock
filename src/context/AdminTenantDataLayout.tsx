"use client";

import { AdminTenantDataContext, AdminTenantDataDto } from "@/lib/state/useAdminTenantData";

export default function AdminTenantDataLayout({ children, data }: { children: React.ReactNode; data: AdminTenantDataDto }) {
  return <AdminTenantDataContext.Provider value={data}>{children}</AdminTenantDataContext.Provider>;
}
