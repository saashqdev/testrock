import ApiSpecsService, { ApiSpecsDto } from "@/modules/api/services/ApiSpecsService";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import ApiSpecs from "@/modules/api/components/ApiSpecs";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

type LoaderData = {
  apiSpecs: ApiSpecsDto;
};

async function getLoaderData(props: IServerComponentsProps): Promise<LoaderData> {
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.view");
  const data: LoaderData = {
    apiSpecs: await ApiSpecsService.generateSpecs({ request }),
  };
  return data;
}

export default async function ApiDocsPage(props: IServerComponentsProps) {
  const data = await getLoaderData(props);

  return (
    <EditPageLayout title="API Docs">
      <ApiSpecs item={data.apiSpecs} />
    </EditPageLayout>
  );
}
