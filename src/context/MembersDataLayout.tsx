"use client";

import { MembersDataContext, MembersDataDto } from "@/lib/state/useMembersData";

export default function MembersDataLayout({ children, data }: { children: React.ReactNode; data: MembersDataDto }) {
  return <MembersDataContext.Provider value={data}>{children}</MembersDataContext.Provider>;
}