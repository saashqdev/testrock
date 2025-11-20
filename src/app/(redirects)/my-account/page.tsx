import { redirect } from "next/navigation";
import { getUserInfo } from "@/lib/services/session.server";
import { db } from "@/db";

const redirectTo = "settings/account";

export default async function MyAccountRedirectPage() {
  const userInfo = await getUserInfo();
  const user = await db.users.getUser(userInfo.userId);
  
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent("/my-account")}`);
  }
  
  const myTenants = user.admin ? await db.tenants.adminGetAllTenants() : await db.tenants.getMyTenants(userInfo.userId);
  
  if (myTenants.length === 0 && user.admin) {
    redirect("/admin");
  } else if (myTenants.length > 0) {
    try {
      redirect(`/app/${encodeURIComponent(myTenants[0].slug)}/${redirectTo}`);
    } catch (e) {
      // If redirect fails, fall through to default redirect
    }
  }
  
  redirect("/app");
}
