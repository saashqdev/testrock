import { getServerTranslations } from "@/i18n/server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import PeriodHelper, { defaultPeriodFilter, PeriodFilter } from "@/lib/helpers/PeriodHelper";
import { getAdminDashboardStats } from "@/utils/services/adminDashboardService";
import { getSetupSteps } from "@/utils/services/setupService";
import { TenantWithUsageDto } from "@/db/models/accounts/TenantsModel";
import { SetupItem } from "@/lib/dtos/setup/SetupItem";
import { Stat } from "@/lib/dtos/stats/Stat";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { createMetrics } from "@/modules/metrics/services/server/MetricTracker";
import { promiseHash } from "@/utils/promises/promiseHash";
import Component from "./component";
import { db } from "@/db";
import TitleDataLayout from "@/context/TitleDataLayout";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  const siteTags = getDefaultSiteTags();
  return {
    title: `${t("app.sidebar.dashboard")} | ${siteTags.title}`,
  };
}

export type AdminDashboardLoaderData = {
  title: string;
  stats: Stat[];
  setupSteps: SetupItem[];
  tenants: {
    items: TenantWithUsageDto[];
    pagination: PaginationDto;
  };
};

async function load(props: IServerComponentsProps): Promise<AdminDashboardLoaderData> {
  const params = (await props.params) || {};
  const searchParams = (await props.searchParams) || {};
  const request = props.request;

  await requireAuth();

  const { time, getServerTimingHeader } = await createMetrics({ request: request || new Request("http://localhost"), params }, "admin.dashboard");

  // Convert searchParams to URLSearchParams for compatibility
  const urlSearchParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => urlSearchParams.append(key, v));
      } else {
        urlSearchParams.set(key, value);
      }
    }
  });

  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);

  const { t } = await time(getServerTranslations(), "getTranslations");

  // Get period from searchParams
  const period = typeof searchParams.period === "string" ? searchParams.period : defaultPeriodFilter;
  const gte = PeriodHelper.getCreatedAt(period as PeriodFilter).gte;

  const { stats, setupSteps, tenants } = await time(
    promiseHash({
      stats: time(getAdminDashboardStats({ gte }), "admin.dashboard.details.getAdminDashboardStats"),
      setupSteps: time(getSetupSteps(), "admin.dashboard.details.getSetupSteps"),
      tenants: time(db.tenants.adminGetAllTenantsWithUsage(undefined, currentPagination), "admin.dashboard.details.adminGetAllTenantsWithUsage"),
    }),
    "admin.dashboard.details"
  );

  const siteTags = getDefaultSiteTags();
  const data: AdminDashboardLoaderData = {
    title: `${t("app.sidebar.dashboard")} | ${siteTags.title}`,
    stats,
    setupSteps,
    tenants,
  };

  return data;
}

export default async function AdminDashboardPage(props: IServerComponentsProps) {
  const data = await load(props);

  return (
    <TitleDataLayout data={{ title: data.title }}>
      <Component data={data} />
    </TitleDataLayout>
  );
}
