import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { GetRowsData, getAll } from "@/utils/api/server/RowsApi";
import UrlUtils from "@/utils/app/UrlUtils";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { Routes, getNoCodeRoutes } from "@/utils/api/server/EntitiesApi";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import AllPageClient from "../all.client";

type LoaderData = {
  title: string;
  entitiesData: { [entity: string]: GetRowsData };
  entitiesRoutes: { [entity: string]: Routes };
};

export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdOrNull({ request, params });
  const group = await db.entityGroups.getEntityGroupBySlug(params.group!);
  if (!group) {
    throw redirect(tenantId ? UrlUtils.currentTenantUrl(params, "404") : "/404");
  }
  const urlSearchParams = new URL(request.url).searchParams;
  const allEntities = await db.entities.getAllEntities(null);
  const entitiesData: LoaderData["entitiesData"] = {};
  const entitiesRoutes: LoaderData["entitiesRoutes"] = {};
  await Promise.all(
    group.entities.map(async ({ entityId, allView }) => {
      const entity = allEntities.find((f) => f.id === entityId);
      if (!entity) {
        return;
      }
      const data = await getAll({
        entity,
        tenantId,
        urlSearchParams,
        entityView: allView ?? undefined,
      });
      entitiesData[entity.name] = data;
      entitiesRoutes[entity.name] = getNoCodeRoutes({ request, params });
      return entitiesData;
    })
  );
  const data: LoaderData = {
    title: `${t(group.title)} | ${process.env.APP_NAME}`,
    entitiesData,
    entitiesRoutes,
  };
  return data;
};

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  return {
    title: data.title,
  };
}

export default async function AllPage(props: IServerComponentsProps) {
  const data = await loader(props);
  const params = (await props.params) || {};

  return <AllPageClient data={data} groupSlug={params.group!} />;
}
