import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { prisma } from "@/db/config/prisma/database";
import { RowPermissionsDto } from "@/lib/dtos/entities/RowPermissionsDto";
import { DefaultAdminRoles } from "@/lib/dtos/shared/DefaultAdminRoles";
import { DefaultPermission } from "@/lib/dtos/shared/DefaultPermissions";
import { RowAccess, RowAccessTypes } from "@/lib/enums/entities/RowAccess";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { getUserInfo } from "@/lib/services/session.server";

export async function getUserPermission({ userId, permissionName, tenantId }: { userId: string; permissionName: string; tenantId?: string | null }) {
  const permission = await db.permissions.getPermissionName(permissionName);
  if (!permission) {
    return { permission, userPermission: undefined };
  }
  // const userRoles = await db.userRoles.getUserRoles(userId ?? undefined, tenantId ?? null);
  // let userPermission: Permission | undefined = undefined;
  // userRoles.forEach((userRole) => {
  //   userRole.role.permissions.forEach((rolePermission) => {
  //     if (rolePermission.permission.name === permissionName) {
  //       userPermission = rolePermission.permission;
  //     }
  //   });
  // });
  const userPermission = await db.userRoles.findPermissionByUser(permissionName, userId, tenantId);
  return { permission, userPermission };
}

export async function verifyUserHasPermission(permissionName: DefaultPermission, tenantId: string | null = null, pathname?: string) {
  const userInfo = await getUserInfo();
  if (!userInfo.userId) {
    throw Error("Unauthorized");
  }

  // SuperAdmin bypasses all permission checks - query AdminUser directly to bypass cache
  const adminUser = await prisma.adminUser.findUnique({
    where: { userId: userInfo.userId },
  });

  if (adminUser) {
    console.log(`[Permission Check] ✅ SuperAdmin bypass for ${permissionName}`);
    return true;
  }

  const permission = await db.permissions.getPermissionName(permissionName);
  if (permission) {
    const userPermission = (await db.userRoles.countUserPermission(userInfo.userId, tenantId, permissionName)) > 0;
    if (!userPermission) {
      const redirectPath = pathname ? `?redirect=${pathname}` : "";

      console.log(`[Permission Check] ❌ Access denied for ${permissionName}`);

      if (tenantId) {
        throw redirect(`/unauthorized/${permissionName}/${tenantId}/${redirectPath}`);
      } else {
        throw redirect(`/unauthorized/${permissionName}${redirectPath}`);
      }
    }
  }
  return true;
}

export async function getUserRowPermission(row: RowWithDetailsDto, tenantId?: string | null, userId?: string): Promise<RowPermissionsDto> {
  const accessLevels: RowAccess[] = ["none"];

  let isOwner = false;
  if (tenantId === null && userId) {
    const isSuperAdmin = await db.userRoles.getUserRoleInAdmin(userId, DefaultAdminRoles.SuperAdmin);
    if (isSuperAdmin) {
      isOwner = true;
    }
  } else if (tenantId === undefined && userId === undefined) {
    accessLevels.push("view");
  } else {
    isOwner = !!userId && userId === row.createdByUserId;
    if (tenantId) {
      const existing = row.permissions.find((f) => f.tenantId);
      if (existing) {
        accessLevels.push(existing.access as RowAccess);
      }
    } else if (userId) {
      if (row.createdByUserId === userId || row.createdByUserId === null) {
        accessLevels.push("delete");
      }
      const existing = row.permissions.find((f) => f.userId === userId);
      if (existing) {
        accessLevels.push(existing.access as RowAccess);
      }
    }
    if (tenantId !== undefined && userId) {
      const inRoles = row.permissions
        .filter((f) => f.roleId)
        .map((f) => f.roleId)
        .map((f) => f as string);
      if (inRoles.length > 0) {
        const userRoles = await db.userRoles.findUserRolesByIds(userId, tenantId, inRoles);
        userRoles.forEach((userRole) => {
          const existing = row.permissions.find((f) => f.roleId === userRole.roleId);
          if (existing) {
            accessLevels.push(existing.access as RowAccess);
          }
        });
      }

      const inGroups = row.permissions
        .filter((f) => f.groupId)
        .map((f) => f.groupId)
        .map((f) => f as string);
      if (inGroups.length > 0) {
        const userGroups = await db.groups.getMyGroups(userId, tenantId);
        userGroups.forEach((userGroup) => {
          const existing = row.permissions.find((f) => f.groupId === userGroup.id);
          if (existing) {
            accessLevels.push(existing.access as RowAccess);
          }
        });
      }
    }
  }

  let access: RowAccess | undefined = undefined;
  for (let idx = RowAccessTypes.length - 1; idx >= 0; idx--) {
    const accessType = RowAccessTypes[idx];
    if (accessLevels.includes(accessType)) {
      access = accessType;
      break;
    }
  }

  const rowPermissions: RowPermissionsDto = {
    canRead: isOwner || (access && access !== "none"),
    canComment: isOwner || access === "comment" || access === "edit" || access === "delete",
    canUpdate: isOwner || access === "edit" || access === "delete",
    canDelete: isOwner || access === "delete",
    isOwner,
  };
  return rowPermissions;
}

export type RowPermissionsFilter = Prisma.RowWhereInput | {};
export async function getRowPermissionsCondition({ tenantId, userId }: { tenantId?: string | null; userId?: string }) {
  const OR_CONDITIONS: Prisma.RowWhereInput[] = [];
  if (tenantId) {
    OR_CONDITIONS.push(...[{ permissions: { some: { tenantId } } }]);
    if (userId) {
      OR_CONDITIONS.push(...[{ createdByUserId: userId }, { permissions: { some: { userId } } }]);
    }
  } else {
    if (userId) {
      OR_CONDITIONS.push(...[{ createdByUserId: null }, { createdByUserId: userId }, { permissions: { some: { userId } } }]);
    }
  }
  if (tenantId !== undefined && userId) {
    const userRoles = await db.userRoles.getUserRoles(userId, tenantId);
    userRoles.forEach((userRole) => {
      OR_CONDITIONS.push(...[{ permissions: { some: { roleId: userRole.roleId } } }]);
    });

    const userGroups = await db.groups.getMyGroups(userId, tenantId);
    userGroups.forEach((userGroup) => {
      OR_CONDITIONS.push(...[{ permissions: { some: { groupId: userGroup.id } } }]);
    });
  }
  return {
    OR: OR_CONDITIONS,
  };
}
