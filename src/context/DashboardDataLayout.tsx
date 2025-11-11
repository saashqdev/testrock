"use client";

import { DashboardDataContext, DashboardDataDto } from "@/lib/state/useDashboardData";

export default function DashboardDataLayout({ children, data }: { children: React.ReactNode; data: DashboardDataDto }) {
  return <DashboardDataContext.Provider value={data}>{children}</DashboardDataContext.Provider>;
}