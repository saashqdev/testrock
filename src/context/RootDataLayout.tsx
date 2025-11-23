"use client";

import { RootDataContext, RootDataDto } from "../lib/state/useRootData";
import ScriptCrisp from "@/modules/shared/scripts/ScriptCrisp";
import ScriptAnalytics from "@/modules/shared/scripts/ScriptAnalytics";
import ScriptRewardful from "@/modules/shared/scripts/ScriptRewardful";
import AdminAnalyticsTracker from "@/components/analytics/AdminAnalyticsTracker";
import { Toaster as ReactHostToaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import ScriptInjector from "@/modules/shared/scripts/ScriptInjector";
import ThemeProvider from "@/components/ThemeProvider";

export default function RootDataLayout({
  children,
  rootData,
  scheme,
  theme,
}: {
  children: React.ReactNode;
  rootData: RootDataDto;
  scheme: string;
  theme: string;
}) {
  return (
    <RootDataContext.Provider value={rootData}>
      <ThemeProvider scheme={scheme} theme={theme} />
      {children}
      <ScriptCrisp />
      <ScriptAnalytics />
      <AdminAnalyticsTracker />
      <ScriptRewardful />
      <ReactHostToaster />
      <SonnerToaster />
      <ScriptInjector scripts={rootData.appConfiguration?.scripts} />
    </RootDataContext.Provider>
  );
}
