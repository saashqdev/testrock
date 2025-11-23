import { AnalyticsEvent, AnalyticsUniqueVisitor, Portal, Prisma } from "@prisma/client";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { getServerTranslations } from "@/i18n/server";
import { prisma } from "@/db/config/prisma/database";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { db } from "@/db";
import AnalyticsEventsClient from "./analytics-events-client";
import { Metadata } from "next";

type LoaderData = {
  portal: Portal;
  items: (AnalyticsEvent & {
    uniqueVisitor: AnalyticsUniqueVisitor & {
      portalUser: { email: string } | null;
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
    title: `${t("analytics.events")} | ${process.env.APP_NAME}`,
  };
}

export default async function AnalyticsEventsPage({ params, searchParams }: Props) {
  const { t } = await getServerTranslations();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const tenantId = await getTenantIdFromUrl(resolvedParams);
  const portal = await db.portals.getPortalById(tenantId, resolvedParams.portal);

  if (!portal) {
    throw new Error("Portal not found");
  }

  const allActions = await prisma.analyticsEvent.groupBy({
    by: ["action"],
    where: {
      portalId: portal.id,
    },
  });

  const allCategories = await prisma.analyticsEvent.groupBy({
    where: {
      portalId: portal.id,
      category: { not: null },
    },
    by: ["category"],
  });

  const allLabels = await prisma.analyticsEvent.groupBy({
    where: {
      portalId: portal.id,
      label: { not: null },
    },
    by: ["label"],
  });

  const allValues = await prisma.analyticsEvent.groupBy({
    where: {
      portalId: portal.id,
      value: { not: null },
    },
    by: ["value"],
  });

  const allUsers = await prisma.portalUser.findMany({
    where: { portalId: portal.id },
    select: { id: true, email: true },
  });

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "action",
      title: "analytics.action",
      options: allActions.map((f) => {
        return { value: f.action, name: f.action };
      }),
    },
    {
      name: "category",
      title: "analytics.category",
      options: allCategories.map((f) => {
        return { value: f.category ?? "", name: f.category ?? "" };
      }),
    },
    {
      name: "label",
      title: "analytics.label",
      options: allLabels.map((f) => {
        return { value: f.label ?? "", name: f.label ?? "" };
      }),
    },
    {
      name: "value",
      title: "analytics.value",
      options: allValues.map((f) => {
        return { value: f.value ?? "", name: f.value ?? "" };
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

  const url = new URL(`http://localhost?${new URLSearchParams(resolvedSearchParams as any).toString()}`);
  const mockRequest = { url: url.toString() } as Request;

  const filters = getFiltersFromCurrentUrl(mockRequest, filterableProperties);
  let where: Prisma.AnalyticsEventWhereInput = {
    portalId: portal.id,
  };

  const actionFilter = filters.properties.find((f) => f.name === "action");
  if (actionFilter?.value) {
    where = { ...where, action: actionFilter.value };
  }

  const categoryFilter = filters.properties.find((f) => f.name === "category");
  if (categoryFilter?.value) {
    where = { ...where, category: categoryFilter.value };
  }

  const labelFilter = filters.properties.find((f) => f.name === "label");
  if (labelFilter?.value) {
    where = { ...where, label: labelFilter.value };
  }

  const valueFilter = filters.properties.find((f) => f.name === "value");
  if (valueFilter?.value) {
    where = { ...where, value: valueFilter.value };
  }

  const cookieFilter = filters.properties.find((f) => f.name === "cookie");
  if (cookieFilter?.value) {
    where = { ...where, uniqueVisitor: { cookie: cookieFilter.value === "null" ? undefined : cookieFilter.value } };
  }

  const portalUserFilter = filters.properties.find((f) => f.name === "portalUserId");
  if (portalUserFilter?.value) {
    where = { ...where, uniqueVisitor: { portalUserId: portalUserFilter.value === "null" ? null : portalUserFilter.value } };
  }

  const urlSearchParams = new URL(mockRequest.url).searchParams;
  const pagination = getPaginationFromCurrentUrl(urlSearchParams);

  const items = await prisma.analyticsEvent.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where,
    include: {
      uniqueVisitor: {
        include: {
          portalUser: { select: { email: true } },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalItems = await prisma.analyticsEvent.count({
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

  return <AnalyticsEventsClient data={data} />;
}
