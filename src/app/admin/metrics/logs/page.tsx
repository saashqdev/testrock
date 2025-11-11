import { MetricLog, Tenant } from "@prisma/client";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import MetricService from "@/modules/metrics/services/MetricService";
import UserModelHelper from "@/lib/helpers/models/UserModelHelper";
import { prisma } from "@/db/config/prisma/database";
import { UserDto } from "@/db/models/accounts/UsersModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import LogsClient from "./logs-client";

type ItemDto = MetricLog & {
  tenant: Tenant | null;
  user: UserDto | null;
};

type LoaderData = {
  items: ItemDto[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};

async function getLogsData(searchParams: URLSearchParams): Promise<LoaderData> {
  const request = new Request(`http://localhost?${searchParams.toString()}`);
  await verifyUserHasPermission("admin.metrics.view");
  const { filterableProperties, whereFilters } = await MetricService.getFilters({ request });

  const pagination = getPaginationFromCurrentUrl(searchParams);

  const items = await prisma.metricLog.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where: whereFilters,
    include: {
      tenant: true,
      user: { select: UserModelHelper.selectSimpleUserProperties },
    },
    orderBy: !pagination.sortedBy.length
      ? { createdAt: "desc" }
      : pagination.sortedBy.map((x) => ({
          [x.name]: x.direction,
        })),
  });

  const totalItems = await prisma.metricLog.count({
    where: whereFilters,
  });

  return {
    items,
    filterableProperties,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
    },
  };
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const params = new URLSearchParams();

  // Convert searchParams to URLSearchParams
  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value) {
      params.set(key, value);
    }
  });

  const data = await getLogsData(params);

  return <LogsClient data={data} />;
}
