"use client";

import { AdminDataContext, AdminDataDto } from "@/lib/state/useAdminData";
import { useEffect, useMemo } from "react";

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

  // Memoize the context value to prevent unnecessary re-renders of consumers
  // This ensures that even if AdminDataLayout re-renders, the context value
  // remains stable as long as the actual data hasn't changed
  const contextValue = useMemo(
    () => data,
    [
      data.user.id,
      data.isSuperAdmin,
      data.entities.length,
      data.permissions.length,
      // Only depend on primitive values or counts, not full objects/arrays
    ]
  );

  return (
    <AdminDataContext.Provider value={contextValue}>
      <div suppressHydrationWarning>{children}</div>
    </AdminDataContext.Provider>
  );
}
