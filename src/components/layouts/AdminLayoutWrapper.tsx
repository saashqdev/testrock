"use client";

import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/app/AppLayout";

interface Props {
  children: React.ReactNode;
}

export default function AdminLayoutWrapper({ children }: Props) {
  const searchParams = useSearchParams();
  const sidebarParam = searchParams?.get("sidebar");
  
  let sidebarType: "v1" | "v2" | "v3" = "v3";
  
  if (sidebarParam === "v1") {
    sidebarType = "v1";
  } else if (sidebarParam === "v2") {
    sidebarType = "v2";
  } else if (sidebarParam === "v3") {
    sidebarType = "v3";
  }
  
  return <AppLayout layout="admin" type={sidebarType}>{children}</AppLayout>;
}
