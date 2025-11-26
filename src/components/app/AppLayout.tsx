"use client";

import { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import SidebarLayout from "../layouts/SidebarLayout";
import CommandPalette from "../ui/commandPalettes/CommandPalette";
import NewSidebarLayout from "../layouts/NewSidebarLayout";
import ShadcnSidebarLayout from "../layouts/sidebars/shadcn/ShadcnSidebarLayout";

interface Props {
  layout: "app" | "admin" | "docs";
  children: ReactNode;
  type?: "v1" | "v2" | "v3";
}

export default function AppLayout({ layout, children, type }: Props) {
  const searchParams = useSearchParams();
  const sidebarParam = searchParams?.get("sidebar");
  
  let sidebarType: "v1" | "v2" | "v3" = type || "v3";
  
  if (sidebarParam === "v1") {
    sidebarType = "v1";
  } else if (sidebarParam === "v2") {
    sidebarType = "v2";
  } else if (sidebarParam === "v3") {
    sidebarType = "v3";
  }

  return (
    <div>
      <CommandPalette key={layout} layout={layout}>
        {sidebarType === "v1" && <SidebarLayout layout={layout}>{children}</SidebarLayout>}
        {sidebarType === "v2" && <NewSidebarLayout layout={layout}>{children}</NewSidebarLayout>}
        {sidebarType === "v3" && <ShadcnSidebarLayout layout={layout}>{children}</ShadcnSidebarLayout>}
      </CommandPalette>
      {/* {layout === "app" ? (
        <AppCommandPalette isOpen={showCommandPalette} onClosed={() => setShowCommandPalette(false)} />
      ) : layout === "admin" ? (
        <AdminCommandPalette isOpen={showCommandPalette} onClosed={() => setShowCommandPalette(false)} />
      ) : layout === "docs" && commands ? (
        <CommandPalette isOpen={showCommandPalette} onClosed={() => setShowCommandPalette(false)} commands={commands} />
      ) : (
        <div></div>
      )} */}
    </div>
  );
}
