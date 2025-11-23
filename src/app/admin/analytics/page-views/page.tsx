import { AnalyticsPageView, AnalyticsUniqueVisitor, Prisma } from "@prisma/client";
import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { prisma } from "@/db/config/prisma/database";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import RowFiltersHelper from "@/lib/helpers/RowFiltersHelper";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import PageViewsClient from "./component";
import { db } from "@/db";

export type LoaderData = {
  items: (AnalyticsPageView & {
    uniqueVisitor: AnalyticsUniqueVisitor & {
      user: { email: string } | null;
    };
    portal: { id: string; title: string } | null;
  })[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
  portalsConfig: { enabled?: boolean; analytics?: boolean } | null | undefined;
};

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return defaultSeoMetaTags({
    title: `${t("analytics.pageViews")} | ${getDefaultSiteTags.title}`,
  });
}

async function getPageViewsData(props: IServerComponentsProps): Promise<LoaderData> {
  await verifyUserHasPermission("admin.analytics.view");
  const appConfiguration = await db.appConfiguration.getAppConfiguration();

  // Handle searchParams - can be a Promise in Next.js 15
  const resolvedSearchParams = props.searchParams ? await Promise.resolve(props.searchParams) : {};
  const urlSearchParams = new URLSearchParams(
    Object.entries(resolvedSearchParams)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : String(value)])
  );
  const pagination = getPaginationFromCurrentUrl(urlSearchParams);

  const allRoutes = await prisma.analyticsPageView.groupBy({
    by: ["route"],
  });

  const allUserIds = await prisma.analyticsUniqueVisitor.groupBy({
    by: ["userId"],
  });
  const allUsers = await db.users.getUsersById(allUserIds.map((f) => f.userId ?? ""));

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "route",
      title: "analytics.route",
      options: allRoutes
        .filter((f) => f.route)
        .map((f) => {
          return { value: f.route ?? "", name: f.route ?? "" };
        }),
    },
    {
      name: "userId",
      title: "models.user.object",
      manual: true,
      options: [
        { name: "- Anonymous -", value: "null" },
        ...allUsers.map((f) => {
          return { value: f.id, name: f.email };
        }),
      ],
    },
    {
      name: "cookie",
      title: "Cookie",
      manual: true,
    },
  ];
  if (appConfiguration.portals?.enabled && appConfiguration.portals?.analytics) {
    filterableProperties.push({
      name: "portalId",
      title: "Portal",
      options: [
        {
          value: "null",
          name: "- None -",
        },
        ...(await prisma.portal.findMany({ select: { id: true, title: true } }).then((f) => f.map((p) => ({ value: p.id, name: p.title })))),
      ],
    });
  }

  // Create a mock Request object for the helper function
  const mockRequest = new Request(`http://localhost?${urlSearchParams.toString()}`);
  const filters = getFiltersFromCurrentUrl(mockRequest, filterableProperties);
  let where: Prisma.AnalyticsPageViewWhereInput = RowFiltersHelper.getFiltersCondition(filters);

  const cookieFilter = filters.properties.find((f) => f.name === "cookie");
  if (cookieFilter?.value) {
    where = { ...where, uniqueVisitor: { cookie: cookieFilter.value } };
  }

  const userFilter = filters.properties.find((f) => f.name === "userId");
  if (userFilter?.value) {
    where = { ...where, uniqueVisitor: { userId: userFilter.value === "null" ? null : userFilter.value } };
  }

  const items = await prisma.analyticsPageView.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    include: {
      uniqueVisitor: {
        include: {
          user: {
            select: { email: true },
          },
        },
      },
      portal: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    where,
  });
  const totalItems = await prisma.analyticsPageView.count({ where });

  // Serialize filterableProperties to ensure only plain data is passed to client
  const serializedFilterableProperties = filterableProperties.map((prop) => ({
    name: prop.name,
    title: prop.title,
    manual: prop.manual,
    condition: prop.condition,
    value: prop.value,
    options: prop.options,
    isNumber: prop.isNumber,
    isBoolean: prop.isBoolean,
    hideSearch: prop.hideSearch,
  }));

  const data: LoaderData = {
    items,
    filterableProperties: serializedFilterableProperties,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
    },
    portalsConfig: appConfiguration.portals,
  };
  return data;
}

export default async function AdminAnalyticsPageViewsPage(props: IServerComponentsProps) {
  const data = await getPageViewsData(props);

  return <PageViewsClient data={data} portalsConfig={data.portalsConfig} />;
}
