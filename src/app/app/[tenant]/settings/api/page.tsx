import Link from "next/link";
import { Fragment } from "react";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import ServerError from "@/components/ui/errors/ServerError";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import ApiKeyLogsSummary from "@/modules/api/components/ApiKeyLogsSummary";
import { ApiCallSummaryDto } from "@/modules/api/dtos/ApiCallSummaryDto";
import ApiKeyLogService from "@/modules/api/services/ApiKeyLogService";
import UrlUtils from "@/utils/app/UrlUtils";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { getServerTranslations } from "@/i18n/server";
import { headers } from "next/headers";

type LoaderData =
  | { error: string }
  | {
      items: ApiCallSummaryDto[];
      allTenants: { id: string; name: string }[];
      filterableProperties: FilterablePropertyDto[];
    };

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const request = props.request!;  
  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission("app.settings.apiKeys.view", tenantId);
  try {
    const appConfiguration = await db.appConfiguration.getAppConfiguration();
    if (!appConfiguration.app.features.tenantApiKeys) {
      throw Error("API keys are not enabled");
    }
    const { items, filterableProperties } = await ApiKeyLogService.getSummary({ request, params });
    const data: LoaderData = {
      items,
      allTenants: [],
      filterableProperties,
    };
    return data;
  } catch (e: any) {
    return { error: e.message };
  }
}

export default async function ApiSettingsPage(props: IServerComponentsProps) {
  const { t } = await getServerTranslations();
  const params = (await props.params) || {};
  
  // Create request object from headers
  const headersList = await headers();
  const request = new Request(headersList.get("x-url") || "", {
    headers: headersList,
  });
  
  const data = await getData({ ...props, request });
  return (
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
      {"error" in data ? (
        <ErrorBanner title={t(data.error)}>
          <Link href="." className="underline">
            {t("shared.clickHereToTryAgain")}
          </Link>
        </ErrorBanner>
      ) : (
        <Fragment>
          <ApiKeyLogsSummary data={data} />
        </Fragment>
      )}
    </EditPageLayout>
  );
}
