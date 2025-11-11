import { AnalyticsUniqueVisitor, Portal, Prisma } from "@prisma/client";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { getServerTranslations } from "@/i18n/server";
import { prisma } from "@/db/config/prisma/database";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { db } from "@/db";
import AnalyticsVisitorsClient from "./analytics-visitors-client";
import { Metadata } from "next";

type LoaderData = {
  portal: Portal;
  items: (AnalyticsUniqueVisitor & {
    portalUser: { email: string } | null;
    _count: {
      pageViews: number;
      events: number;
    };
  })[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};

type Props = {
  params: Promise<{ tenant: string; portal: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("analytics.visitors")} | ${process.env.APP_NAME}`,
  };
}

export default async function AnalyticsVisitorsPage({ params, searchParams }: Props) {
  const { t } = await getServerTranslations();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const tenantId = await getTenantIdFromUrl(resolvedParams);
  const portal = await db.portals.getPortalById(tenantId, resolvedParams.portal);
  
  if (!portal) {
    throw new Error("Portal not found");
  }
  
  const allUsers = await prisma.portalUser.findMany({
    where: { portalId: portal.id },
    select: { id: true, email: true },
  });

  const filterableProperties: FilterablePropertyDto[] = [
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

  // Create a mock request object for compatibility with existing helpers
  const url = new URL(`http://localhost?${new URLSearchParams(resolvedSearchParams as any).toString()}`);
  const mockRequest = { url: url.toString() } as Request;
  
  const filters = getFiltersFromCurrentUrl(mockRequest, filterableProperties);
  let where: Prisma.AnalyticsUniqueVisitorWhereInput = {
    portalId: portal.id,
  };

  const urlSearchParams = new URL(mockRequest.url).searchParams;
  const pagination = getPaginationFromCurrentUrl(urlSearchParams);

  const cookieFilter = filters.properties.find((f) => f.name === "cookie");
  if (cookieFilter?.value) {
    where = { ...where, cookie: cookieFilter.value };
  }

  const portalUserFilter = filters.properties.find((f) => f.name === "portalUserId");
  if (portalUserFilter?.value) {
    where = { ...where, portalUserId: portalUserFilter.value === "null" ? null : portalUserFilter.value };
  }

  const items = await prisma.analyticsUniqueVisitor.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where,
    include: {
      portalUser: { select: { email: true } },
      _count: {
        select: {
          pageViews: true,
          events: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  
  const totalItems = await prisma.analyticsUniqueVisitor.count({
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

  return <AnalyticsVisitorsClient data={data} />;
}
