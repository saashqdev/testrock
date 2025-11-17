/* eslint-disable no-template-curly-in-string */
import CodeGeneratorHelper from "@/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

function generate({ entity }: { entity: EntityWithDetailsDto }): string {
  const { capitalized, name } = CodeGeneratorHelper.getNames(entity);
  let template = `import { RowPermissionsDto } from "@/lib/dtos/entities/RowPermissionsDto";
import { getServerTranslations } from "@/i18n/server";
import NotificationService from "@/modules/notifications/services/.server/NotificationService";
import { create } from "@/utils/api/server/RowCommentsApi";
import { setRowCommentReaction } from "~/utils/db/entities/rowCommentReaction.db.server";
import { getRowComment, updateRowComment } from "~/utils/db/entities/rowComments.db.server";
import { getRowById } from "~/utils/db/entities/rows.db.server";
import { LogWithDetails, getRowLogsById } from "~/utils/db/logs.db.server";
import { getUser } from "~/utils/db/users.db.server";
import { getUserRowPermission } from "@/lib/helpers/server/PermissionsService";
import RowHelper from "@/lib/helpers/RowHelper";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { getUserInfo } from "@/lib/services/session.server";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export type LoaderData = {
  metatags: MetaTagsDto;
  logs: LogWithDetails[];
  permissions: RowPermissionsDto;
};

export const loader = async (props: IServerComponentsProps): Promise<LoaderData> => {
  const params = await props.params;
  const request = props.request;
  const tenantId = await getTenantIdOrNull({ request, params });
  const userId = (await getUserInfo(request)).userId;
  const { t } = await getServerTranslations();
  const row = await getRowById(params.id!);
  const permissions = await getUserRowPermission(row!, tenantId, userId);
  const data: LoaderData = {
    metatags: [{ title: t("shared.activity") + " | " + process.env.APP_NAME }],
    logs: await getRowLogsById(params.id!),
    permissions,
  };
  return data;
};

export type ActionData = {
  success?: string;
  error?: string;
};

export const action = async (props: IServerComponentsProps): Promise<Response> => {
  const params = await props.params;
  const request = props.request;
  const { t } = await getServerTranslations();
  const { userId } = await getUserInfo(request);
  const tenantId = await getTenantIdOrNull({ request, params });
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const user = await getUser(userId);
  const entity = await db.entities.getEntityByName({ tenantId, name: "${name}" });
  if (action === "comment") {
    let comment = form.get("comment")?.toString();
    if (!comment) {
      return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
    }
    await create(params.id!, {
      comment,
      userId,
    });
    const item = await getRowById(params.id!);
    if (item!.createdByUser) {
      await NotificationService.send({
        channel: "my-rows",
        to: item!.createdByUser,
        notification: {
          from: { user },
          message: ${"`${user?.email} commented on ${RowHelper.getRowFolio(entity, item!)}`"},
          // action: {
          //   title: t("shared.view"),
          //   url: "",
          // },
        },
      });
    }
    return Response.json({ newComment: comment });
  } else if (action === "comment-reaction") {
    const rowCommentId = form.get("comment-id")?.toString();
    const reaction = form.get("reaction")?.toString();
    if (!rowCommentId || !reaction) {
      return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
    }
    await getRowComment(rowCommentId);
    await db.rowCommentReaction.setRowCommentReaction({
      createdByUserId: userId,
      rowCommentId,
      reaction,
    });
    return Response.json({ newCommentReaction: reaction });
  } else if (action === "comment-delete") {
    const rowCommentId = form.get("comment-id")?.toString();
    if (!rowCommentId) {
      return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
    }
    await updateRowComment(rowCommentId, { isDeleted: true });
    return Response.json({ deletedComment: rowCommentId });
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
