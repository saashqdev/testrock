"use client";

import { AdminDataContext, AdminDataDto } from "@/lib/state/useAdminData";
import { useEffect } from "react";

export default function AdminDataLayout({ children, data }: { children: React.ReactNode; data: AdminDataDto }) {
  useEffect(() => {
    try {
      // @ts-ignore
      if (typeof window !== "undefined" && window.$crisp) {
        // @ts-ignore
        $crisp.push(["do", "chat:hide"]);
      }
    } catch {
      // ignore
    }
  }, []);
  
  return (
    <AdminDataContext.Provider value={data}>
      <div suppressHydrationWarning>{children}</div>
    </AdminDataContext.Provider>
  );
}
