import { getUserInfo } from "./session.server";
import { db } from "@/db";
import { getTenantIdFromUrl } from "@/modules/accounts/services/TenantService";
import { getCurrentUrl, getTenantSlug } from "./url.server";

export async function requireAuth(options?: { tenantSlug?: string }) {
  const url = new URL(await getCurrentUrl());
  const currentPath = url.pathname;
  if (currentPath.startsWith("/admin")) {
    // console.log("[requireAuth.admin]", currentPath);
    return await requireAdmin();
  } else if ((currentPath.startsWith("/app") && currentPath !== "/app") || (currentPath.startsWith("/subscribe") && currentPath !== "/subscribe")) {
    // console.log("[requireAuth.app]", currentPath);
    const userInfo = await getUserInfo();
    const tenantSlug = options?.tenantSlug || (await getTenantSlug());
    if (!tenantSlug) {
      // No tenant context available - this might be an API route or non-tenant page
      // Just verify user is authenticated
      if (!userInfo.userId) {
        throw new Error("Unauthorized");
      }
      return;
    }
    const tenantId = await getTenantIdFromUrl(tenantSlug);
    if (!userInfo.userId || !tenantId) {
      throw new Error("Unauthorized");
    }
    const member = await db.tenantUser.get({ userId: userInfo.userId, tenantId: tenantId.id });
    if (!member) {
      const user = await db.users.getUser(userInfo.userId);
      if (!user?.admin) {
        throw new Error("Unauthorized");
      }
    }
  } else {
    // console.log("[requireAuth.none]", currentPath);
  }
}

async function requireAdmin() {
  const userInfo = await getUserInfo();
  if (!userInfo.userId) {
    throw new Error("Unauthorized");
  }
  const user = await db.users.getUser(userInfo.userId);
  if (!user?.admin) {
    throw new Error("Unauthorized");
  }
}
