import { getServerTranslations } from "@/i18n/server";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import ApiSpecs from "@/modules/api/components/ApiSpecs";
import ApiSpecsService, { ApiSpecsDto } from "@/modules/api/services/ApiSpecsService";
import UrlUtils from "@/utils/app/UrlUtils";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

type LoaderData = {
  apiSpecs: ApiSpecsDto;
};

async function getData(props: IServerComponentsProps) {
  const request = props.request!;
  const apiSpecs = await ApiSpecsService.generateSpecs({ request });
  const data: LoaderData = {
    apiSpecs,
  };
  return data;
}

export default async function AdminApiDocsRoute(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const data = await getData(props);
  const { t } = await getServerTranslations();
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
        <ApiSpecs item={data.apiSpecs} />
      </EditPageLayout>
    </>
  );
}
