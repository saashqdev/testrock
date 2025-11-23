// page.tsx for index.tsx
import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { EntityWithCountDto } from "@/db/models/entityBuilder/EntitiesModel";
import { EntityRelationshipWithDetailsDto } from "@/db/models/entityBuilder/EntityRelationshipsModel";
import EntitiesIndexClient from "./index";

type LoaderData = {
  title: string;
  items: EntityWithCountDto[];
  relationships: EntityRelationshipWithDetailsDto[];
};

async function loadData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.view");
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdOrNull({ request, params });
  const items = await db.entities.getAllEntitiesWithRowCount({ tenantId });
  const relationships = await db.entityRelationships.getAllEntityRelationships();

  const data: LoaderData = {
    title: `${t("models.entity.plural")} | ${process.env.APP_NAME}`,
    items,
    relationships,
  };
  return data;
}

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loadData(props);
  return { title: data.title };
}

export default async function (props: IServerComponentsProps) {
  const data = await loadData(props);
  return <EntitiesIndexClient data={data} />;
}
