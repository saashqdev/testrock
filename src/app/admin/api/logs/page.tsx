import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import ApiKeyLogService from "@/modules/api/services/ApiKeyLogService";
import { ApiKeyLogDto } from "@/modules/api/dtos/ApiKeyLogDto";
import ApiKeyLogsDetails from "@/modules/api/components/ApiKeyLogsDetails";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { headers } from "next/headers";

type LoaderData = {
  items: ApiKeyLogDto[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};

export const loader = async (searchParams: URLSearchParams) => {
  await verifyUserHasPermission("admin.apiKeys.view");
  const headersList = await headers();
  const request = new Request(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}?${searchParams.toString()}`, {
    headers: headersList as any,
  });
  
  const { items, filterableProperties, pagination } = await ApiKeyLogService.getDetails({ 
    request, 
    params: {} 
  });
  const data: LoaderData = {
    items,
    filterableProperties,
    pagination,
  };
  return data;
};

export default async function AdminApiLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const urlSearchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => urlSearchParams.append(key, v));
      } else {
        urlSearchParams.append(key, value);
      }
    }
  });

  const data = await loader(urlSearchParams);
  
  return (
    <EditPageLayout title="API Calls">
      <ApiKeyLogsDetails data={data} />
    </EditPageLayout>
  );
}
