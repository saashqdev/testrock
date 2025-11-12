import { DefaultPermission } from "@/modules/permissions/data/DefaultPermission";
import { getUserInfo } from "@/lib/services/session.server";
import { AdminDataDto } from "@/lib/state/useAdminData";
import { promiseHash } from "@/lib/utils";
import { getUser } from "@/modules/accounts/services/UserService";
import { DefaultAdminRoles } from "@/lib/dtos/shared/DefaultAdminRoles";
import AdminLayoutWrapper from "@/components/layouts/AdminLayoutWrapper";
import AdminDataLayout from "@/context/AdminDataLayout";
import { redirect } from "next/navigation";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { getCurrentUrl } from "@/lib/services/url.server";
import SidebarLayout from "@/components/layouts/SidebarLayout";

const loader = async (props: IServerComponentsProps): Promise<AdminDataDto> => {
  const userInfo = await getUserInfo();
  const user = userInfo.userId ? await getUser(userInfo.userId) : null;
  const url = new URL(await getCurrentUrl());
  const redirectTo = url.pathname + url.search;
  if (!userInfo || !user || !userInfo.userId) {
    let searchParams = new URLSearchParams([["redirect", redirectTo]]);
    throw redirect(`/login?${searchParams.toString()}`);
  }

  if (!user.admin) {
    throw new Error("Only admins can access this page");
    // throw json({ error: "Only admins can access this page" }, { status: 401 });
  }

  const { allPermissions, superAdminRole, allRoles, roles, entities, entityGroups, myGroups, tenantTypes, myTenants } = await promiseHash({
    allPermissions: db.userRoles.getPermissionsByUser(userInfo.userId, null),
    superAdminRole: db.userRoles.getUserRoleInAdmin(userInfo.userId, DefaultAdminRoles.SuperAdmin),
    allRoles: db.roles.getAllRolesWithoutPermissions(), // Use lightweight version
    roles: db.userRoles.getUserRoles(userInfo.userId, null),
    entities: db.entities.getAllEntities(null, false), // Exclude system entities to reduce memory
    entityGroups: db.entityGroups.getAllEntityGroups(),
    myGroups: db.groups.getMyGroups(userInfo.userId, null), // Admin can see all groups
    tenantTypes: db.tenantTypes.getAllTenantTypes(),
    myTenants: db.tenants.getMyTenants(user.id),
  });
  const data: AdminDataDto = {
    user,
    myTenants,
    currentTenant: null, // Admin context doesn't have a current tenant
    allRoles: allRoles.map((role) => ({ id: role.id, name: role.name, description: role.description })),
    roles,
    permissions: allPermissions.map((f) => f as DefaultPermission),
    entities,
    entityGroups,
    isSuperUser: false, // Admin context uses isSuperAdmin instead
    isSuperAdmin: !!superAdminRole,
    myGroups,
    onboardingSession: null, // Admin context doesn't need onboarding
    tenantTypes,
  };
  return data;
};

export default async function (props: IServerComponentsProps) {
  const adminData = await loader(props);
  return (
    <AdminDataLayout data={adminData}>
      <SidebarLayout layout="admin">{props.children}</SidebarLayout>
    </AdminDataLayout>
  );
}
