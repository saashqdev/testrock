import { AnalyticsUniqueVisitor } from "@prisma/client";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { prisma } from "@/db/config/prisma/database";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import AdminAnalyticsVisitorsClient from "./component";

type LoaderData = {
  items: (AnalyticsUniqueVisitor & {
    _count: {
      pageViews: number;
      events: number;
    };
  })[];
  pagination: PaginationDto;
};

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("analytics.uniqueVisitors")} | ${defaultSiteTags.title}`,
  });
}

async function getVisitorsData(searchParams: { [key: string]: string | string[] | undefined }): Promise<LoaderData> {
  await verifyUserHasPermission("admin.analytics.view");
  const urlSearchParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      urlSearchParams.set(key, Array.isArray(value) ? value[0] : value);
    }
  });
  const pagination = getPaginationFromCurrentUrl(urlSearchParams);
  const items = await prisma.analyticsUniqueVisitor.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    include: {
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
  const totalItems = await prisma.analyticsUniqueVisitor.count({});
  const data: LoaderData = {
    items,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
    },
  };
  return data;
}

export default async function AdminAnalyticsVisitorsPage(props: IServerComponentsProps) {
  const searchParams = (await props.searchParams) || {};
  const data = await getVisitorsData(searchParams);

  return <AdminAnalyticsVisitorsClient data={data} />;
}
