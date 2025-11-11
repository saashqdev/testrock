import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import PeriodHelper from "@/lib/helpers/PeriodHelper";
import AnalyticsService, { AnalyticsOverviewDto } from "@/lib/helpers/server/AnalyticsService";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import AnalyticsOverviewClient from "./component";

type LoaderData = {
  overview: AnalyticsOverviewDto;
};

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("analytics.overview")} | ${defaultSiteTags.title}`,
  });
}

async function getAnalyticsData(props: IServerComponentsProps): Promise<LoaderData> {
  const request = props.request!;
  await verifyUserHasPermission("admin.analytics.view");
  const data: LoaderData = {
    overview: await AnalyticsService.getAnalyticsOverview({
      withUsers: true,
      period: PeriodHelper.getPeriodFromRequest({ request }),
      portalId: undefined,
    }),
  };
  return data;
}

export default async function AdminAnalyticsOverviewPage(props: IServerComponentsProps) {
  const { overview } = await getAnalyticsData(props);
  
  return (
    <EditPageLayout>
      <AnalyticsOverviewClient overview={overview} />
    </EditPageLayout>
  );
}
