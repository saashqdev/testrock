import { redirect } from "next/navigation";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { getServerTranslations } from "@/i18n/server";
import { OnboardingSessionWithDetailsDto } from "@/db/models/onboarding/OnboardingSessionsModel";
import { OnboardingSessionStatus } from "@/modules/onboarding/dtos/OnboardingSessionStatus";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export namespace OnboardingSessionOverviewApi {
  export type LoaderData = {
    meta: MetaTagsDto;
    item: OnboardingSessionWithDetailsDto;
  };
  export const loader = async (props: IServerComponentsProps) => {
    const params = (await props.params) || {};
    const request: Request = props.request!;
    await verifyUserHasPermission("admin.onboarding.view");
    const { t } = await getServerTranslations();
    const item = await db.onboardingSessions.getOnboardingSession(params.id!);
    if (!item) {
      throw redirect("/onboarding/sessions");
    }
    const data: LoaderData = {
      meta: [{ title: `${t("onboarding.session.object")} | ${process.env.APP_NAME}` }],
      item,
    };
    return data;
  };

  export type ActionData = {
    error?: string;
  };
  export const action = async (props: IServerComponentsProps) => {
    const params = (await props.params) || {};
    const request: Request = props.request!;
    await verifyUserHasPermission("admin.onboarding.update");
    const { t } = await getServerTranslations();
    const form = await request.formData();
    const action = form.get("action");
    const item = await db.onboardingSessions.getOnboardingSession(params.id!);
    if (!item) {
      return redirect("/onboarding/sessions");
    }
    if (action === "update") {
      const status = form.get("status")?.toString();
      const startedAt = form.get("startedAt")?.toString();
      const completedAt = form.get("completedAt")?.toString();
      const dismissedAt = form.get("dismissedAt")?.toString();
      await db.onboardingSessions.updateOnboardingSession(item.id, {
        status: status !== undefined ? (status as OnboardingSessionStatus) : undefined,
        startedAt: startedAt !== undefined ? new Date(startedAt) : undefined,
        completedAt: completedAt !== undefined ? new Date(completedAt) : undefined,
        dismissedAt: dismissedAt !== undefined ? new Date(dismissedAt) : undefined,
      });
      return Response.json({ success: true });
    } else if (action === "delete") {
      await verifyUserHasPermission("admin.onboarding.delete");
      await db.onboardingSessions.deleteOnboardingSession(item.id);
      return redirect("/onboarding/sessions");
    } else {
      return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  };
}
