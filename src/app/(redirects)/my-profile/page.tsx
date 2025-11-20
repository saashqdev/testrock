import { redirect } from "next/navigation";
import { getUserInfo } from "@/lib/services/session.server";
import { db } from "@/db";

const redirectTo = "settings/profile";

export default async function MyProfilePage() {
  const userInfo = await getUserInfo();
  const user = await db.users.getUser(userInfo.userId);
  
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent("/my-profile")}`);
  }
  
  const user = await db.users.getUser(userInfo.userId);
  const myTenants = user?.admin ? await db.tenants.adminGetAllTenants() : await db.tenants.getMyTenants(userInfo.userId);
  
  if (myTenants.length === 0 && user.admin) {
    redirect("/admin/profile");
  } else if (myTenants.length > 0) {
    try {
      redirect("/app/" + encodeURIComponent(myTenants[0].slug) + "/" + redirectTo);
    } catch (e) {
      // Handle error silently
    }
  }
  
  redirect("/app");
}
