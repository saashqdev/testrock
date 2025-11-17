import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import RowsViewRoute from "@/modules/rows/components/RowsViewRoute";
import * as RowsList from "@/modules/rows/routes/Rows_List.server";
import { getEntityPermission } from "@/lib/helpers/PermissionsHelper";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { getUserInfo } from "@/lib/services/session.server";
import { getUser } from "@/modules/accounts/services/UserService";
import { DefaultAdminRoles } from "@/lib/dtos/shared/DefaultAdminRoles";
import { db } from "@/db";

export { serverTimingHeaders as headers };

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await RowsList.loader(props);
  const loaderData = await data.json() as RowsList.LoaderData;
  
  // Convert MetaTagsDto array to Metadata object
  const metadata: Metadata = {};
  if (loaderData?.meta) {
    for (const tag of loaderData.meta) {
      if ('title' in tag) {
        metadata.title = tag.title;
      }
      // Add more conversions as needed
    }
  }
  return metadata;
}
export const loader = (props: IServerComponentsProps) => RowsList.loader(props);
export const action = (props: IServerComponentsProps) => RowsList.action(props);

export default async function (props: IServerComponentsProps) {
  const response = await RowsList.loader(props);
  const data = await response.json() as RowsList.LoaderData;
  
  // Fetch user data server-side
  const userInfo = await getUserInfo();
  const user = userInfo.userId ? await getUser(userInfo.userId) : null;
  if (!user) {
    throw new Error("User not found");
  }
  
  // Check permissions server-side
  const allPermissions = await db.userRoles.getPermissionsByUser(userInfo.userId, null);
  const superAdminRole = await db.userRoles.getUserRoleInAdmin(userInfo.userId, DefaultAdminRoles.SuperAdmin);
  const isSuperAdmin = !!superAdminRole;
  const hasCreatePermission = allPermissions.some(p => p === getEntityPermission(data.rowsData.entity, "create")) || isSuperAdmin;
  
  return (
    <RowsViewRoute
      key={data.rowsData.entity.id}
      rowsData={data.rowsData}
      items={data.rowsData.items}
      routes={data.routes}
      saveCustomViews={true}
      permissions={{
        create: hasCreatePermission,
      }}
      currentSession={{
        user: user,
        isSuperAdmin: isSuperAdmin,
      }}
    />
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
