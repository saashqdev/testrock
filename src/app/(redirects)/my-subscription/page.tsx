import { redirect } from "next/navigation";
import { getUserInfo } from "@/lib/services/session.server";
import { db } from "@/db";

export default async function MySubscriptionPage() {
  const redirectTo = "settings/subscription";
  const userInfo = await getUserInfo();
  const user = await db.users.getUser(userInfo.userId);
  
  if (!user) {
    throw redirect(`/login?redirect=${encodeURIComponent("/my-subscription")}`);
  }
  
  const myTenants = await db.tenants.getMyTenants(userInfo.userId);
  
  if (myTenants.length === 0 && user.admin) {
    redirect("/admin");
  } else if (myTenants.length > 0) {
    try {
      redirect("/app/" + encodeURIComponent(myTenants[0].slug) + "/" + redirectTo);
    } catch (e) {
      // Handle error silently
    }
  }
  
  redirect("/app");
}
