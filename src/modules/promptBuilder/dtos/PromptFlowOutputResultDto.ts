import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";

export type PromptFlowOutputResultDto = {
  createdRows: {
    entity: EntityWithDetailsDto;
    row: RowWithDetailsDto;
    href: string;
  }[];
  updatedRows: {
    entity: EntityWithDetailsDto;
    row: RowWithDetailsDto;
    href: string;
  }[];
};
