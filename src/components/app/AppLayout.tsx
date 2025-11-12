"use client";

import { ReactNode } from "react";
import SidebarLayout from "../layouts/SidebarLayout";
import CommandPalette from "../ui/commandPalettes/CommandPalette";
import NewSidebarLayout from "../layouts/NewSidebarLayout";
import ShadcnSidebarLayout from "../layouts/sidebars/shadcn/ShadcnSidebarLayout";

interface Props {
  layout: "app" | "admin" | "docs";
  children: ReactNode;
  type?: "v1" | "v2" | "v3";
}

export default function AppLayout({ layout, children, type = "v3" }: Props) {
  return (
    <div>
      <CommandPalette key={layout} layout={layout}>
        {type === "v1" && <SidebarLayout layout={layout}>{children}</SidebarLayout>}
        {type === "v2" && <NewSidebarLayout layout={layout}>{children}</NewSidebarLayout>}
        {type === "v3" && <ShadcnSidebarLayout layout={layout}>{children}</ShadcnSidebarLayout>}
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
