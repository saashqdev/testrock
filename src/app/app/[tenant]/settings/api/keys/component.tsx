"use client";

import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { PlanFeatureUsageDto } from "@/lib/dtos/subscriptions/PlanFeatureUsageDto";
import ApiKeysTable from "@/components/core/apiKeys/ApiKeysTable";
import CheckPlanFeatureLimit from "@/components/core/settings/subscription/CheckPlanFeatureLimit";
import InfoBanner from "@/components/ui/banners/InfoBanner";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import UrlUtils from "@/utils/app/UrlUtils";
import { useAppData } from "@/lib/state/useAppData";
import { ApiKeyWithDetailsDto } from "@/db/models/apiKeys/ApiKeysModel";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";

type PageData = {
  apiKeys: ApiKeyWithDetailsDto[];
  featurePlanUsage: PlanFeatureUsageDto | undefined;
};

interface ApiKeysClientPageProps {
  data: PageData;
}

export function ApiKeysClientPage({ data }: ApiKeysClientPageProps) {
  const { t } = useTranslation();
  const appData = useAppData();
  const params = useParams();

  return (
    <>
      <EditPageLayout
        tabs={[
          {
            name: t("shared.overview"),
            routePath: UrlUtils.getModulePath(params, "api"),
          },
          {
            name: t("models.apiCall.plural"),
            routePath: UrlUtils.getModulePath(params, "api/logs"),
          },
          {
            name: t("models.apiKey.plural"),
            routePath: UrlUtils.getModulePath(params, "api/keys"),
          },
          {
            name: "Docs",
            routePath: UrlUtils.getModulePath(params, "api/docs"),
          },
        ]}
      >
        <CheckPlanFeatureLimit item={data.featurePlanUsage} hideContent={false}>
          <div className="space-y-2">
            <ApiKeysTable
              entities={appData?.entities ?? []}
              items={data.apiKeys}
              withTenant={false}
              canCreate={appData ? getUserHasPermission(appData, "app.settings.apiKeys.create") : false}
            />
            {data.featurePlanUsage?.enabled && (
              <InfoBanner title="API usage" text="API calls remaining: ">
                {data.featurePlanUsage?.remaining === "unlimited" ? (
                  <span>{t("shared.unlimited")}</span>
                ) : (
                  <span>
                    <b>
                      {t("shared.remaining")} {data.featurePlanUsage.remaining}
                    </b>
                  </span>
                )}
              </InfoBanner>
            )}
          </div>
        </CheckPlanFeatureLimit>
      </EditPageLayout>
    </>
  );
}
