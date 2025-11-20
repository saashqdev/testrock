import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { getUserPermission } from "@/lib/helpers/server/PermissionsService";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { GroupWithDetailsDto } from "@/db/models/permissions/GroupsModel";
import { getUserInfo } from "@/lib/services/session.server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import GroupsComponent from "./component";
import TitleDataLayout from "@/context/TitleDataLayout";

type PageData = {
  items: GroupWithDetailsDto[];
};

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("models.group.plural")} | ${process.env.APP_NAME}`,
  };
}

export default async function GroupsPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  await requireAuth();
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdFromUrl(params);
  const userInfo = await getUserInfo();

  const { permission, userPermission } = await getUserPermission({
    userId: userInfo.userId,
    permissionName: "app.settings.groups.full",
    tenantId: tenantId,
  });
  
  let items: GroupWithDetailsDto[];
  if (!permission || userPermission) {
    items = await db.groups.getAllGroups(tenantId);
  } else {
    items = await db.groups.getMyGroups(userInfo.userId, tenantId);
  }

  const data: PageData = {
    items,
  };

  const title = `${t("models.group.plural")} | ${process.env.APP_NAME}`;

  return (
    <TitleDataLayout data={{ title }}>
      <GroupsComponent data={data} />
    </TitleDataLayout>
  );
}
