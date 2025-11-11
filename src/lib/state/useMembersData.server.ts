"server-only";

import { db } from "@/db";
import { Params } from "@/types";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { getBaseURL } from "@/lib/services/url.server";

export type MembersLoaderData = {
  users: any[];
  pendingInvitations: any[];
  roles: any[];
  permissions: any[];
  appUrl: string;
};

export async function loadMembersData({ request, params }: { request: Request; params: Params }): Promise<MembersLoaderData> {
  const tenantId = await getTenantIdFromUrl(params);

  const users = await db.tenantUser.getAll(tenantId);
  const rawPendingInvitations = await db.tenantUserInvitations.getPending(tenantId);
  const pendingInvitations = rawPendingInvitations.map((invitation: any) => ({
    ...invitation,
    acceptedAt: invitation.acceptedAt ?? null,
    expiresAt: invitation.expiresAt ?? null,
  }));

  const roles = await db.roles.getAllRoles("app");
  const permissions = await db.permissions.getAllPermissions("app");

  const data: MembersLoaderData = {
    users,
    pendingInvitations,
    roles,
    permissions,
    appUrl: await getBaseURL(),
  };
  return data;
}
