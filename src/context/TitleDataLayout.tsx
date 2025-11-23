"use client";

import { TitleDataContext, TitleDataDto } from "@/lib/state/useTitleData";

export default function TitleDataLayout({ children, data }: { children: React.ReactNode; data: TitleDataDto }) {
  return <TitleDataContext.Provider value={data}>{children}</TitleDataContext.Provider>;
}
