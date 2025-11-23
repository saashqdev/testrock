import { redirect } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/db";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { getServerTranslations } from "@/i18n/server";
import UrlUtils from "@/utils/app/UrlUtils";
import { prisma } from "@/db/config/prisma/database";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { AnalyticsPageView, AnalyticsUniqueVisitor, Portal, Prisma } from "@prisma/client";
import PageViewsClient from "./page-views-client";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  return {
    title: `Page Views | ${process.env.APP_NAME}`,
  };
}

type LoaderData = {
  portal: Portal;
  items: (AnalyticsPageView & {
    uniqueVisitor: AnalyticsUniqueVisitor & {
      portalUser: { email: string } | null;
    };
  })[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const resolvedParams = await props.params;
  const params = resolvedParams || {};
  const request = props.request!;
  const { t } = await getServerTranslations();

  await requireAuth();

  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await db.portals.getPortalById(tenantId, params.portal!);

  if (!portal) {
    redirect(UrlUtils.getModulePath(params, "portals"));
  }

  const url = new URL(request.url);
  const urlSearchParams = url.searchParams;
  const pagination = getPaginationFromCurrentUrl(urlSearchParams);

  const allRoutes = await prisma.analyticsPageView.groupBy({
    where: { portalId: portal.id },
    by: ["route"],
  });

  const allUsers = await prisma.portalUser.findMany({
    where: { portalId: portal.id },
    select: { id: true, email: true },
  });

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "route",
      title: "analytics.route",
      options: allRoutes.map((f) => {
        return { value: f.route ?? "", name: f.route ?? "" };
      }),
    },
    {
      name: "portalUserId",
      title: t("models.user.object"),
      options: allUsers.map((f) => {
        return { value: f.id, name: f.email };
      }),
    },
    {
      name: "cookie",
      title: "Cookie",
      manual: true,
    },
  ];

  // Create a mock request object for the legacy helper
  const mockRequest = {
    url: url.toString(),
  } as Request;

  const filters = getFiltersFromCurrentUrl(mockRequest, filterableProperties);

  let where: Prisma.AnalyticsPageViewWhereInput = {
    portalId: portal.id,
  };

  const routeFilter = filters.properties.find((f) => f.name === "route");
  if (routeFilter?.value) {
    where = { ...where, route: routeFilter.value === "null" ? null : routeFilter.value };
  }

  const cookieFilter = filters.properties.find((f) => f.name === "cookie");
  if (cookieFilter?.value) {
    where = { ...where, uniqueVisitor: { cookie: cookieFilter.value === "null" ? undefined : cookieFilter.value } };
  }

  const portalUserFilter = filters.properties.find((f) => f.name === "portalUserId");
  if (portalUserFilter?.value) {
    where = { ...where, uniqueVisitor: { portalUserId: portalUserFilter.value === "null" ? null : portalUserFilter.value } };
  }

  const items = await prisma.analyticsPageView.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where,
    include: {
      uniqueVisitor: {
        include: {
          user: {
            select: { email: true },
          },
          portalUser: {
            select: { email: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalItems = await prisma.analyticsPageView.count({
    where,
  });

  const data: LoaderData = {
    portal,
    items,
    filterableProperties,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
    },
  };

  return data;
}

export default async function PageViewsPage(props: IServerComponentsProps) {
  const data = await getData(props);
  const resolvedParams = await props.params;
  const params = resolvedParams || {};

  return <PageViewsClient data={data} params={params} />;
}
