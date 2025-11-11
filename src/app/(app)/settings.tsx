"use server";

import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { AccountDeletedDto } from "@/modules/events/dtos/AccountDeletedDto";
import { UserPasswordUpdatedDto } from "@/modules/events/dtos/UserPasswordUpdatedDto";
import { UserProfileDeletedDto } from "@/modules/events/dtos/UserProfileDeletedDto";
import { UserProfileUpdatedDto } from "@/modules/events/dtos/UserProfileUpdatedDto";
import EventsService from "@/modules/events/services/.server/EventsService";
import { UserWithoutPasswordDto } from "@/db/models/accounts/UsersModel";
import { storeSupabaseFile } from "@/utils/integrations/supabaseService";
import { deleteUserWithItsTenants } from "@/utils/services/userService";
import { getUserInfo } from "@/lib/services/session.server";
import bcrypt from "bcryptjs";
import { prisma } from "@/db/config/prisma/database";
import { db } from "@/db";
import Component from "./settings/component";

type ActionData = {
  success?: string;
  error?: string;
};

export const actionSettings = async (prev: any, form: FormData): Promise<ActionData> => {
  const { t } = await getServerTranslations();
  const userInfo = await getUserInfo();
  const action = form.get("action");

  const firstName = form.get("firstName")?.toString();
  const lastName = form.get("lastName")?.toString();
  const avatar = form.get("avatar")?.toString() ?? "";

  const passwordCurrent = form.get("passwordCurrent")?.toString();
  const passwordNew = form.get("passwordNew")?.toString();
  const passwordNewConfirm = form.get("passwordNewConfirm")?.toString();

  if (typeof action !== "string") {
    return { error: `Form not submitted correctly.` };
  }

  const user = await prisma.user.findUnique({
    where: { id: userInfo?.userId },
    include: {
      admin: true,
    },
  });
  if (!user) {
    return { error: `User not found.` };
  }

  // Create a mock request for EventsService
  const request = new Request("http://localhost", { method: "POST" });

  switch (action) {
    case "profile": {
      const fields = { action, firstName, lastName, avatar, passwordCurrent, passwordNew, passwordNewConfirm };
      const fieldErrors = {
        firstName: action === "profile" && (fields.firstName ?? "").length < 2 ? "First name required" : "",
        lastName: action === "profile" && (fields.lastName ?? "").length < 2 ? "Last name required" : "",
      };
      if (Object.values(fieldErrors).some(Boolean)) {
        return { error: `Form not submitted correctly.` };
      }

      if (typeof firstName !== "string" || typeof lastName !== "string") {
        return { error: `Form not submitted correctly.` };
      }

      let avatarStored = avatar ? await storeSupabaseFile({ bucket: "users-icons", content: avatar, id: userInfo?.userId }) : avatar;
      const profile = await db.users.updateUserProfile({ firstName, lastName, avatar: avatarStored }, userInfo?.userId);
      if (!profile) {
        return { error: `Something went wrong.` };
      }
      await EventsService.create({
        request,
        event: "user.profile.updated",
        tenantId: null,
        userId: user.id,
        data: {
          email: user.email,
          new: { firstName, lastName },
          old: { firstName: user.firstName, lastName: user.lastName },
          userId: userInfo?.userId,
        } satisfies UserProfileUpdatedDto,
      });
      return { success: "Profile updated" };
    }
    case "password": {
      if (typeof passwordCurrent !== "string" || typeof passwordNew !== "string" || typeof passwordNewConfirm !== "string") {
        return { error: `Form not submitted correctly.` };
      }

      if (passwordNew !== passwordNewConfirm) {
        return { error: t("account.shared.passwordMismatch") };
      }

      if (passwordNew.length < 6) {
        return { error: `Passwords must have least 6 characters.` };
      }

      const isCorrectPassword = await bcrypt.compare(passwordCurrent, user.passwordHash);
      if (!isCorrectPassword) {
        return { error: `Invalid password.` };
      }

      const passwordHash = await bcrypt.hash(passwordNew, 10);
      await db.users.updateUserPassword({ passwordHash }, userInfo?.userId);
      await EventsService.create({
        request,
        event: "user.password.updated",
        tenantId: null,
        userId: user.id,
        data: {
          user: { id: user.id, email: user.email },
        } satisfies UserPasswordUpdatedDto,
      });

      return { success: "Password updated" };
    }
    case "deleteAccount": {
      if (user.admin !== null) {
        return { error: "Cannot delete an admin" };
      }

      try {
        const { deletedTenants } = await deleteUserWithItsTenants(user.id);
        const deletedAccounts = await Promise.all(
          deletedTenants.map(async (tenant) => {
            const data = {
              tenant: { id: tenant.id, name: tenant.name },
              user: { id: user.id, email: user.email },
            } satisfies AccountDeletedDto;
            await EventsService.create({
              request,
              event: "account.deleted",
              tenantId: null,
              userId: null,
              data,
            });
            return data;
          })
        );
        await EventsService.create({
          request,
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
      } catch (e: any) {
        return { error: e.toString() };
      }

      redirect("/login");
    }
  }

  return {};
};

export default async function SettingsPage() {
  const userInfo = await getUserInfo();
  const user = await db.users.getUser(userInfo?.userId);
  if (!user) {
    redirect("/login");
  }
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  if (appConfiguration.app.features.tenantHome !== "/") {
    redirect("/my-profile");
  }

  return <Component user={user} />;
}
