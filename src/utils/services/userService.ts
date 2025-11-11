import { Tenant, Role } from "@prisma/client";
import { UserWithoutPasswordDto } from "@/db/models/accounts/UsersModel";
import { deleteAndCancelTenant } from "./tenantService";
import { prisma } from "@/db/config/prisma/database";
import { db } from "@/db";
import { clearCacheKey } from "@/lib/services/cache.server";

export async function deleteUserWithItsTenants(id: string) {
  const userTenants = await db.tenants.getMyTenants(id);
  const deletedAccounts = await Promise.all(
    userTenants.map(async (tenant) => {
      const tenantUsers = await db.tenants.getTenantWithUsers(tenant.id);
      if (tenantUsers?.users.length === 1 && tenantUsers.users[0].userId === id) {
        return await deleteAndCancelTenant({
          tenantId: tenant.id,
          userId: id,
        });
      }
    })
  );
  const deletedTenants: Tenant[] = [];
  deletedAccounts.forEach((deletedAccount) => {
    if (deletedAccount) {
      deletedTenants.push(deletedAccount);
    }
  });
  return {
    deletedUser: await db.users.deleteUser(id),
    deletedTenants,
  };
}

export async function setUserRoles({
  user,
  roles,
  isAdmin,
  type,
}: {
  user: UserWithoutPasswordDto;
  roles: { role: Role; tenantId: string | null }[];
  isAdmin: boolean;
  type: "admin" | "app";
}) {
  if (user.admin && !isAdmin) {
    await prisma.adminUser.delete({ where: { userId: user.id } });
  } else if (!user.admin && isAdmin) {
    await prisma.adminUser.create({ data: { userId: user.id } });
  }

  await db.userRoles.deleteAllUserRoles(user.id, type);
  return await db.userRoles
    .createUserRoles(
      user.id,
      roles
        .filter(({ role }) => role)
        .map(({ role, tenantId }) => ({
          id: role.id,
          tenantId,
        }))
    )
    .then((item) => {
      clearCacheKey(`user:${user.id}`);
      clearCacheKey(`userRoles:${user.id}:${null}`);
      return item;
    });
}
