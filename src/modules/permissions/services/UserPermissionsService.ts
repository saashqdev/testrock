import { db } from "@/db";
import { DefaultPermission } from "@/lib/dtos/shared/DefaultPermissions";
import { getUserInfo } from "@/lib/services/session.server";
import { prisma } from "@/db/config/prisma/database";

export async function verifyUserHasPermission(permissionName: DefaultPermission, tenantId: string | null = null) {
  const userInfo = await getUserInfo();
  if (!userInfo.userId) {
    throw Error("You must be logged in to access this resource");
  }
  
  // SuperAdmin bypasses all permission checks - query AdminUser directly to bypass cache
  const adminUser = await prisma.adminUser.findUnique({
    where: { userId: userInfo.userId },
  });
  
  // Debug logging
  console.log(`[Permission Check] User: ${userInfo.userId}, Permission: ${permissionName}, AdminUser: ${adminUser ? "YES" : "NO"}`);
  
  if (adminUser) {
    console.log(`[Permission Check] ✅ SuperAdmin bypass - access granted`);
    return true;
  }
  
  const permission = await db.permissions.getPermissionByName(permissionName);
  if (permission) {
    const userPermission = (await db.userRoles.countUserPermission(userInfo.userId, tenantId, permissionName)) > 0;
    if (!userPermission) {
      console.log(`[Permission Check] ❌ No permission found`);
      throw Error(`You don't have permission to access this resource`);
    }
    console.log(`[Permission Check] ✅ Permission granted via role`);
  }
  return true;
}
