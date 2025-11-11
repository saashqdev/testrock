import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import UrlUtils from "@/utils/app/UrlUtils";
import { ApiKeyWithDetailsDto } from "@/db/models/apiKeys/ApiKeysModel";
import { getApiKeyEntityPermissions } from "@/lib/helpers/server/ApiKeyHelperService";
import EventsService from "@/modules/events/services/.server/EventsService";
import { getUserInfo } from "@/lib/services/session.server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { ApiKeyUpdatedDto } from "@/modules/events/dtos/ApiKeyUpdatedDto";
import { ApiKeyDeletedDto } from "@/modules/events/dtos/ApiKeyDeletedDto";
import { prisma } from "@/db/config/prisma/database";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import Component from "./component";

type LoaderData = {
  item: ApiKeyWithDetailsDto;
};

const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;  
  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission("app.settings.apiKeys.update", tenantId);
  const item = await db.apiKeys.getApiKeyById(params.id ?? "");
  if (!item) {
    redirect(UrlUtils.currentTenantUrl(params, "settings/api/keys"));
  }
  const data: LoaderData = {
    item,
  };
  return data;
};

export default async function ApiEditKeyRoute(props: IServerComponentsProps) {
  const data = await loader(props);
  return <Component data={data} />;
}
