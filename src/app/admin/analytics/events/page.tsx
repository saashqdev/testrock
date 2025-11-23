import { AnalyticsEvent, AnalyticsUniqueVisitor } from "@prisma/client";
import { headers } from "next/headers";
import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { prisma } from "@/db/config/prisma/database";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import RowFiltersHelper from "@/lib/helpers/RowFiltersHelper";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import AnalyticsEventsClient from "./component";
import { db } from "@/db";

type LoaderData = {
  items: (AnalyticsEvent & { uniqueVisitor: AnalyticsUniqueVisitor })[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return defaultSeoMetaTags({
    title: `${t("analytics.events")} | ${getDefaultSiteTags.title}`,
  });
}

async function getData(searchParams: URLSearchParams): Promise<LoaderData> {
  const headersList = await headers();
  const request = new Request(`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}?${searchParams.toString()}`, {
    headers: headersList,
  });

  await verifyUserHasPermission("admin.analytics.view");

  const allActions = await prisma.analyticsEvent.groupBy({
    by: ["action"],
  });
  const allCategories = await prisma.analyticsEvent.groupBy({
    where: { category: { not: null } },
    by: ["category"],
  });
  const allLabels = await prisma.analyticsEvent.groupBy({
    where: { label: { not: null } },
    by: ["label"],
  });
  const allValues = await prisma.analyticsEvent.groupBy({
    where: { value: { not: null } },
    by: ["value"],
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
      name: "featureFlagId",
      title: "featureFlags.object",
      options: (await db.featureFlags.getFeatureFlags({ enabled: undefined })).map((item) => {
        return {
          value: item.id,
          name: item.name,
        };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);

  const pagination = getPaginationFromCurrentUrl(searchParams);
  const items = await prisma.analyticsEvent.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    include: { uniqueVisitor: true },
    orderBy: {
      createdAt: "desc",
    },
    where: RowFiltersHelper.getFiltersCondition(filters),
  });
  const totalItems = await prisma.analyticsEvent.count({ where: RowFiltersHelper.getFiltersCondition(filters) });

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

export default async function AdminAnalyticsEventsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const urlSearchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => urlSearchParams.append(key, v));
      } else {
        urlSearchParams.set(key, value);
      }
    }
  });

  const data = await getData(urlSearchParams);

  return <AnalyticsEventsClient {...data} />;
}
