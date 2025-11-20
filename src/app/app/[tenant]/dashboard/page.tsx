import { getServerTranslations } from "@/i18n/server";
import { getAppDashboardStats } from "@/utils/services/appDashboardService";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { Stat } from "@/lib/dtos/stats/Stat";
import PeriodHelper from "@/lib/helpers/PeriodHelper";
import ServerError from "@/components/ui/errors/ServerError";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { createMetrics } from "@/modules/metrics/services/server/MetricTracker";
import { promiseHash } from "@/utils/promises/promiseHash";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { DashboardLoaderData, loadDashboardData } from "@/lib/state/useDashboardData.server";
import DashboardClient from "./component";
import TitleDataLayout from "@/context/TitleDataLayout";

export { serverTimingHeaders as headers };

export const metadata = {
  title: `Dashboard | ${process.env.APP_NAME}`,
};

type LoaderData = DashboardLoaderData & {
  title: string;
  stats: Stat[];
};

export default async function DashboardPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  const searchParams = (await props.searchParams) || {};  
  await requireAuth();
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "app.$tenant.dashboard");
  let { t } = await getServerTranslations();
  const tenantId = await time(getTenantIdFromUrl(params), "getTenantIdFromUrl");
  const tenant = await time(db.tenants.getTenant(tenantId), "getTenant");

  const { stats, dashboardData } = await time(
    promiseHash({
      stats: getAppDashboardStats({ t, tenant, gte: PeriodHelper.getGreaterThanOrEqualsFromRequest( searchParams ) }),
      dashboardData: loadDashboardData({ request, params }),
    }),
    "app.$tenant.dashboard.details"
  );

  const data: LoaderData = {
    title: `${t("app.sidebar.dashboard")} | ${process.env.APP_NAME}`,
    ...dashboardData,
    stats,
  };

  return (
    <TitleDataLayout data={{ title: data.title }}>
      <DashboardClient data={data} />
    </TitleDataLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
