import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getUserInfo } from "@/lib/services/session.server";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export namespace OnboardingIndexApi {
  export type LoaderData = {
    meta: MetaTagsDto;
    items: OnboardingWithDetailsDto[];
    groupByStatus: { status: string; count: number }[];
  };
  export const loader = async (props: IServerComponentsProps) => {
    await verifyUserHasPermission("admin.onboarding.view");
    const { t } = await getServerTranslations();
    const searchParams = await props.searchParams;
    // const currentPagination = getPaginationFromCurrentUrl(searchParams);
    const status = searchParams?.status;
    const items = await db.onboarding.getOnboardings({
      active: status === "active" ? true : status === "inactive" ? false : undefined,
    });
    const groupByStatus: { status: string; count: number }[] = [];
    items.forEach((item) => {
      if (item.active) {
        const index = groupByStatus.findIndex((item) => item.status === "active");
        if (index === -1) {
          groupByStatus.push({ status: "active", count: 1 });
        } else {
          groupByStatus[index].count++;
        }
      } else if (!item.active) {
        const index = groupByStatus.findIndex((item) => item.status === "inactive");
        if (index === -1) {
          groupByStatus.push({ status: "inactive", count: 1 });
        } else {
          groupByStatus[index].count++;
        }
      }
    });

    const data: LoaderData = {
      meta: [{ title: `${t("onboarding.title")} | ${process.env.APP_NAME}` }],
      items,
      groupByStatus,
    };
    return data;
  };

  export type ActionData = {
    error?: string;
  };
  export const action = async (props: IServerComponentsProps) => {
    const request = props.request!;
    await verifyUserHasPermission("admin.onboarding.update");
    const { t } = await getServerTranslations();
    const form = await request.formData();
    const userInfo = await getUserInfo();
    const action = form.get("action");
    if (action === "create") {
      await verifyUserHasPermission("admin.onboarding.create");
      const title = form.get("title")?.toString() ?? "";
      if (!title) {
        return Response.json({ error: "Onboarding title is required" }, { status: 400 });
      }
      const onboarding = await db.onboarding.createOnboarding({
        title,
        type: "modal",
        active: false,
        realtime: false,
        canBeDismissed: true,
        height: "xl",
        filters: [{ type: "user.is", value: userInfo.userId }],
        steps: [],
      });
      return redirect(`/admin/onboarding/onboardings/${onboarding.id}`);
    } else {
      return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  };
}
