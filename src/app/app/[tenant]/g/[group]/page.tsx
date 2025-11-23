import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { getAppDashboardStats } from "@/utils/services/appDashboardService";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { Stat } from "@/lib/dtos/stats/Stat";
import PeriodHelper from "@/lib/helpers/PeriodHelper";
import ServerError from "@/components/ui/errors/ServerError";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { EntityGroupWithDetailsDto } from "@/db/models/entityBuilder/EntityGroupsModel";
import UrlUtils from "@/utils/app/UrlUtils";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import GroupIndexClient from "./GroupIndexClient";

export { serverTimingHeaders as headers };

type PageData = {
  title: string;
  group: EntityGroupWithDetailsDto;
  stats: Stat[];
};

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const params = (await props.params) || {};
  await requireAuth();
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdFromUrl(params);
  const group = await db.entityGroups.getEntityGroupBySlug(params.group!);

  if (!group) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: `${t(group.title)} | ${process.env.APP_NAME}`,
  };
}

async function getData(props: IServerComponentsProps): Promise<PageData> {
  const params = (await props.params) || {};
  await requireAuth();
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdFromUrl(params);
  const group = await db.entityGroups.getEntityGroupBySlug(params.group!);
  const tenant = await db.tenants.getTenant(tenantId);

  if (!group) {
    redirect(tenantId ? UrlUtils.currentTenantUrl(params, "404") : "/404");
  }

  const stats = await getAppDashboardStats({
    t,
    tenant,
    gte: PeriodHelper.getGreaterThanOrEqualsFromRequest(),
    entities: group.entities.flatMap((e) => e.entity),
  });

  stats
    .filter((f) => f.entity)
    .forEach((stat) => {
      stat.path = tenantId ? `/app/${tenantId}/g/${params.group}/${stat.entity?.slug}` : `/admin/g/${params.group}/${stat.entity?.slug}`;
    });

  return {
    title: `${t(group.title)} | ${process.env.APP_NAME}`,
    group,
    stats,
  };
}

export default async function GroupIndexRoute(props: IServerComponentsProps) {
  const data = await getData(props);

  return <GroupIndexClient group={data.group} stats={data.stats} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
