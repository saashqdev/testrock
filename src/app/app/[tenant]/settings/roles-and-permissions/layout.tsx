import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import UrlUtils from "@/utils/app/UrlUtils";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import RolesAndPermissionsLayout from "./layout-component";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("models.role.plural")} | ${process.env.APP_NAME}`,
  };
}

export default async function RolesAndPermissionsLayoutServer(props: IServerComponentsProps & { children: React.ReactNode }) {
  const params = (await props.params) || {};
  const request = props.request!;
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission("app.settings.roles.view", tenantId);

  if (request && UrlUtils.stripTrailingSlash(new URL(request.url).pathname) === UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions")) {
    redirect(UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions/users"));
  }

  return <RolesAndPermissionsLayout params={{ tenant: params.tenant }}>{props.children}</RolesAndPermissionsLayout>;
}
