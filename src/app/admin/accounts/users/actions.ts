"use server";

import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { createUserSession, getUserInfo, setLoggedUser } from "@/lib/services/session.server";
import bcrypt from "bcryptjs";
import { deleteUserWithItsTenants } from "@/utils/services/userService";
import EventsService from "@/modules/events/services/server/EventsService";
import { AccountDeletedDto } from "@/modules/events/dtos/AccountDeletedDto";
import { UserPasswordUpdatedDto } from "@/modules/events/dtos/UserPasswordUpdatedDto";
import { UserProfileDeletedDto } from "@/modules/events/dtos/UserProfileDeletedDto";
import { db } from "@/db";
import { redirect } from "next/navigation";

export async function impersonateUser(userId: string) {
  await verifyUserHasPermission("admin.users.impersonate");
  const { t } = await getServerTranslations();
  
  const user = await db.users.getUser(userId);
  if (!user) {
    return { error: t("shared.notFound") };
  }

  const userInfo = await getUserInfo();
  const userSession = await setLoggedUser(user);
  if (!userSession) {
    return { error: t("shared.notFound") };
  }
  
  const tenant = await db.tenants.getTenant(userSession.defaultTenantId);
  return createUserSession(
    {
      ...userInfo,
      ...userSession,
      impersonatingFromUserId: userInfo.userId,
    },
    tenant ? `/app/${tenant.slug ?? tenant.id}/dashboard` : "/app"
  );
}

export async function changeUserPassword(userId: string, newPassword: string) {
  await verifyUserHasPermission("admin.users.changePassword");
  const { t } = await getServerTranslations();
  
  const user = await db.users.getUser(userId);
  if (!user) {
    return { error: t("shared.notFound") };
  }

  if (!newPassword || newPassword.length < 8) {
    return { error: "Set a password with 8 characters minimum" };
  } else if (user?.admin) {
    return { error: "You cannot change password for admin user" };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.users.updateUserPassword({ passwordHash }, user?.id);
  
  const userInfo = await getUserInfo();
  const currentUser = await db.users.getUser(userInfo.userId);
  
  const mockRequest = new Request("http://localhost", { method: "POST" });
  await EventsService.create({
    request: mockRequest,
    event: "user.password.updated",
    tenantId: null,
    userId: user.id,
    data: {
      user: { id: user.id, email: user.email },
      fromUser: { id: currentUser?.id ?? "", email: currentUser?.email ?? "" },
    } satisfies UserPasswordUpdatedDto,
  });

  return { success: t("shared.updated") };
}

export async function deleteUser(userId: string) {
  await verifyUserHasPermission("admin.users.delete");
  const { t } = await getServerTranslations();
  
  const user = await db.users.getUser(userId);
  if (!user) {
    return { error: t("shared.notFound") };
  }

  try {
    const { deletedTenants } = await deleteUserWithItsTenants(userId);
    const mockRequest = new Request("http://localhost", { method: "POST" });
    
    const deletedAccounts = await Promise.all(
      deletedTenants.map(async (tenant) => {
        const data = {
          tenant: { id: tenant.id, name: tenant.name },
          user: { id: user.id, email: user.email },
        } satisfies AccountDeletedDto;
        await EventsService.create({
          request: mockRequest,
          event: "account.deleted",
          tenantId: null,
          userId: null,
          data,
        });
        return data;
      })
    );
    
    await EventsService.create({
      request: mockRequest,
      event: "user.profile.deleted",
      tenantId: null,
      userId: null,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        deletedAccounts,
      } satisfies UserProfileDeletedDto,
    });
    
    return { success: t("shared.deleted") };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Failed to delete user" };
  }
}
