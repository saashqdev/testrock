import ApiSpecsService, { ApiSpecsDto } from "@/modules/api/services/ApiSpecsService";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import ApiSpecs from "@/modules/api/components/ApiSpecs";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { headers } from "next/headers";

type LoaderData = {
  apiSpecs: ApiSpecsDto;
};

export default async function ApiPage() {
  await verifyUserHasPermission("admin.entities.view");
  const headersList = await headers();
  const request = new Request(process.env.NEXT_PUBLIC_URL || "http://localhost:3000", {
    headers: headersList as any,
  });

  const data: LoaderData = {
    apiSpecs: await ApiSpecsService.generateSpecs({ request }),
  };

  return (
    <EditPageLayout title="API Docs">
      <ApiSpecs item={data.apiSpecs} />
    </EditPageLayout>
  );
}
