import type { TFunction } from "i18next";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { promiseHash } from "@/utils/promises/promiseHash";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { getUserInfo } from "@/lib/services/session.server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { redirect } from "next/navigation";

// Reserved route segments that should not be treated as entity slugs
const RESERVED_ENTITY_SEGMENTS = ["new", "all-in-one", "export", "import", "relationships", "share", "tags"];

type RowsLoaderData = {
  t: TFunction;
  userId: string;
  tenantId: string | null;
  entity: EntityWithDetailsDto;
};
async function getLoader(props: IServerComponentsProps): Promise<RowsLoaderData> {
  await requireAuth();
  const params = (await props.params) ?? {};
  const request = props.request!;
  const tenantId = await getTenantIdOrNull({ request, params });

  // Check if the entity param is a reserved route segment
  if (params.entity && RESERVED_ENTITY_SEGMENTS.includes(params.entity)) {
    throw redirect("/404");
  }
  const unparsedData = await promiseHash({
    i18n: getServerTranslations(),
    userInfo: getUserInfo(),
    tenantId: getTenantIdOrNull({ request, params }),
    entity: db.entities.getEntityBySlug({ tenantId: tenantId ?? null, slug: params?.entity!, activeOnly: true }),
  });

  const data: RowsLoaderData = {
    t: unparsedData.i18n.t,
    userId: unparsedData.userInfo.userId,
    tenantId: unparsedData.tenantId ? unparsedData.tenantId : null,
    entity: unparsedData.entity,
  };
  return data;
}

type RowsActionData = RowsLoaderData & {
  form: FormData;
};
async function getAction(props: IServerComponentsProps): Promise<RowsActionData> {
  const params = (await props.params) ?? {};
  const request = props.request!;
  const data = await promiseHash({
    loader: getLoader({ request, params: Promise.resolve(params) }),
    form: request.formData(),
  });

  return {
    ...data.loader,
    form: data.form,
  };
}

export default {
  getLoader,
  getAction,
};
