"use server";

import { autosubscribeToTrialOrFreePlan } from "@/modules/subscriptions/services/PricingService";
import UrlUtils from "@/lib/utils/UrlUtils";
import { db } from "@/db";
import { stripeService } from "@/modules/subscriptions/services/StripeService";
import { RolesModel, TenantDto, TenantsModel, TenantWithDetailsDto } from "@/db/models";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";
import { deleteUser, getUser, updateUser } from "./UserService";
import { TenantUserType } from "@/lib/enums/tenants/TenantUserType";
import { TenantUserJoined } from "@/lib/enums/tenants/TenantUserJoined";
import { TenantUserStatus } from "@/lib/enums/tenants/TenantUserStatus";

export async function getTenant(id: string): Promise<TenantWithDetailsDto | null> {
  return await cachified({
    key: `tenant:${id}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () => db.tenants.getTenant(id),
  });
}

export async function createTenant({
  name,
  slug,
  userId,
  icon,
  stripeCustomerId,
}: {
  name: string;
  slug?: string;
  userId: string;
  icon?: string | null;
  stripeCustomerId?: string | undefined;
}) {
  const user = await getUser(userId);
  if (!user) {
    throw Error("User not found");
  }
  slug = await getNextAvailableTenantSlug({ name, slug });
  const tenant = await db.tenants.createTenant({
    name,
    slug,
    icon: icon || null,
    active: true,
  });
  const tenantWithDetails = await getTenant(tenant.id);
  if (!tenantWithDetails) {
    throw Error("Tenant not found");
  }

  await updateUser(user?.id, { defaultTenantId: tenant.id });

  if (process.env.STRIPE_SK && !stripeCustomerId) {
    const stripeCustomer = await stripeService.createStripeCustomer(user.email, name);
    if (!stripeCustomer) {
      throw new Error("Could not create Stripe customer");
    }
    stripeCustomerId = stripeCustomer.id;
  }
  if (stripeCustomerId) {
    await db.tenantSubscriptions.createTenantSubscription(tenant.id, stripeCustomerId);
    await autosubscribeToTrialOrFreePlan({ tenantId: tenant.id });
  }

  return tenant;
}

async function getNextAvailableTenantSlug({ name, slug }: { name: string; slug?: string }) {
  if (slug === undefined) {
    slug = UrlUtils.slugify(name);
  }
  let tries = 1;
  do {
    const existingSlug = await tenantSlugAlreadyExists(slug);
    if (existingSlug) {
      slug = UrlUtils.slugify(name) + tries.toString();
      tries++;
    } else {
      break;
    }
  } while (true);
  return slug;
}

export async function tenantSlugAlreadyExists(slug: string) {
  if (["new-account", "undefined", "null"].includes(slug)) {
    return true;
  }
  const existing = await db.tenant.countBySlug(slug);
  return existing > 0;
}

export async function getTenantIdFromUrl(tenant: string) {
  const tenantId = await cachified({
    key: `tenantIdOrSlug:${tenant}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () => db.tenants.getTenantByIdOrSlug(tenant),
  });
  if (!tenantId) {
    throw Error("Account not found with slug: " + tenant);
  }
  return tenantId;
}

export async function getTenantSimple(id: string): Promise<TenantDto | null> {
  return await cachified({
    key: `tenantSimple:${id}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: async () => {
      const tenant = await db.tenants.getTenant(id);
      if (!tenant) return null;
      // Ensure 'types' property exists for TenantDto
      return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        icon: tenant.icon,
        deactivatedReason: tenant.deactivatedReason,
        types: (tenant as any).types ?? [],
        active: tenant.active,
      };
    },
  });
}

export async function getTenantByIdOrSlug(id: string): Promise<TenantDto | null> {
  return await cachified({
    key: `tenantIdOrSlug:${id}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: async () => {
      const tenant = await db.tenants.getTenantByIdOrSlug(id);
      if (!tenant) return null;
      // Ensure 'types' property exists for TenantDto
      return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        icon: tenant.icon,
        deactivatedReason: tenant.deactivatedReason,
        types: (tenant as any).types ?? [],
        active: tenant.active,
      };
    },
  });
}

export async function updateTenant(before: { id: string; slug: string }, data: { name?: string; icon?: string; slug?: string }): Promise<void> {
  const existingTenant = await db.tenants.getTenant(before.id);
  if (!existingTenant) {
    throw new Error("Tenant not found");
  }
  const updatedTenantData = {
    name: data.name ?? existingTenant.name,
    icon: data.icon !== undefined ? data.icon : existingTenant.icon !== null ? existingTenant.icon : undefined,
    slug: data.slug ?? existingTenant.slug,
  };
  await db.tenants.updateTenant(existingTenant, updatedTenantData).then((item) => {
    clearCacheKey(`tenant:${before.slug}`);
    clearCacheKey(`tenant:${before.id}`);
    clearCacheKey(`tenantIdOrSlug:${before.id}`);
    clearCacheKey(`tenantIdOrSlug:${before.slug}`);
    clearCacheKey(`tenantSimple:${before.id}`);
    if (data.slug) {
      clearCacheKey(`tenant:${data.slug}`);
      clearCacheKey(`tenantIdOrSlug:${data.slug}`);
    }
    return item;
  });
}

export async function deleteUserWithItsTenants(tenantId: string, userId: string) {
  const userTenantsRaw = await db.tenants.getTenantUserByIds(tenantId, userId);
  const userTenants = Array.isArray(userTenantsRaw) ? userTenantsRaw : userTenantsRaw ? [userTenantsRaw] : [];
  const deletedAccounts: TenantsModel[] = [];
  await Promise.all(
    userTenants.map(async ({ id }) => {
      const tenant = await getTenant(id);
      if (tenant?.users.length === 1 && tenant.users[0].userId === id) {
        // If the user is the only user in the tenant, delete the tenant
        await deleteAndCancelTenant(id);
        deletedAccounts.push(tenant);
      }
    })
  );
  const deletedTenants: TenantsModel[] = [];
  deletedAccounts.forEach((deletedAccount) => {
    if (deletedAccount) {
      deletedTenants.push(deletedAccount);
    }
  });
  return {
    deletedUser: await deleteUser(userId),
    deletedTenants,
  };
}

export async function deleteAndCancelTenant(id: string) {
  const tenantSubscription = await db.tenantSubscriptions.getTenantSubscription(id);
  if (tenantSubscription?.products) {
    await Promise.all(
      tenantSubscription.products.map(async (product) => {
        if (product?.stripeSubscriptionId) {
          await stripeService.cancelStripeSubscription(product?.stripeSubscriptionId);
        }
      })
    );
  }
  if (tenantSubscription?.stripeCustomerId) {
    await stripeService.deleteStripeCustomer(tenantSubscription?.stripeCustomerId);
  }
  return await deleteTenant(id);
}

export async function deleteTenant(id: string): Promise<void> {
  await db.tenants.deleteTenant(id).then(() => {
    clearCacheKey(`tenant:${id}`);
    clearCacheKey(`tenantIdOrSlug:${id}`);
    clearCacheKey(`tenantSimple:${id}`);
  });
}

export async function addTenantUser({ tenantId, userId, roles }: { tenantId: string; userId: string; roles?: RolesModel[] }) {
  const tenantUserId = await db.tenantUser.create({
    tenantId,
    userId,
    type: TenantUserType.MEMBER,
    joined: TenantUserJoined.JOINED_BY_INVITATION,
    status: TenantUserStatus.ACTIVE,
  });
  const tenantUser = await db.tenantUser.getById(tenantUserId);
  if (!tenantUser) {
    throw Error("Could not create tenant user");
  }

  if (!roles) {
    roles = await db.roles.getAllRoles("app");
  }
  await Promise.all(
    roles.map(async (role) => {
      return await db.userRoles.createUserRole(userId, role.id, tenantId);
    })
  );

  return tenantUser;
}
