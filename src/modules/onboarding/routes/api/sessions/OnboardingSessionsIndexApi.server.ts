import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { getServerTranslations } from "@/i18n/server";
import { OnboardingFilterMetadataDto } from "@/modules/onboarding/dtos/OnboardingFilterMetadataDto";
import OnboardingService from "@/modules/onboarding/services/OnboardingService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { OnboardingSessionWithDetailsDto } from "@/db/models/onboarding/OnboardingSessionsModel";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export namespace OnboardingSessionsIndexApi {
  export type LoaderData = {
    meta: MetaTagsDto;
    items: OnboardingSessionWithDetailsDto[];
    pagination: PaginationDto;
    filterableProperties: FilterablePropertyDto[];
    metadata: OnboardingFilterMetadataDto;
  };
  export const loader = async (props: IServerComponentsProps) => {
    const params = (await props.params) || {};
    const request = props.request!;
    await verifyUserHasPermission("admin.onboarding.view");
    const { t } = await getServerTranslations();
    const allOnboardings = await db.onboardingSessions.getOnboardingSessions({});
    const users = await db.users.getUsersById(allOnboardings.map((x) => x.userId));
    const filterableProperties: FilterablePropertyDto[] = [
      {
        name: "onboardingId",
        title: t("onboarding.title"),
        options: [
          ...allOnboardings.map((i) => {
            return { value: i.id, name: i.onboarding.title };
          }),
        ],
      },
      {
        name: "userId",
        title: t("models.user.object"),
        options: [
          ...users.map((i) => {
            return { value: i.id, name: i.email + " - " + i.firstName + " " + i.lastName };
          }),
        ],
      },
      {
        name: "tenantId",
        title: t("models.tenant.object"),
        options: [
          { name: "{Admin}", value: "null" },
          ...(await db.tenants.adminGetAllTenantsIdsAndNames()).map((i) => {
            return { value: i.id, name: i.name };
          }),
        ],
      },
    ];
    const filters = getFiltersFromCurrentUrl(request, filterableProperties);
    const urlSearchParams = new URL(request.url).searchParams;
    const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
    const tenantId = filters.properties.find((f) => f.name === "tenantId")?.value;
    const { items, pagination } = await db.onboardingSessions.getOnboardingSessionsWithPagination({
      pagination: currentPagination,
      where: {
        onboardingId: params.id,
        tenantId: tenantId === "null" ? null : tenantId ?? undefined,
      },
    });
    const data: LoaderData = {
      meta: [{ title: `${t("onboarding.title")} | ${process.env.APP_NAME}` }],
      items,
      pagination,
      filterableProperties,
      metadata: await OnboardingService.getMetadata(),
    };
    return data;
  };

  export type ActionData = {
    error?: string;
    success?: string;
  };
  export const action = async (props: IServerComponentsProps) => {
    const request = props.request!;
    await verifyUserHasPermission("admin.onboarding.update");
    const { t } = await getServerTranslations();
    const form = await request.formData();
    const action = form.get("action");
    if (action === "delete") {
      await verifyUserHasPermission("admin.onboarding.delete");
      const id = form.get("id")?.toString() ?? "";
      if (!id) {
        return Response.json({ error: "Session ID is required" }, { status: 400 });
      }
      const session = await db.onboardingSessions.getOnboardingSession(id);
      await db.onboardingSessionStep.deleteOnboardingSessionSteps(session!.sessionSteps.map((s) => s.id));
      await db.onboardingSessions.deleteOnboardingSession(id);
      return Response.json({ success: "Onboarding session deleted" });
    } else {
      return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  };
}
