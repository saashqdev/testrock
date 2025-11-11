import { Row } from "@prisma/client";
import { RowValueWithDetailsDto, RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";

export type RowDto = (
  | (Row & {
      values: RowValueWithDetailsDto[];
    })
  | RowWithDetailsDto
) & {
  metadata?: { [key: string]: any } | null;
};
