import { redirect } from "next/navigation";
import { Params } from "@/types";
import { DefaultAdminRoles } from "@/lib/dtos/shared/DefaultAdminRoles";
import { DefaultAppRoles } from "@/lib/dtos/shared/DefaultAppRoles";
import { DefaultEntityTypes } from "@/lib/dtos/shared/DefaultEntityTypes";
import { DefaultPermission } from "@/lib/dtos/shared/DefaultPermissions";
import { TenantUserType } from "@/lib/enums/tenants/TenantUserType";
import { timeFake, TimeFunction } from "@/modules/metrics/services/server/MetricTracker";
import OnboardingService from "@/modules/onboarding/services/OnboardingService";
import UrlUtils from "@/utils/app/UrlUtils";
import { promiseHash } from "@/utils/promises/promiseHash";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { getActiveTenantSubscriptions, getPlanFeatureUsage } from "@/utils/services/server/subscriptionService";
import { getUserInfo } from "@/lib/services/session.server";
import { AppLoaderData } from "../useAppData";
import { PlanFeatureUsageDto } from "@/lib/dtos/subscriptions/PlanFeatureUsageDto";
import { CreditTypes } from "@/modules/usage/dtos/CreditType";
import { DefaultFeatures } from "@/lib/dtos/shared/DefaultFeatures";
import { TFunction } from "i18next";
import { db } from "@/db";

export async function loadAppData({ request, params, t, time = timeFake }: { request: Request; params: Params; t: TFunction; time?: TimeFunction }) {
  const { tenantId, userInfo } = await time(
    promiseHash({
      tenantId: getTenantIdFromUrl(params),
      userInfo: getUserInfo(),
    }),
    "loadAppData.session"
  );

  const url = new URL(request.url);
  if (UrlUtils.stripTrailingSlash(url.pathname) === UrlUtils.stripTrailingSlash(UrlUtils.currentTenantUrl(params))) {
    throw redirect(UrlUtils.currentTenantUrl(params, "dashboard"));
  }
  const { user, currentTenant } = await time(
    promiseHash({
      user: db.users.getUser(userInfo?.userId),
      currentTenant: db.tenants.getTenantDto(tenantId),
    }),
    "loadAppData.getUserAndTenant"
  );

  const redirectTo = url.pathname + url.search;
  if (!userInfo || !user) {
    let searchParams = new URLSearchParams([["redirect", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }

  if (!currentTenant) {
    throw redirect(`/app`);
  }
  let { myTenants, mySubscription, allPermissions, superUserRole, superAdminRole, entities, entityGroups, allRoles, roles, myGroups, onboardingSession } = await time(
    promiseHash({
      myTenants: time(db.tenants.getMyTenants(user.id), "loadAppData.getDetails.getMyTenants"),
      mySubscription: time(getActiveTenantSubscriptions(tenantId), "loadAppData.getDetails.getActiveTenantSubscriptions"),
      allPermissions: time(db.userRoles.getPermissionsByUser(userInfo.userId, tenantId), "loadAppData.getDetails.getPermissionsByUser"),
      superUserRole: time(db.userRoles.getUserRoleInTenant(userInfo.userId, tenantId, DefaultAppRoles.SuperUser), "loadAppData.getDetails.getUserRoleInTenant"),
      superAdminRole: time(db.userRoles.getUserRoleInAdmin(userInfo.userId, DefaultAdminRoles.SuperAdmin), "loadAppData.getDetails.getUserRoleInAdmin"),
      entities: time(
        db.entities.getAllEntities(null),
        "loadAppData.getDetails.getAllEntities"
      ),
      entityGroups: time(db.entityGroups.getAllEntityGroups(), "loadAppData.getDetails.getAllEntityGroups()"),
      allRoles: time(db.roles.getAllRolesWithoutPermissions("app"), "loadAppData.getDetails.getAllRolesWithoutPermissions"),
      roles: time(db.userRoles.getUserRoles(userInfo.userId, tenantId), "loadAppData.getDetails.getUserRoles"),
      myGroups: time(db.groups.getMyGroups(user.id, currentTenant.id), "loadAppData.getDetails.getMyGroups"),
      onboardingSession: time(
        OnboardingService.getUserActiveOnboarding({ userId: user.id, tenantId: currentTenant.id, request }),
        "loadAppData.getDetails.OnboardingService.getUserActiveOnboarding"
      ),
    }),
    "loadAppData.getDetails"
  );

  const tenantUser = await db.tenants.getTenantUserType(tenantId, userInfo.userId);
  let currentRole = tenantUser?.type ?? TenantUserType.MEMBER;
  if (user.admin) {
    currentRole = TenantUserType.ADMIN;
  }
  const tenantTypes = await db.tenantTypes.getAllTenantTypes();

  let credits: PlanFeatureUsageDto | undefined = undefined;
  if (CreditTypes.length > 0) {
    credits = await getPlanFeatureUsage(tenantId, DefaultFeatures.Credits);
  }
  const data: AppLoaderData = {
    // i18n: i18n.translations,
    user,
    myTenants,
    currentTenant,
    currentRole,
    mySubscription,
    entities,
    entityGroups,
    roles,
    allRoles,
    permissions: allPermissions.map((f) => f as DefaultPermission),
    myGroups,
    isSuperUser: !!superUserRole,
    isSuperAdmin: !!superAdminRole,
    lng: user?.locale ?? userInfo.lng,
    onboardingSession,
    tenantTypes,
    credits,
  };
  return data;
}
