/* eslint-disable no-template-curly-in-string */
import CodeGeneratorHelper from "@/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

function generate({ entity }: { entity: EntityWithDetailsDto }): string {
  const { capitalized, name } = CodeGeneratorHelper.getNames(entity);
  const imports: string[] = [
    `import { LoaderFunctionArgs, ActionFunction, redirect } from "next/navigation";
import { RowPermissionsDto } from "@/lib/dtos/entities/RowPermissionsDto";
import { getServerTranslations } from "@/i18n/server";
import NotificationService from "@/modules/notifications/services/.server/NotificationService";
import UrlUtils from "@/utils/app/UrlUtils";
import { getEntityByName } from "~/utils/db/entities/entities.db.server";
import { getRowById } from "~/utils/db/entities/rows.db.server";
import { getUser } from "~/utils/db/users.db.server";
import { getUserRowPermission } from "@/lib/helpers/server/PermissionsService";
import RowHelper from "@/lib/helpers/RowHelper";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { getUserInfo } from "@/lib/services/session.server";
import NumberUtils from "@/lib/shared/NumberUtils";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";`,
  ];

  if (entity.hasTasks) {
    imports.push(
      `import { RowTaskWithDetails, getRowTasks, createRowTask, getRowTask, updateRowTask, deleteRowTask } from "~/utils/db/entities/rowTasks.db.server";`
    );
  }

  imports.push(`import { ${capitalized}Dto } from "../../dtos/${capitalized}Dto";
import ${capitalized}Helpers from "../../helpers/${capitalized}Helpers";
import { ${capitalized}Service } from "../../services/${capitalized}Service";`);

  let template = `
export type LoaderData = {
  metatags: MetaTagsDto;
  item: ${capitalized}Dto;
  permissions: RowPermissionsDto;
  {TASKS_LOADER_INTERFACE}
};

export const loader = async (props: IServerComponentsProps) => {
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
  const permissions = await getUserRowPermission(item.row, tenantId, userId);
  if (!permissions.canRead) {
    return Response.json({ error: t("shared.unauthorized"), status: 404 });
  }
  const data: LoaderData = {
    metatags: [{ title: item.prefix + "-" + NumberUtils.pad(item.row.folio ?? 0, 4) + " | " + process.env.APP_NAME }],
    item,
    permissions,
    {TASKS_LOADER_DATA}
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
  const user = await getUser(userId);
  const entity = await getEntityByName({ tenantId, name: "${name}" });
  const item = await getRowById(params.id!);
  if (!item) {
    return Response.json({ error: t("shared.notFound"), status: 404 });
  }
  if (action === "edit") {
    try {
      const { {PROPERTIES_UPDATE_NAMES} } = ${capitalized}Helpers.formToDto(form);
      await ${capitalized}Service.update(
        params.id!,
        { {PROPERTIES_UPDATE_NAMES} },
        { tenantId, userId }
      );
      if (item.createdByUser) {
        await NotificationService.send({
          channel: "my-rows",
          to: item.createdByUser,
          notification: {
            from: { user },
            message: ${"`${user?.email} updated ${RowHelper.getRowFolio(entity, item)}`"},
            // action: {
            //   title: t("shared.view"),
            //   url: "",
            // },
          },
        });
      }
      return Response.json({ success: t("shared.updated") });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400 });
    }
  } else if (action === "delete") {
    try {
      await ${capitalized}Service.del(params.id!, {
        tenantId,
        userId,
      });
      if (item.createdByUser) {
        await NotificationService.send({
          channel: "my-rows",
          to: item.createdByUser,
          notification: {
            from: { user },
            message: ${"`${user?.email} deleted ${RowHelper.getRowFolio(entity, item)}`"},
          },
        });
      }
      return redirect(UrlUtils.getParentRoute(new URL(request.url).pathname));
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400 });
    }
  } {TASKS_ACTIONS}
  else {
    return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};
`;

  const propertiesUpdateNames: string[] = [];
  entity.properties
    .filter((f) => f.showInCreate && !f.isDefault)
    .forEach((property) => {
      propertiesUpdateNames.push(property.name);
    });
  template = template.split("{PROPERTIES_UPDATE_NAMES}").join(propertiesUpdateNames.join(", "));

  const tasksLoaderInterface: string[] = [];
  const tasksLoaderData: string[] = [];
  if (entity.hasTasks) {
    tasksLoaderInterface.push("tasks: RowTaskWithDetails[]");
    tasksLoaderData.push("tasks: await getRowTasks(params.id!),");
  }
  template = template.split("{TASKS_LOADER_INTERFACE}").join(tasksLoaderInterface.join("\n      "));
  template = template.split("{TASKS_LOADER_DATA}").join(tasksLoaderData.join("\n      "));

  let tasksActions = "";
  if (entity.hasTasks) {
    tasksActions = 
      'else if (action === "task-new") {\n' +
      '      const taskTitle = form.get("task-title")?.toString();\n' +
      '      if (!taskTitle) {\n' +
      '        return Response.json({ error: t("shared.invalidForm") }, { status: 400 });\n' +
      '      }\n' +
      '      const task = await createRowTask({\n' +
      '        createdByUserId: userId,\n' +
      '        rowId: item.id,\n' +
      '        title: taskTitle,\n' +
      '      });\n' +
      '      return Response.json({ newTask: task });\n' +
      '    } else if (action === "task-complete-toggle") {\n' +
      '      const taskId = form.get("task-id")?.toString() ?? "";\n' +
      '      const task = await getRowTask(taskId);\n' +
      '      if (task) {\n' +
      '        if (task.completed) {\n' +
      '          await updateRowTask(taskId, {\n' +
      '            completed: false,\n' +
      '            completedAt: null,\n' +
      '            completedByUserId: null,\n' +
      '          });\n' +
      '        } else {\n' +
      '          await updateRowTask(taskId, {\n' +
      '            completed: true,\n' +
      '            completedAt: new Date(),\n' +
      '            completedByUserId: userId,\n' +
      '          });\n' +
      '        }\n' +
      '      }\n' +
      '      return Response.json({ completedTask: taskId });\n' +
      '    } else if (action === "task-delete") {\n' +
      '      const taskId = form.get("task-id")?.toString() ?? "";\n' +
      '      const task = await getRowTask(taskId);\n' +
      '      if (task) {\n' +
      '        await deleteRowTask(taskId);\n' +
      '      }\n' +
      '      return Response.json({ deletedTask: taskId });\n' +
      '    }';
  }
  template = template.split("{TASKS_ACTIONS}").join(tasksActions);

  const uniqueImports = [...new Set(imports)];
  return [...uniqueImports, template].join("\n");
}

export default {
  generate,
};
