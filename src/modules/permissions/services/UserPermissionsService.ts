import { db } from "@/db";
import { DefaultPermission } from "@/lib/dtos/shared/DefaultPermissions";
import { getUserInfo } from "@/lib/services/session.server";

export async function verifyUserHasPermission(permissionName: DefaultPermission, tenantId: string | null = null) {
  const userInfo = await getUserInfo();
  if (!userInfo.userId) {
    throw Error("You must be logged in to access this resource");
  }
  const permission = await db.permissions.getPermissionByName(permissionName);
  if (permission) {
    const userPermission = (await db.userRoles.countUserPermission(userInfo.userId, tenantId, permissionName)) > 0;
    if (!userPermission) {
      throw Error(`You don't have permission to access this resource`);
    }
  }
  return true;
}
