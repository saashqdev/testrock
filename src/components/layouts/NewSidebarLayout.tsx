"use client";

import { Fragment, ReactNode, useEffect } from "react";
import { useParams } from "next/navigation";
import { useKBar } from "kbar";
import NewSidebarMenu from "./NewSidebarMenu";

interface Props {
  layout: "app" | "admin" | "docs";
  children: ReactNode;
  className?: string;
}

export default function NewSidebarLayout({ layout, children }: Props) {
  const { query } = useKBar();
  const params = useParams();
  const sidebarKey = Array.isArray(params?.tenant) ? params.tenant.join("-") : params?.tenant;

  useEffect(() => {
    try {
      // @ts-ignore
      $crisp?.push(["do", "chat:hide"]);
    } catch (e) {
      // ignore
    }
  }, []);

  function onOpenCommandPalette() {
    query.toggle();
  }

  return (
      <NewSidebarMenu key={sidebarKey} layout={layout} onOpenCommandPalette={onOpenCommandPalette}>
        {children}
      </NewSidebarMenu>
  );
}
