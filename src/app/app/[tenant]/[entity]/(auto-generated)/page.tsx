import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import RowsViewRoute from "@/modules/rows/components/RowsViewRoute";
import { LoaderData, loader as rowsListLoader, action as rowsListAction } from "@/modules/rows/routes/Rows_List.server";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { getEntityPermission, getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import TitleDataLayout from "@/context/TitleDataLayout";

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
  const appOrAdminData = useAppOrAdminData();
  
  // Extract title from meta tags
  let title = "";
  if (data?.meta) {
    for (const tag of data.meta) {
      if ('title' in tag && tag.title) {
        title = tag.title;
        break;
      }
    }
  }
  
  return (
    <TitleDataLayout data={{ title }}>
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
    </TitleDataLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
