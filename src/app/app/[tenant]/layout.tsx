import AppLayout from "@/components/app/AppLayout";
import AppDataLayout from "@/context/AppDataLayout";
import { db } from "@/db";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { getUserInfo } from "@/lib/services/session.server";
import { getCurrentUrl, requireTenantSlug } from "@/lib/services/url.server";
import { AppDataDto } from "@/lib/state/useAppData";
import { promiseHash } from "@/lib/utils";
import UrlUtils from "@/lib/utils/UrlUtils";
import { getTenantIdFromUrl } from "@/modules/accounts/services/TenantService";
import { getUser, updateUser } from "@/modules/accounts/services/UserService";
import { CreditTypes } from "@/modules/credits/dtos/CreditType";
import { DefaultPermission } from "@/modules/permissions/data/DefaultPermission";
import { DefaultAdminRoles } from "@/lib/dtos/shared/DefaultAdminRoles";
import { AppRoleEnum } from "@/modules/permissions/enums/AppRoleEnum";
import { DefaultAppFeatures } from "@/modules/subscriptions/data/appFeatures";
import { PlanFeatureUsageDto } from "@/modules/subscriptions/dtos/PlanFeatureUsageDto";
import { getActiveTenantSubscriptions, getPlanFeatureUsage } from "@/modules/subscriptions/services/SubscriptionService";
import { redirect } from "next/navigation";
import { TenantUserType } from "@/lib/enums/tenants/TenantUserType";
import { OnboardingSessionWithDetailsDto } from "@/db/models/onboarding/OnboardingSessionsModel";
import { getClientIPAddress } from "@/utils/server/IpUtils";
import { headers } from "next/headers";

const loader = async () => {
  const tenantSlug = await requireTenantSlug();
  const tenantId = await getTenantIdFromUrl(tenantSlug);
  const userInfo = await getUserInfo();
  if (!userInfo.userId) {
    throw redirect("/login");
  }
  if (!tenantSlug) {
    throw redirect("/app");
  }

  // Check if tenant home is root
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  if (appConfiguration.app.features.tenantHome === "/") {
    throw redirect("/");
  }

  const { user, currentTenant } = await promiseHash({
    user: getUser(userInfo.userId!),
    currentTenant: db.tenants.getTenant(tenantId.id),
  });

  const url = new URL(await getCurrentUrl());
  const redirectTo = url.pathname + url.search;
  if (!userInfo || !user) {
    let searchParams = new URLSearchParams([["redirect", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }

  if (!currentTenant) {
    throw redirect(`/app`);
  }

  if (!user?.admin) {
    const tenantUser = await db.tenantUser.get({ tenantId: tenantId.id, userId: userInfo.userId });
    if (!tenantUser) {
      throw redirect("/app");
    }
  }
  if (user?.defaultTenantId !== tenantId.id) {
    await updateUser(userInfo.userId, { defaultTenantId: tenantId.id });
  }

  // Store IP Address
  const headersList = await headers();
  const ipAddress = getClientIPAddress(headersList) ?? "Unknown";
  await db.tenantIpAddress.createUniqueTenantIpAddress({
    ip: ipAddress,
    fromUrl: url.pathname,
    tenantId: tenantId.id,
    userId: userInfo.userId,
  });

  // Check if tenant is deactivated
  if (currentTenant.deactivatedReason) {
    throw redirect(`/deactivated/${tenantSlug}`);
  }

  // Get onboarding session and current role separately to ensure proper typing
  const onboardingSessions = await db.onboardingSessions.getOnboardingSessions({ userId: userInfo.userId, tenantId: tenantId.id });
  const onboardingSession: OnboardingSessionWithDetailsDto | null = onboardingSessions[0] || null;

  const tenantUserResult = await db.tenants.getTenantUserType(userInfo.userId, tenantId.id);
  const currentRole: TenantUserType = tenantUserResult?.type ?? TenantUserType.MEMBER;

  let { myTenants, mySubscription, allPermissions, superUserRole, superAdminRole, allRoles, roles, entities, entityGroups, myGroups, tenantTypes } =
    await promiseHash({
      myTenants: user.admin ? db.tenants.adminGetAllTenants() : db.tenants.getMyTenants(user.id),
      mySubscription: getActiveTenantSubscriptions(tenantId.id),
      allPermissions: db.userRoles.getPermissionsByUser(userInfo.userId, tenantId.id),
      superUserRole: db.userRoles.getUserRoleInTenant(userInfo.userId, tenantId.id, AppRoleEnum.SuperUser),
      superAdminRole: db.userRoles.getUserRoleInAdmin(userInfo.userId, DefaultAdminRoles.SuperAdmin),
      allRoles: db.roles.getAllRoles(),
      roles: db.userRoles.getUserRoles(userInfo.userId, tenantId.id),
      entities: db.entities.getAllEntities(tenantId.id),
      entityGroups: db.entityGroups.getAllEntityGroups(),
      myGroups: db.groups.getMyGroups(userInfo.userId, tenantId.id),
      tenantTypes: db.tenantTypes.getAllTenantTypes(),
    });

  if (!UrlUtils.stripTrailingSlash(url.pathname).startsWith(`/app/${tenantSlug}/settings`)) {
    const appConfiguration = await db.appConfiguration.getAppConfiguration();
    if (appConfiguration.subscription.required && mySubscription?.products.length === 0) {
      throw redirect(`/app/${tenantSlug}/pricing?error=subscription_required`);
    }
  }

  let credits: PlanFeatureUsageDto | undefined = undefined;
  if (CreditTypes.length > 0) {
    credits = await getPlanFeatureUsage(tenantId.id, DefaultAppFeatures.Credits);
  }
  const data: AppDataDto = {
    user: {
      ...user,
      admin: user.admin === undefined ? null : user.admin,
    },
    myTenants,
    currentTenant,
    mySubscription,
    permissions: allPermissions.map((f) => f as DefaultPermission),
    isSuperUser: !!superUserRole,
    isSuperAdmin: !!superAdminRole,
    credits,
    allRoles: allRoles.map((role) => ({ id: role.id, name: role.name, description: role.description })),
    roles,
    entities,
    entityGroups,
    myGroups,
    onboardingSession,
    tenantTypes,
    currentRole,
  };

  return data;
};

export default async function (props: IServerComponentsProps) {
  const appData = await loader();

  return (
    <AppDataLayout data={appData}>
      <div className="min-h-screen bg-background">
        <AppLayout layout="app">
          {props.children}
        </AppLayout>
      </div>
    </AppDataLayout>
  );
}
