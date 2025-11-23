import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import UrlUtils from "@/utils/app/UrlUtils";
import { GroupWithDetailsDto } from "@/db/models/permissions/GroupsModel";
import { TenantUserWithUserDto } from "@/db/models/accounts/TenantsModel";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import EditGroupClient from "./component";

type LoaderData = {
  title: string;
  item: GroupWithDetailsDto;
  tenantUsers: TenantUserWithUserDto[];
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  await requireAuth();
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdFromUrl(params);

  const item = await db.groups.getGroup(params.id ?? "");
  if (!item) {
    redirect(UrlUtils.currentTenantUrl(params, "settings/members"));
  }
  const data: LoaderData = {
    title: `${item.name} | ${t("models.group.object")} | ${process.env.APP_NAME}`,
    item,
    tenantUsers: await db.tenants.getTenantUsers(tenantId),
  };
  return data;
}

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const params = (await props.params) || {};
  const { t } = await getServerTranslations();

  try {
    const item = await db.groups.getGroup(params.id ?? "");
    if (!item) {
      return {
        title: `${t("models.group.object")} | ${process.env.APP_NAME}`,
      };
    }

    return {
      title: `${item.name} | ${t("models.group.object")} | ${process.env.APP_NAME}`,
    };
  } catch {
    return {
      title: `${t("models.group.object")} | ${process.env.APP_NAME}`,
    };
  }
}

export default async function EditGroupRoute(props: IServerComponentsProps) {
  const data = await getData(props);
  return <EditGroupClient data={data} />;
}
