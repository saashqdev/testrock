import { UserDto } from "../accounts/UsersModel";
import { RowTagWithDetailsDto } from "./RowTagsModel";
import { Row, Tenant, RowValue, ApiKey, RowMedia, RowRelationship, SampleCustomEntity, RowPermission, RowValueMultiple, RowValueRange } from "@prisma/client";

export type RowsModel = {
  id: string;
  entityId: string;
};

export type RowDto = {
  id: string;
  entityId: string;
};

export type RowValueWithDetailsDto = RowValue & {
  media: RowMedia[];
  multiple: RowValueMultiple[];
  range: RowValueRange | null;
};
export type RowWithValuesDto = Row & {
  createdByUser: UserDto | null;
  createdByApiKey: ApiKey | null;
  values: RowValueWithDetailsDto[];
};
export type RowWithCreatedByDto = Row & {
  createdByUser: UserDto | null;
  createdByApiKey: ApiKey | null;
};
export type RowWithDetailsDto = Row & {
  createdByUser: UserDto | null;
  createdByApiKey: ApiKey | null;
  tenant: Tenant | null;
  values: RowValueWithDetailsDto[];
  tags: RowTagWithDetailsDto[];
  parentRows:
    | (RowRelationship & { parent: RowWithValuesDto })[]
    | (RowRelationship & {
        parent: RowWithValuesDto & {
          parentRows: (RowRelationship & {
            parent: { values: RowValueWithDetailsDto[] };
          })[];
          childRows: (RowRelationship & {
            child: { values: RowValueWithDetailsDto[] };
          })[];
        };
      })[];
  childRows: (RowRelationship & {
    child: RowWithValuesDto & {
      parentRows: (RowRelationship & {
        parent: { values: RowValueWithDetailsDto[] };
      })[];
      childRows: (RowRelationship & {
        child: { values: RowValueWithDetailsDto[] };
      })[];
    };
  })[];
  permissions: RowPermission[];
  sampleCustomEntity: SampleCustomEntity | null;
};
