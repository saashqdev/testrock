import { getServerTranslations } from "@/i18n/server";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import EmailMarketingService, { EmailMarketingSummaryDto } from "../services/EmailMarketingService";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export namespace EmailMarketing_Summary {
  export type LoaderData = {
    title: string;
    summary: EmailMarketingSummaryDto;
  };

  export const loader = async (props: IServerComponentsProps) => {
    const params = (await props.params) || {};
    const request = props.request!;
    await requireAuth();
    const { t } = await getServerTranslations();
    const tenantId = await getTenantIdOrNull({ request, params });
    const data: LoaderData = {
      title: `${t("emailMarketing.title")} | ${process.env.APP_NAME}`,
      summary: await EmailMarketingService.getSummary(tenantId),
    };
    return data;
  };
}
