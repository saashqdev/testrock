import { DefaultAdminRoles } from "@/lib/dtos/shared/DefaultAdminRoles";
import { DefaultPermission } from "@/lib/dtos/shared/DefaultPermissions";
import { TimeFunction } from "@/modules/metrics/services/server/MetricTracker";
import OnboardingService from "@/modules/onboarding/services/OnboardingService";
import UrlUtils from "@/utils/app/UrlUtils";
import { promiseHash } from "@/utils/promises/promiseHash";
import { getUserInfo } from "@/lib/services/session.server";
import { AdminLoaderData } from "../useAdminData";
import { TFunction } from "i18next";
import { redirect } from "next/navigation";
import { db } from "@/db";

export async function loadAdminData({ request, t }: { request: Request; t: TFunction }, time: TimeFunction) {
  const userInfo = await time(getUserInfo(), "getUserInfo");
  const url = new URL(request.url);
  if (UrlUtils.stripTrailingSlash(url.pathname) === `/admin`) {
    throw redirect(`/admin/dashboard`);
  }
  const user = await time(db.users.getUser(userInfo?.userId), "getUser");
  const redirectTo = url.pathname + url.search;
  if (!userInfo || !user) {
    let searchParams = new URLSearchParams([["redirect", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }

  if (!user.admin) {
    throw Response.json({ error: "Only admins can access this page" }, { status: 401 });
  }

  const myTenants = await time(db.tenants.getMyTenants(user.id), "getMyTenants");

  const { allPermissions, superAdminRole, entities, entityGroups, allRoles, roles, myGroups, onboardingSession } = await time(
    promiseHash({
      allPermissions: db.userRoles.getPermissionsByUser(userInfo.userId, null),
      superAdminRole: db.userRoles.getUserRoleInAdmin(userInfo.userId, DefaultAdminRoles.SuperAdmin),
      entities: db.entities.getAllEntities(null),
      entityGroups: db.entityGroups.getAllEntityGroups(),
      allRoles: db.roles.getAllRolesWithoutPermissions("admin"),
      roles: db.userRoles.getUserRoles(userInfo.userId, null),
      myGroups: db.groups.getMyGroups(user.id, null),
      onboardingSession: OnboardingService.getUserActiveOnboarding({ userId: user.id, tenantId: null, request }),
    }),
    "loadAdminData.getDetails"
  );
  const data: AdminLoaderData = {
    user,
    myTenants,
    currentTenant: null,
    entities,
    entityGroups,
    roles,
    allRoles,
    permissions: allPermissions.map((f) => f as DefaultPermission),
    isSuperUser: !!superAdminRole,
    isSuperAdmin: !!superAdminRole,
    myGroups,
    lng: user?.locale ?? userInfo.lng,
    onboardingSession,
    tenantTypes: await db.tenantTypes.getAllTenantTypes(),
  };
  return data;
}
