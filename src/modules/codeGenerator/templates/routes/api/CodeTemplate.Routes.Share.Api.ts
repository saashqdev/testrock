/* eslint-disable no-template-curly-in-string */
import CodeGeneratorHelper from "@/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

function generate({ entity }: { entity: EntityWithDetailsDto }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  let template = `import { Tenant } from "@prisma/client";
import { LoaderFunctionArgs, ActionFunction } from "next/navigation";
import { RowAccess } from "@/lib/enums/entities/RowAccess";
import { getServerTranslations } from "@/i18n/server";
import { share, setAccess, del } from "@/utils/api/server/RowPermissionsApi";
import { getTenant, adminGetAllTenants } from "~/utils/db/tenants.db.server";
import { UserWithDetails, getUsersByTenant } from "~/utils/db/users.db.server";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { getUserInfo } from "@/lib/services/session.server";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { ${capitalized}Dto } from "../../dtos/${capitalized}Dto";
import { ${capitalized}Service } from "../../services/${capitalized}Service";

export type LoaderData = {
  metatags: MetaTagsDto;
  item: ${capitalized}Dto;
  tenants: Tenant[];
  users: UserWithDetails[];
};

export const loader = async (props: IServerComponentsProps): Promise<LoaderData> => {
  const params = await props.params;
  const request = props.request;
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdOrNull({ request, params });
  const userId = (await getUserInfo(request)).userId;
  const item = await ${capitalized}Service.get(params.id!, {
    tenantId,
    userId,
  });
  if (!item) {
    return Response.json({ error: t("shared.notFound"), status: 404 });
  }
  if (item.row.createdByUserId !== userId) {
    throw Error(t("shared.unauthorized"));
  }
  let tenants: Tenant[] = [];
  if (tenantId) {
    tenants.push((await getTenant(tenantId))!);
  } else {
    tenants = await adminGetAllTenants();
  }
  const data: LoaderData = {
    metatags: [{ title: t("shared.share") + " | " + process.env.APP_NAME }],
    item,
    tenants,
    users: (await getUsersByTenant(tenantId)).filter((f) => f.id !== userId),
  };
  return data;
};

export type ActionData = {
  success?: string;
  error?: string;
};

export const action = async (props: IServerComponentsProps) => {
  const params = await props.params;
  const request = props.request;
  const { t } = await getServerTranslations();
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const tenantId = await getTenantIdOrNull({ request, params });
  const userId = (await getUserInfo(request)).userId;
  const item = await ${capitalized}Service.get(params.id!, {
    tenantId,
    userId,
  });

  if (action === "share") {
    const type = form.get("type")?.toString() as "tenant" | "user" | "role" | "group" | "public";
    const id = form.get("id")?.toString() ?? "";
    const access = form.get("access")?.toString() as RowAccess;
    try {
      await share(item!.row, {
        type,
        id,
        access,
      });
      return Response.json({ success: t("shared.saved") });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400 });
    }
  } else if (action === "set-access") {
    const id = form.get("id")?.toString() ?? "";
    const access = form.get("access")?.toString() as RowAccess;
    await setAccess(id, access);
    return Response.json({ success: t("shared.saved") });
  } else if (action === "remove") {
    const id = form.get("id")?.toString() ?? "";
    await del(id);
    return Response.json({ success: t("shared.deleted") });
  } else {
    return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
  }
}
`;

  return template;
}

export default {
  generate,
};
