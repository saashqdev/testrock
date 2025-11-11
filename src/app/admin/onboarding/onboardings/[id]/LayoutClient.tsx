"use client";

import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import TabsVertical from "@/components/ui/tabs/TabsVertical";

type LayoutClientProps = {
  item: OnboardingWithDetailsDto;
  children: React.ReactNode;
};

export default function LayoutClient({ item, children }: LayoutClientProps) {
  const { t } = useTranslation();
  const params = useParams();

  return (
    <div>
      <EditPageLayout
        title={`${t(item.title)}`}
        menu={[
          {
            title: t("onboarding.object.plural"),
            routePath: "/admin/onboarding/onboardings",
          },
          {
            title: item.title,
          },
        ]}
        withHome={false}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 xl:gap-12">
          <div className="lg:col-span-3">
            <TabsVertical
              exact={true}
              tabs={[
                {
                  name: t("shared.overview"),
                  routePath: `/admin/onboarding/onboardings/${params.id}`,
                },
                {
                  name: t("onboarding.object.steps") + ` (${item.filters.length})`,
                  routePath: `/admin/onboarding/onboardings/${params.id}/steps`,
                },
                {
                  name: t("onboarding.object.filters") + ` (${item.filters.length})`,
                  routePath: `/admin/onboarding/onboardings/${params.id}/filters`,
                },
                {
                  name: t("onboarding.session.plural") + ` (${item.sessions.length})`,
                  routePath: `/admin/onboarding/onboardings/${params.id}/sessions`,
                },
                {
                  name: t("shared.dangerZone"),
                  routePath: `/admin/onboarding/onboardings/${params.id}/danger`,
                },
              ]}
            />
          </div>
          <div className="lg:col-span-9">
            <div className="w-full">{children}</div>
          </div>
        </div>
      </EditPageLayout>
    </div>
  );
}
