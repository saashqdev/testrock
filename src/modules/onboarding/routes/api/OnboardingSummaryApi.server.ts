import { getServerTranslations } from "@/i18n/server";
import { OnboardingSessionWithDetailsDto } from "@/db/models/onboarding/OnboardingSessionsModel";
import { OnboardingFilterMetadataDto } from "../../dtos/OnboardingFilterMetadataDto";
import OnboardingService, { OnboardingSummaryDto } from "../../services/OnboardingService";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export namespace OnboardingSummaryApi {
  export type LoaderData = {
    meta: MetaTagsDto;
    summary: OnboardingSummaryDto;
    sessions: {
      items: OnboardingSessionWithDetailsDto[];
      metadata: OnboardingFilterMetadataDto;
    };
  };
  export const loader = async (props: IServerComponentsProps) => {
    const request = props.request!;
    await verifyUserHasPermission("admin.onboarding.view");
    const { t } = await getServerTranslations();

    const data: LoaderData = {
      meta: [{ title: `${t("onboarding.title")} | ${process.env.APP_NAME}` }],
      summary: await OnboardingService.getSummary(),
      sessions: {
        items: (
          await db.onboardingSessions.getOnboardingSessionsWithPagination({
            pagination: { page: 1, pageSize: 10 },
          })
        ).items,
        metadata: await OnboardingService.getMetadata(),
      },
    };
    return data;
  };
}
