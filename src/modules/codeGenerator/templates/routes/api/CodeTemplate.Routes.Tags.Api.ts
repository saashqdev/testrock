import CodeGeneratorHelper from "@/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

function generate({ entity }: { entity: EntityWithDetailsDto }): string {
  const { capitalized, name } = CodeGeneratorHelper.getNames(entity);
  return `import { EntityTag } from "@prisma/client";
import { LoaderFunctionArgs, ActionFunction } from "next/navigation";
import { Colors } from "@/lib/enums/shared/Colors";
import { getServerTranslations } from "@/i18n/server";
import { getEntityByName } from "~/utils/db/entities/entities.db.server";
import { getEntityTags, getEntityTag, createEntityTag, updateEntityTag, deleteEntityTag, getEntityTagById } from "~/utils/db/entities/entityTags.db.server";
import { getRowTag, createRowTag, deleteRowTags } from "~/utils/db/entities/rowTags.db.server";
import { getUserRowPermission } from "@/lib/helpers/server/PermissionsService";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { getUserInfo } from "@/lib/services/session.server";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { ${capitalized}Dto } from "../../dtos/${capitalized}Dto";
import { ${capitalized}Service } from "../../services/${capitalized}Service";

export namespace ${capitalized}RoutesTagsApi {
  export type LoaderData = {
    metatags: MetaTagsDto;
    item: ${capitalized}Dto;
    tags: EntityTag[];
  };
  export const loader = async (props: IServerComponentsProps) => {
    const { t } = await getServerTranslations();
    const tenantId = await getTenantIdOrNull({ request, params });
    const userId = (await getUserInfo(request)).userId;
    const entity = await getEntityByName({ tenantId, name: "${name}" });
    const item = await ${capitalized}Service.get(params.id!, {
      tenantId,
      userId,
    });
    if (!item) {
      return Response.json({ error: t("shared.notFound"), status: 404 });
    }
    const data: LoaderData = {
      metatags: [{ title: t("models.row.tags") + " | " + process.env.APP_NAME }],
      item,
      tags: await getEntityTags(entity.id),
    };
    return data;
  };

  export type ActionData = {
    success?: string;
    error?: string;
  };
  export const action = async (props: IServerComponentsProps) => {
    const { t } = await getServerTranslations();
    const tenantId = await getTenantIdOrNull({ request, params });
    const userId = (await getUserInfo(request)).userId;
    const form = await request.formData();
    const action = form.get("action")?.toString() ?? "";
    const entity = await getEntityByName({ tenantId, name: "${name}" });
    const item = await ${capitalized}Service.get(params.id!, {
      tenantId: await getTenantIdOrNull({ request, params }),
      userId: (await getUserInfo(request)).userId,
    });
    if (!item) {
      return Response.json({ error: t("shared.notFound"), status: 404 });
    }
    const rowPermissions = await getUserRowPermission(item.row, tenantId, userId);
    if (!rowPermissions.canUpdate) {
      return Response.json({ error: t("shared.unauthorized"), status: 403 });
    }
    if (action === "new-tag") {
      const value = form.get("tag-name")?.toString() ?? "";
      const color = Number(form.get("tag-color") ?? Colors.INDIGO);
      let tag = await getEntityTag(entity.id, value);
      if (!tag) {
        tag = await createEntityTag({
          entityId: entity.id,
          value,
          color,
        });
      }
      const existingTag = await getRowTag(params.id!, value);
      if (tag && !existingTag) {
        await createRowTag({
          rowId: params.id!,
          tagId: tag.id,
        });
      }
      return Response.json({});
    } else if (action === "edit-tag") {
      const id = form.get("tag-id")?.toString() ?? "";
      const value = form.get("tag-name")?.toString() ?? "";
      const color = Number(form.get("tag-color"));
      await updateEntityTag(id, {
        value,
        color,
      });
      return Response.json({});
    } else if (action === "set-tag") {
      const id = form.get("tag-id")?.toString() ?? "";
      const tagAction = form.get("tag-action")?.toString() ?? "";
      if (tagAction === "add") {
        await createRowTag({
          rowId: params.id!,
          tagId: id,
        });
      } else {
        await deleteRowTags(params.id!, id);
      }
      return Response.json({});
    } else if (action === "delete-tag") {
      const id = form.get("tag-id")?.toString() ?? "";
      const tag = await getEntityTagById(id);
      if (tag) {
        await deleteEntityTag(tag.id);
      }
      return Response.json({});
    } else {
      return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  };
}
`;
}

export default {
  generate,
};
