"use server";

import { getUserInfo } from "@/lib/services/session.server";
import { createUserSession } from "@/lib/services/session.server";

export async function toggleTheme(formData: FormData) {
  const redirectTo = formData.get("redirect") as string;
  const userInfo = await getUserInfo();
  userInfo.scheme = userInfo.scheme === "light" ? "dark" : "light";

  return await createUserSession(userInfo, redirectTo || "/");
}
