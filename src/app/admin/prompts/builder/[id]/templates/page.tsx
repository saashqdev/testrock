import { PromptFlowGroup } from "@prisma/client";
import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { PromptTemplateDto } from "@/modules/promptBuilder/dtos/PromptTemplateDto";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { RowAsJson } from "@/lib/helpers/TemplateApiHelper";
import TemplateApiService from "@/lib/helpers/server/TemplateApiService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import PromptBuilderTemplatesPageClient from "./PageClient";
import { db } from "@/db";

type LoaderData = {
  item: PromptFlowWithDetailsDto;
  allEntities: EntityWithDetailsDto[];
  promptFlowGroups: PromptFlowGroup[];
  inputEntityRows: RowWithDetailsDto[];
  sampleSourceRow: RowAsJson | null;
};

type ActionData = {
  error?: string;
  success?: string;
};

export default async function PromptBuilderTemplatesPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = await props.request!;
  const { t } = await getServerTranslations();
  const item = await db.promptFlows.getPromptFlow(params.id!);
  await verifyUserHasPermission("admin.prompts.update");
  if (!item) {
    redirect("/admin/prompts/builder");
  }
  const allEntities = await db.entities.getAllEntities(null);

  let inputEntityRows: RowWithDetailsDto[] = [];
  if (item.inputEntity) {
    inputEntityRows = await db.rows.getAllRows(item.inputEntity.id);
  }
  let sampleSourceRow: RowAsJson | null = null;
  const searchParams = new URL(request.url).searchParams;
  const sampleSourceRowId = searchParams.get("sampleSourceRowId");
  if (sampleSourceRowId) {
    sampleSourceRow = await TemplateApiService.getRowInApiFormatWithRecursiveRelationships({
      entities: allEntities,
      rowId: sampleSourceRowId,
      t,
      options: {
        exclude: ["id", "folio", "createdAt", "updatedAt", "createdByUser", "createdByApiKey"],
      },
    });
  }
  const data: LoaderData = {
    item,
    allEntities,
    promptFlowGroups: await db.promptFlowGroups.getAllPromptFlowGroups(),
    inputEntityRows,
    sampleSourceRow,
  };

  async function handleAction(formData: FormData): Promise<ActionData> {
    "use server";
    const actionType = formData.get("action")?.toString();
    const { t } = await getServerTranslations();

    if (actionType === "save-templates") {
      const templates: PromptTemplateDto[] = formData.getAll("templates[]").map((f) => {
        return JSON.parse(f.toString());
      });

      try {
        if (!item) {
          return { error: t("shared.notFound") };
        }
        await db.promptFlows.updatePromptFlow(item.id, {
          templates,
        });
        return { success: t("shared.saved") };
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.error(e.message);
        return { error: e.message };
      }
    } else {
      return { error: t("shared.invalidForm") };
    }
  }

  return <PromptBuilderTemplatesPageClient data={data} handleAction={handleAction} />;
}
