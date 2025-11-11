import { RowMedia, RowValueMultiple, RowValueRange } from "@prisma/client";
import { PropertyWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

export type RowValueDto = {
  id?: string | null;
  property: PropertyWithDetailsDto;
  propertyId: string;
  textValue?: string | undefined;
  numberValue?: number | undefined;
  dateValue?: Date | undefined;
  booleanValue?: boolean | undefined;
  selectedOption?: string | undefined;
  media?: RowMedia[];
  multiple?: RowValueMultiple[];
  range?: RowValueRange | undefined;
};
