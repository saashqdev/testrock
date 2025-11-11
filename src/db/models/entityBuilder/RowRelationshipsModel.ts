import { RowDto } from "./RowsModel";

export type RowRelationshipsModel = {
  id: string;
  rowId: string;
  relatedRowId: string;
  relationshipType: string;
};
