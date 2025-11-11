"use server";

import { getTenant } from "@/modules/accounts/services/TenantService";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { AdminUser } from "@prisma/client";

export async function getUser(userId: string | undefined) {
  if (!userId) {
    return null;
  }
  return await cachified({
    key: `user:${userId}`,
    ttl: 1000 * 60 * 60 * 24, // 1 day
    getFreshValue: async () => db.users.getUser(userId),
  });
}

export async function getDefaultTenant(user: { id: string; defaultTenantId: string | null; admin?: AdminUser }) {
  if (user.admin) {
    return null;
  }
  if (user.defaultTenantId) {
    const tenant = await getTenant(user.defaultTenantId);
    return tenant;
  }
  const userTenants = await db.tenants.getTenantUser(user.id);
  if (userTenants && Array.isArray(userTenants) && userTenants.length > 0) {
    return userTenants[0];
  }
  if (userTenants && userTenants.tenant) {
    return userTenants.tenant;
  }
  return null;
}

export async function createUser(data: {
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  active?: boolean;
  avatar?: string | null;
  locale?: string | null;
  defaultTenantId?: string | null;
}) {
  const { email, password, username, firstName, lastName, active, avatar, locale, defaultTenantId } = data;
  const passwordHash = password ? await bcrypt.hash(password, 10) : "";
  const now = new Date();
  // Generate a UUID for the user id if not provided by the database
  const userId = crypto.randomUUID();
  const id = await db.users.create({
    id: userId,
    email,
    passwordHash,
    username: username || "",
    firstName: firstName || "",
    lastName: lastName || "",
    avatar: avatar || null,
    locale: locale || null,
    defaultTenantId: defaultTenantId || null,
    active: active !== undefined ? active : true,
    phone: null,
    admin: null,
    verifyToken: null,
    githubId: null,
    googleId: null,
    createdAt: now,
    updatedAt: now,
  });
  const user = await getUser(userId);
  if (!user) {
    throw new Error("Could not create user");
  }
  return user;
}

export async function updateUser(
  id: string,
  data: {
    passwordHash?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    phone?: string;
    defaultTenantId?: string;
    verifyToken?: string;
    locale?: string;
    admin?: boolean;
  }
) {
  if (!id) {
    return null;
  }
  return await db.users
    .update(id, {
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: data.avatar,
      locale: data.locale,
      verifyToken: data.verifyToken,
      passwordHash: data.passwordHash,
      defaultTenantId: data.defaultTenantId,
      admin: data.admin,
    })
    .then((item) => {
      clearCacheKey(`user:${id}`);
      return item;
    });
}

export async function deleteUser(id: string): Promise<void> {
  await db.users.deleteUser(id).then((item) => {
    clearCacheKey(`user:${id}`);
    return item;
  });
}
