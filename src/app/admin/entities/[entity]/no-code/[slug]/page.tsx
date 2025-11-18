import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import RowsViewRoute from "@/modules/rows/components/RowsViewRoute";
import { LoaderData, loader as rowsListLoader, action as rowsListAction } from "@/modules/rows/routes/Rows_List.server";
import { getEntityPermission, getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await rowsListLoader(props);
  const loaderData = await data.json() as LoaderData;
  
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

export default async function (props: IServerComponentsProps) {
  const response = await rowsListLoader(props);
  const data = await response.json() as LoaderData;
  
  // Build appOrAdminData structure for permission checking
  const appOrAdminData = {
    user: data.user,
    isSuperAdmin: data.isSuperAdmin,
    permissions: data.permissions,
  };
  
  return (
    <RowsViewRoute
      key={data.rowsData.entity.id}
      rowsData={data.rowsData}
      items={data.rowsData.items}
      routes={data.routes}
      saveCustomViews={true}
      permissions={{
        create: getUserHasPermission(appOrAdminData, getEntityPermission(data.rowsData.entity, "create")),
      }}
      currentSession={{
        user: data.user,
        isSuperAdmin: data.isSuperAdmin,
      }}
    />
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
