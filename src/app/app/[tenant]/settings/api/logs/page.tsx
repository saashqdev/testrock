import { getServerTranslations } from "@/i18n/server";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import ApiKeyLogsDetails from "@/modules/api/components/ApiKeyLogsDetails";
import { ApiKeyLogDto } from "@/modules/api/dtos/ApiKeyLogDto";
import ApiKeyLogService from "@/modules/api/services/ApiKeyLogService";
import UrlUtils from "@/utils/app/UrlUtils";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

type LoaderData = {
  items: ApiKeyLogDto[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const request = props.request!;  
  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission("app.settings.apiKeys.view", tenantId);
  const { items, filterableProperties, pagination } = await ApiKeyLogService.getDetails({ request, params });
  const data: LoaderData = {
    items,
    filterableProperties,
    pagination,
  };
  return data;
}

export default async function AdminApiLogsRoute(props: IServerComponentsProps) {
  const data = await getData(props);
  const params = (await props.params) || {};
  const { t } = await getServerTranslations();
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
      <ApiKeyLogsDetails data={data} />
    </EditPageLayout>
  );
}
