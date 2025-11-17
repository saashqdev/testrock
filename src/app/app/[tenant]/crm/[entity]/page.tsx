import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import RowsViewRoute from "@/modules/rows/components/RowsViewRoute";
import * as RowsList from "@/modules/rows/routes/Rows_List.server";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { getEntityPermission, getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

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
  const appOrAdminData = useAppOrAdminData();
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
        user: appOrAdminData?.user!,
        isSuperAdmin: appOrAdminData?.isSuperAdmin ?? false,
      }}
    />
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
