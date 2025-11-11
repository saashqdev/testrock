"use client";

import { RootDataContext, RootDataDto } from "../lib/state/useRootData";
import ScriptCrisp from "@/modules/shared/scripts/ScriptCrisp";
import ScriptAnalytics from "@/modules/shared/scripts/ScriptAnalytics";
import ScriptRewardful from "@/modules/shared/scripts/ScriptRewardful";
import { Toaster as ReactHostToaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import ScriptInjector from "@/modules/shared/scripts/ScriptInjector";
import ThemeProvider from "@/components/ThemeProvider";

export default function RootDataLayout({ children, rootData, scheme }: { children: React.ReactNode; rootData: RootDataDto; scheme: string }) {
  return (
    <RootDataContext.Provider value={rootData}>
      <ThemeProvider scheme={scheme} />
      {children}
      <ScriptCrisp />
      <ScriptAnalytics />
      <ScriptRewardful />
      <ReactHostToaster />
      <SonnerToaster />
      <ScriptInjector scripts={rootData.appConfiguration?.scripts} />
    </RootDataContext.Provider>
  );
}
