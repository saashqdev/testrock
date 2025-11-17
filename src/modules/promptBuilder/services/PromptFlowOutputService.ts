import { create } from "@/utils/api/server/RowsApi";
import { PromptFlowExecutionWithResultsDto } from "@/db/models/promptFlows/PromptFlowExecutionsModel";
import { PromptFlowOutputType } from "../dtos/PromptFlowOutputType";
import RowHelper from "@/lib/helpers/RowHelper";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { PromptFlowOutputResultDto } from "../dtos/PromptFlowOutputResultDto";
import EntityHelper from "@/lib/helpers/EntityHelper";
import { Params } from "@/types";
import PromptFlowOutputUtils from "../utils/PromptFlowOutputUtils";
import RowValueService, { RowValueUpdateDto } from "@/lib/helpers/server/RowValueService";
import { PropertyType } from "@/lib/enums/entities/PropertyType";
import { getNoCodeRoutes } from "@/utils/api/server/EntitiesApi";
import { db } from "@/db";

async function executeOutputs({
  request,
  params,
  flowExecution,
  row,
  session,
}: {
  request: Request;
  params: Params;
  flowExecution: PromptFlowExecutionWithResultsDto;
  row?: RowWithDetailsDto;
  session: { tenantId: string | null; userId?: string } | undefined;
}): Promise<PromptFlowOutputResultDto> {
  const result: PromptFlowOutputResultDto = {
    createdRows: [],
    updatedRows: [],
  };
  const outputs = await db.promptFlowOutput.getPromptFlowOutputs(flowExecution.flowId);
  if (!flowExecution.tenantId) {
    throw Error("Missing tenantId on flowExecution");
  }
  const allEntities = await db.entities.getAllEntities(flowExecution.tenantId);

  await Promise.all(
    outputs.map(async (output) => {
      const title = `${PromptFlowOutputUtils.getOutputTitle(output)} (${output.entity.name})`;
      if (output.mappings.length === 0) {
        throw Error(`No mappings for output: ${title}`);
      }
      let entity = await db.entities.getEntityById({ id: output.entityId, tenantId: flowExecution.tenantId });
      if (!entity) {
        throw Error(`Could not find entity: ${output.entityId}`);
      }
      const type: PromptFlowOutputType = output.type as PromptFlowOutputType;
      // eslint-disable-next-line no-console
      console.log({ mappings: output.mappings });
      try {
        // eslint-disable-next-line no-console
        console.log({ type });
        switch (type) {
          case "createRow": {
            const createValues = RowHelper.getRowPropertiesFromForm({
              entity,
              values: output.mappings.map((f) => {
                const value = flowExecution.results.find((r) => r.templateId === f.promptTemplateId);
                return {
                  name: f.property.name,
                  value: value?.error ?? value?.response ?? "",
                };
              }),
            });
            // eslint-disable-next-line no-console
            console.log({
              entity,
              tenantId: flowExecution.tenantId,
              userId: flowExecution.userId ?? undefined,
              rowValues: createValues.dynamicProperties.map((f) => {
                return {
                  name: f.property.name,
                  value: f.textValue,
                };
              }),
            });
            const row = await create({
              entity,
              tenantId: flowExecution.tenantId,
              userId: flowExecution.userId ?? undefined,
              rowValues: createValues,
              request,
            });
            // eslint-disable-next-line no-console
            console.log({ row });

            const routes = EntityHelper.getRoutes({ routes: getNoCodeRoutes({ request, params }), entity, item: row });

            result.createdRows.push({
              entity,
              row,
              href: routes?.overview ?? "",
            });
            break;
          }
          case "updateCurrentRow": {
            if (!row) {
              throw Error(`No rows to update`);
            }
            const values: RowValueUpdateDto[] = [];
            output.mappings.forEach((f) => {
              const value = flowExecution.results.find((r) => r.templateId === f.promptTemplateId);
              if (value?.response) {
                if (f.property.type === PropertyType.TEXT) {
                  values.push({
                    name: f.property.name,
                    textValue: value.response,
                  });
                } else if (f.property.type === PropertyType.NUMBER) {
                  values.push({
                    name: f.property.name,
                    numberValue: Number(value.response),
                  });
                } else {
                  throw Error(`Property type not supported: ${PropertyType[f.property.type]}`);
                }
              }
            });
            const item = await RowValueService.update({
              entity,
              row,
              values,
              session,
            });
            const routes = EntityHelper.getRoutes({ routes: getNoCodeRoutes({ request, params }), entity, item });
            result.updatedRows.push({
              entity,
              row,
              href: routes?.overview ?? "",
            });
            break;
          }
          case "createChildRow": {
            if (!row) {
              throw Error(`No rows to create child row`);
            }
            const parentRow = row;
            const parentEntity = allEntities.find((e) => e.id === parentRow.entityId);
            const relationship = entity.parentEntities.find((r: any) => r.parentId === parentEntity?.id);
            // eslint-disable-next-line no-console
            console.log({
              parentEntities: entity.parentEntities.map((f: any) => {
                return { parent: f.parent.name, child: f.child.name };
              }),
              parentEntity: {
                id: parentEntity?.id,
                name: parentEntity?.name,
              },
              entity: {
                id: entity.id,
                name: entity.name,
              },
            });
            if (!relationship) {
              throw Error(`Could not find relationship for parent row (${parentEntity?.name})`);
            }
            let createValues = RowHelper.getRowPropertiesFromForm({
              entity,
              values: output.mappings.map((f) => {
                const value = flowExecution.results.find((r) => r.templateId === f.promptTemplateId);
                return {
                  name: f.property.name,
                  value: value?.error ?? value?.response ?? "",
                };
              }),
            });
            createValues.parentRows = [
              {
                relationshipId: relationship.id,
                parentId: parentRow.id,
              },
            ];
            const createdRow = await create({
              entity,
              tenantId: flowExecution.tenantId,
              userId: flowExecution.userId ?? undefined,
              rowValues: createValues,
              request,
            });

            const routes = EntityHelper.getRoutes({ routes: getNoCodeRoutes({ request, params }), entity, item: createdRow });
            result.createdRows.push({
              entity,
              row: createdRow,
              href: routes?.overview ?? "",
            });

            break;
          }
        }
      } catch (e: any) {
        throw Error(`[${title}] ${e.message}`);
      }
    })
  );

  return result;
}

export default {
  executeOutputs,
};
