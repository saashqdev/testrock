import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { LogWithDetailsDto } from "@/db/models/logs/LogsModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { db } from "@/db";
import { headers } from "next/headers";
import EventsClient from "./component";

type LoaderData = {
  items: LogWithDetailsDto[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};

async function getData(params: { tenant?: string }, searchParams: { [key: string]: string | string[] | undefined }) {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  
  // Construct the URL with search params
  const url = new URL(`${protocol}://${host}${headersList.get("x-invoke-path") || ""}`);
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, v));
      } else {
        url.searchParams.set(key, value);
      }
    }
  });

  const request = new Request(url.toString());
  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission("app.settings.auditTrails.view", tenantId);

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "action",
      title: "models.log.action",
    },
    {
      name: "url",
      title: "models.log.url",
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await db.logs.getLogs(tenantId, currentPagination, filters);

  const data: LoaderData = {
    items,
    pagination,
    filterableProperties,
  };
  return data;
}

export default async function LogsIndexPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ tenant?: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const data = await getData(resolvedParams, resolvedSearchParams);
  
  return <EventsClient data={data} params={resolvedParams} />;
}
