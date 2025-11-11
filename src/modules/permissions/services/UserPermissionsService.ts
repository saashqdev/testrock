import { db } from "@/db";
import { DefaultPermission } from "@/lib/dtos/shared/DefaultPermissions";
import { getUserInfo } from "@/lib/services/session.server";

export async function verifyUserHasPermission(permissionName: DefaultPermission, tenantId: string | null = null) {
  const userInfo = await getUserInfo();
  if (!userInfo.userId) {
    throw Error("Unauthorized");
  }
  const permission = await db.permissions.getPermissionByName(permissionName);
  if (permission) {
    const userPermission = (await db.userRoles.countUserPermission(userInfo.userId, tenantId, permissionName)) > 0;
    if (!userPermission) {
      throw Error("Unauthorized");
    }
  }
  return true;
}
