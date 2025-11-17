import { GetEntityData } from "@/utils/api/server/EntitiesApi";
import { GetRelationshipRowsData } from "@/utils/api/server/RowsApi";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { BlockVariableDto } from "../../../shared/variables/BlockVariableDto";

export type RowsNewBlockDto = {
  style: RowsNewBlockStyle;
  hiddenProperties: string[];
  variables: {
    entityName: BlockVariableDto;
    tenantId: BlockVariableDto;
    redirectTo: BlockVariableDto;
  };
  data: {
    entityData: GetEntityData;
    allEntities: EntityWithDetailsDto[];
    relationshipRows: GetRelationshipRowsData;
  } | null;
};

export type RowsNewBlockData = RowsNewBlockDto["data"];

export const RowsNewBlockStyles = [{ value: "form", name: "Form" }] as const;
export type RowsNewBlockStyle = (typeof RowsNewBlockStyles)[number]["value"];

export const defaultRowsNewBlock: RowsNewBlockDto = {
  style: "form",
  hiddenProperties: [],
  variables: {
    entityName: { type: "manual", value: "contact", required: true },
    tenantId: { type: "manual", value: null },
    redirectTo: { type: "manual", value: "/:id" },
  },
  data: null,
};
