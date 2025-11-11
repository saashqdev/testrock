import { getUserInfo } from "@/lib/services/session.server";
import { db } from "@/db";
import DebugClient from "./DebugClient";

export default async function DebugPage() {
  // Server-side data fetching
  const userInfo = await getUserInfo();
  const user = await db.users.getUser(userInfo.userId);
  
  if (process.env.NODE_ENV !== "development" && !user?.admin) {
    throw new Error("This page is only available in development mode.");
  }

  return <DebugClient />;
}
