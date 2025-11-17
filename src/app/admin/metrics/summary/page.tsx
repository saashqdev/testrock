import { Prisma } from "@prisma/client";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import MetricService from "@/modules/metrics/services/MetricService";
import { prisma } from "@/db/config/prisma/database";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import MetricsSummaryClient from "./summary-client";

const defaultGroupBy = ["function"];

type ItemDto = {
  id: string;
  userId: string | null;
  tenantId: string | null;
  function: string;
  route: string;
  url: string;
  env: string;
  type: string;
  _avg: {
    duration: number | null;
  };
  _count: {
    _all: number;
  };
};

type LoaderData = {
  items: ItemDto[];
  users: { id: string; email: string }[];
  tenants: { id: string; name: string }[];
  filterableProperties: FilterablePropertyDto[];
};

function getGroupByValues(searchParams: URLSearchParams) {
  const groupByValues = searchParams
    .getAll("groupBy")
    .filter((x) => x)
    .sort();
  const groupBy: Prisma.MetricLogScalarFieldEnum[] = [];
  for (const param of groupByValues) {
    if (Object.keys(Prisma.MetricLogScalarFieldEnum).includes(param)) {
      groupBy.push(param as Prisma.MetricLogScalarFieldEnum);
    }
  }
  return groupBy.length > 0 ? groupBy.map((x) => x.toString()) : defaultGroupBy;
}

async function getMetricsData(searchParams: URLSearchParams): Promise<LoaderData> {
  const request = new Request(`http://localhost?${searchParams.toString()}`);
  await verifyUserHasPermission("admin.metrics.view");
  const { filterableProperties, whereFilters } = await MetricService.getFilters({ request });

  let users: { id: string; email: string }[] = [];
  let tenants: { id: string; name: string }[] = [];

  let groupBy = getGroupByValues(searchParams);
  let items: ItemDto[] = [];
  if (groupBy.length > 0) {
    const data = await prisma.metricLog.groupBy({
      by: groupBy.map((x) => x as Prisma.MetricLogScalarFieldEnum),
      where: whereFilters,
      _avg: { duration: true },
      _count: { _all: true },
      orderBy: {
        _avg: { duration: "desc" },
      },
    });
    items = data.map((x, index) => ({ ...x, id: `group-${index}` } as ItemDto));
    const userIds: string[] = [];
    const tenantIds: string[] = [];
    for (const item of items) {
      if (item.userId && !userIds.includes(item.userId)) {
        userIds.push(item.userId);
      }
      if (item.tenantId && !tenantIds.includes(item.tenantId)) {
        tenantIds.push(item.tenantId);
      }
    }
    users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true },
    });
    tenants = await prisma.tenant.findMany({
      where: { id: { in: tenantIds } },
      select: { id: true, name: true },
    });
  }
  return {
    items,
    users,
    tenants,
    filterableProperties,
  };
}

export default async function MetricsSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const params = new URLSearchParams();

  // Convert searchParams to URLSearchParams
  Object.entries(resolvedSearchParams || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value) {
      params.set(key, value);
    }
  });

  const data = await getMetricsData(params);

  return <MetricsSummaryClient initialData={data} />;
}
