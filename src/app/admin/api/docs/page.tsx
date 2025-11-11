import { ApiEndpointDto } from "@/modules/api/dtos/ApiEndpointDto";
import ApiSpecsService from "@/modules/api/services/ApiSpecsService";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import ApiSpecs from "@/modules/api/components/ApiSpecs";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { headers } from "next/headers";

type LoaderData = {
  apiSpecs: {
    endpoints?: ApiEndpointDto[];
    openApi: any;
    postmanCollection?: any;
  };
};

export const loader = async () => {
  await verifyUserHasPermission("admin.apiKeys.view");
  const headersList = await headers();
  const request = new Request(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000', {
    headers: headersList as any,
  });
  
  const apiSpecs = await ApiSpecsService.generateSpecs({ request });
  const data: LoaderData = {
    apiSpecs,
  };
  return data;
};

export default async function ApiDocsPage() {
  const data = await loader();

  return (
    <EditPageLayout title="API Docs">
      <ApiSpecs item={data.apiSpecs} />
    </EditPageLayout>
  );
}
